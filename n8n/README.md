# Cero Fugas · Cerebro IA — Sistema n8n

Asistente de IA que atiende WhatsApp 24/7 para la inmobiliaria **José Greco** (Catamarca): responde, resuelve dudas, **manda propiedades con fotos**, **califica** al lead, sabe **cuándo derivar** al vendedor y **sube al CRM un resumen** de todo lo hablado.

- **Topología:** vía Chatwoot (bandeja unificada). El vendedor ve la charla y puede tomar el control.
- **Cerebro:** OpenAI (GPT‑4o) con tools y memoria por conversación.
- **Saliente:** Evolution API (WhatsApp). Los tiempos del bot NO ensucian la métrica del vendedor (entra como Agent Bot).

## Archivos

| Archivo | Qué es |
|---|---|
| `CEREBRO-system-message.md` | El system message completo (ya viene embebido en el workflow). Editalo acá y volvé a pegarlo si querés afinarlo. |
| `workflow-cero-fugas.json` | El workflow importable a n8n. |
| `docker-compose.yml` | Stack self-hosted: n8n (main + worker) + Redis + Postgres. |
| `.env.example` | Variables del stack Docker. Copialo a `.env` y completalo. |
| `README.md` | Esto. |

Endpoints nuevos agregados a la app `admin/` (los "llamados" que usa la IA):

| Ruta | Qué hace |
|---|---|
| `GET  /api/properties` | (ya existía) Busca propiedades → tool `buscar_propiedades`. |
| `POST /api/leads/calificar` | Criterios → score + temperatura → tool `calificar_lead`. |
| `POST /api/leads/upsert` | Crea/actualiza el lead por teléfono con el resumen → tool `guardar_lead`. |
| `POST /api/whatsapp/send-text` | Manda texto por Evolution → respuesta al cliente. |
| `POST /api/whatsapp/send-property` | Manda **fotos + info** de la propiedad por Evolution → tool `enviar_propiedad`. |
| `POST /api/whatsapp/handoff` | Asigna vendedor por zona en Chatwoot + nota privada + frena el bot → tool `derivar_a_vendedor`. |

## Diagrama del flujo

```
Cliente (WhatsApp/IG/FB)
      │
   Evolution API ──── conectado como canal ────┐
      │                                         │
   ┌──▼──────────── Chatwoot (bandeja) ─────────┘
   │   Agent Bot → webhook "message_created"
   │        │
   │        ▼
   │   ┌──────────────────── n8n ─────────────────────┐
   │   │ Webhook → ¿Procesar? (entrante + bot activo)  │
   │   │        → Contexto (tel, convId, adminUrl,...)  │
   │   │        → AI Agent (OpenAI + memoria + tools)   │
   │   │              ├─ buscar_propiedades             │
   │   │              ├─ enviar_propiedad  (FOTOS) ─────┼──► Evolution
   │   │              ├─ calificar_lead                 │
   │   │              ├─ guardar_lead ──────────────────┼──► CRM (resumen)
   │   │              └─ derivar_a_vendedor ────────────┼──► Chatwoot (asigna+nota+frena)
   │   │        → Responder al cliente ─────────────────┼──► Evolution (texto)
   │   └───────────────────────────────────────────────┘
   │
   └──► El vendedor ve TODO en Chatwoot y recibe el lead 🔥 calificado con resumen
```

## Requisitos

1. **La app `admin/` desplegada y accesible por HTTP** (Vercel o server propio). Su URL pública es `adminUrl`.
2. **Evolution API** corriendo, con una instancia conectada al WhatsApp de la inmobiliaria.
3. **Chatwoot** corriendo, con Evolution API conectado como canal (integración Chatwoot de Evolution).
4. **n8n** (cloud o self-host) con una **credencial de OpenAI**.

## Variables de entorno (app `admin/`)

Agregá al `.env` de `admin/`:

```bash
# CRM (ya existía)
DATABASE_URL="file:./dev.db"

# Evolution API (WhatsApp saliente)
EVOLUTION_URL="https://evolution.josegreco.com.ar"
EVOLUTION_API_KEY="tu-apikey-global"
EVOLUTION_INSTANCE="josegreco"

# Chatwoot (para la derivación: asignar + nota privada + frenar bot)
CHATWOOT_URL="https://chatwoot.josegreco.com.ar"
CHATWOOT_ACCOUNT_ID="1"
CHATWOOT_ACCOUNT_TOKEN="tu-account-token"

# Secreto compartido con n8n (protege las rutas que mandan WhatsApp)
N8N_SHARED_SECRET="un-secreto-largo-y-random"
```

> Si `N8N_SHARED_SECRET` está vacío, las rutas quedan abiertas (solo para desarrollo). En producción, ponelo.

## Setup paso a paso

### 1. App
- Cargá las env vars de arriba y desplegá `admin/`. Anotá su URL pública (ej. `https://inmobilaria.vercel.app`).

### 2. Evolution + Chatwoot
- Conectá la instancia de Evolution a tu número de WhatsApp.
- Activá la **integración de Evolution con Chatwoot** para que los mensajes entren a la bandeja y los salientes se reflejen.

### 3. Chatwoot Agent Bot
- En Chatwoot: **Settings → Integrations → Agent Bots → New**.
- Webhook URL: la URL de producción del webhook de n8n (paso 4), ej. `https://TU-N8N/webhook/cerebro-inmobiliaria`.
- Asigná ese Agent Bot al **inbox** de WhatsApp.
- Creá un **custom attribute** de conversación llamado `ia_activa` (tipo checkbox/boolean). El bot solo responde si NO está en `false`.

