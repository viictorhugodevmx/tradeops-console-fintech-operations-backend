# TradeOps Console · Angular Fintech Operations Lab · Backend

Backend del laboratorio **TradeOps Console · Angular Fintech Operations Lab**.

Este proyecto simula una consola operativa fintech interna para gestionar solicitudes de operación, asignación de operadores, revisión de compliance, bitácora de actividad y resumen operativo tipo dashboard.

---

## Stack

- Node.js 20.19.4
- TypeScript 5.9.2
- Express
- MongoDB 6.0.20
- Mongoose
- JWT
- bcryptjs

---

## Requisitos

Antes de correr el proyecto, asegúrate de tener instalado:

- Node.js 20.19.4
- npm
- MongoDB 6.0.20
- mongosh
- Postman

---

## Instalación

Clona el proyecto o entra a la carpeta `back` y ejecuta:

```bash
npm install
```

Variables de entorno

Crea un archivo .env en la raíz de back/ con este contenido:

PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tradeops_console
JWT_SECRET=tradeops_dev_secret
Scripts disponibles
Levantar servidor en desarrollo
npm run dev
Build de producción
npm run build
Levantar build compilado
npm run start
Correr seed de datos demo
npm run seed
Seed demo

El seed crea:

4 usuarios demo
3 trade requests demo
activity logs iniciales

Usuarios demo:

admin@tradeops.com
operator@tradeops.com
compliance@tradeops.com
viewer@tradeops.com

Password para todos:

123456
Endpoints principales
Health
GET /api/health
Auth
POST /api/auth/login
GET /api/auth/me
Trade Requests
GET /api/trade-requests
GET /api/trade-requests/:id
POST /api/trade-requests
PATCH /api/trade-requests/:id
PATCH /api/trade-requests/:id/status
PATCH /api/trade-requests/:id/assign
PATCH /api/trade-requests/:id/compliance
Activity
GET /api/trade-requests/:id/activity
Dashboard
GET /api/dashboard/summary
Flujo funcional cubierto
login con JWT
middleware de autenticación
endpoint /me
listado y detalle de solicitudes
creación de solicitud
edición controlada
cambio de estatus
asignación de operador
revisión compliance
timeline de actividad
dashboard summary
Reglas de negocio principales
Status

Valores permitidos:

pending
assigned
in_review
approved
rejected
Compliance status

Valores permitidos:

pending
approved
rejected
needs_info
Assignment
solo usuarios con rol operator pueden ser asignados
si una solicitud está en pending, al asignar pasa a assigned
no se puede asignar una solicitud approved o rejected
Compliance
solo se revisan solicitudes en in_review
si compliance aprueba, status pasa a approved
si compliance rechaza, status pasa a rejected
si compliance pide más información, status permanece en in_review
Estructura del proyecto
src/
  config/
    database.ts
    env.ts
  middleware/
    auth.middleware.ts
  modules/
    activity-logs/
    auth/
    dashboard/
    seed/
    trade-requests/
    users/
  types/
    express/
      index.d.ts
  utils/
    generate-trade-folio.ts
  app.ts
  server.ts
Colección de Postman

Se recomienda mantener una colección por pasos, con folders separados por cada avance del backend.

Ejemplo:

Paso 0 · Bootstrap Backend
Paso 1 · Mongo Connection + Health Check
Paso 2 · Models + Seed Data
Paso 3 · Auth Login JWT
Paso 4 · JWT Middleware + Auth Me
Paso 5 · Trade Requests List + Detail
Paso 6 · Create Trade Request
Paso 7 · Update Trade Request
Paso 8 · Update Trade Request Status
Paso 9 · Assign Trade Request
Paso 10 · Compliance Review
Paso 11 · Trade Request Activity Timeline
Paso 12 · Dashboard Summary
Notas
Este backend fue construido primero para después consumirlo desde Angular.
El proyecto prioriza claridad, realismo y velocidad de implementación.
No incluye refresh tokens, websockets, exportaciones ni integraciones externas.
Está pensado como base de entrenamiento para un frontend enterprise en Angular.

---

## 3) Posibles ruidos que te anticipo aquí
### A) querer subir `.env`
No lo subas. Ya queda protegido por `.gitignore`.

### B) querer subir `node_modules`
No lo subas. También queda protegido.

### C) GitHub te muestra demasiados archivos
Normalmente pasa si hiciste `git add .` antes de crear `.gitignore`.

Si pasa eso, desde `back/` haz:

```bash id="s6h4wr"
git rm -r --cached node_modules
git rm -r --cached dist
git rm --cached .env

Luego:

git status