### 4. Levantar n8n + Redis + Postgres (Docker)

El bot corre sobre un stack self-hosted: **n8n (main + worker en queue mode) + Redis + Postgres**. Redis hace dos cosas: la **cola de ejecuciones** de n8n y la **memoria de las conversaciones** del bot (así no se pierden si n8n reinicia).

```bash
cd n8n
cp .env.example .env          # completá POSTGRES_PASSWORD, N8N_ENCRYPTION_KEY, WEBHOOK_URL
docker compose up -d          # levanta postgres, redis, n8n y n8n-worker
```

- Generá la clave de cifrado: `openssl rand -hex 32` (va en `N8N_ENCRYPTION_KEY`).
- `WEBHOOK_URL` tiene que ser la **URL pública** por la que Chatwoot llega a n8n. En local usá un túnel (Cloudflare Tunnel / ngrok); en server, tu dominio (ej. `https://n8n.josegreco.com.ar`).
- Entrá a `http://localhost:5678` y creá tu usuario **owner**.

> La Postgres de este compose es **solo de n8n** (guarda workflows/credenciales/ejecuciones). La base del CRM sigue siendo **Neon**, aparte.

### 5. Importar y configurar el workflow
1. En n8n: **Import from File** → subí `workflow-cero-fugas.json`.
2. Nodo **OpenAI (cerebro)** → elegí/creá la credencial de OpenAI (modelo `gpt-4o`, configurable).
3. Nodo **Memoria (Redis)** → creá una credencial **Redis** con host `redis`, puerto `6379` (así se llama el servicio en el compose).
4. Nodo **Contexto** → editá dos valores:
   - `adminUrl` → la URL pública de la app (sin `/` final).
   - `secret` → el mismo valor de `N8N_SHARED_SECRET` del `.env` de la app.
5. **Guardá y activá** el workflow. Copiá la URL del webhook **de producción** y pegala en el Agent Bot (paso 3).

### 6. Takeover (el vendedor toma el control)
- Cuando la IA deriva un caliente, `derivar_a_vendedor` pone `ia_activa=false` y el bot deja de responder esa conversación.
- Si un vendedor quiere tomar una charla manualmente, que ponga `ia_activa=false` en la conversación (o desde un botón/macro de Chatwoot). Para devolvérsela al bot, `ia_activa=true`.

## Los tools de la IA

| Tool | Cuándo lo usa la IA |
|---|---|
| `buscar_propiedades` | Antes de afirmar precio/disponibilidad. Devuelve fotos e info. |
| `enviar_propiedad` | Interés real en una propiedad → manda **fotos + info** por WhatsApp. |
| `calificar_lead` | Tiene señal de los 6 criterios → score + temperatura. |
| `guardar_lead` | El lead avanza / antes de derivar → escribe el resumen en el CRM. |
| `derivar_a_vendedor` | Lead 🔥, pide humano, o algo fuera de alcance → asigna al vendedor de la zona. |

Ruteo de derivación (por área + zona):
- **Ventas · B° Norte / Piedra Blanca →** Lucas Agüero
- **Ventas · Valle Viejo / Choya / Centro →** Nahuel Paz
- **Alquileres (todas) →** Rocío Nieva

## Probar los endpoints (sin WhatsApp)

```bash
# Calificar (función pura)
curl -X POST "$ADMIN/api/leads/calificar" -H "Content-Type: application/json" \
  -d '{"criterios":{"presupuesto":true,"operacion":true,"zona":true,"urgencia":true,"financiacion":true,"visita":true}}'
# → {"score":100,"temp":"caliente","emoji":"🔥",...}

# Upsert lead
curl -X POST "$ADMIN/api/leads/upsert" -H "Content-Type: application/json" -H "x-n8n-secret: $SECRET" \
  -d '{"telefono":"+54 383 415-2280","nombre":"Marina","estado":"contactado","resumenIA":"[VENTAS·🔥·92] ..."}'

# Mandar propiedad con fotos (requiere Evolution configurado)
curl -X POST "$ADMIN/api/whatsapp/send-property" -H "Content-Type: application/json" -H "x-n8n-secret: $SECRET" \
  -d '{"telefono":"+54 383 415-2280","propertyId":1}'
```

## Notas de producción

- **Base de datos:** el CRM viene con SQLite. En Vercel el filesystem es efímero — para persistir, migrá `DATABASE_URL` a Postgres (Neon/Supabase). Prisma soporta ambos.
- **Números de Argentina:** WhatsApp usa `54 9 <área> <línea>`. `normalizarNumero()` arma ese formato automáticamente. Si un número te falla, revisá que el área no lleve el `0` ni el `15`.
- **Memoria:** el workflow usa **Redis Chat Memory** (nodo *Memoria (Redis)*), con `sessionKey` = id de conversación. Persiste entre reinicios y la comparten los workers. El Redis del compose sirve para esto y para la cola de n8n.
- **Modelo:** el nodo usa `gpt-4o`. Podés bajar a `gpt-4o-mini` para abaratar, o subir de modelo para más calidad.
- **System message:** vive completo en `CEREBRO-system-message.md` y ya está embebido en el nodo AI Agent. Si lo editás, volvé a pegarlo en el campo *System Message* del nodo.
