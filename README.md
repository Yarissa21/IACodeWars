# Bufete Popular — Gestión de expedientes

Aplicación web para organizar los expedientes de un bufete popular ficticio que brinda asesoría gratuita.

> **Aviso:** todos los datos son ficticios. Esta aplicación no ofrece asesoría jurídica.

## Ficha de análisis

### Problema

El bufete atiende a muchas personas y lleva el control de sus casos de forma dispersa. Esto dificulta saber en qué estado está cada expediente, quién lo atiende, qué se ha hecho y por qué se cerró. Se necesita una herramienta sencilla para abrir, consultar, buscar, dar seguimiento y cerrar expedientes dejando un historial de todo lo ocurrido.

### Usuario

Personal del bufete (abogados voluntarios, estudiantes practicantes y personal de apoyo) que registra y da seguimiento a los casos. No hay roles ni inicio de sesión: quien usa la app indica su nombre como responsable activo.

### Prioridades

1. Abrir expedientes con los datos mínimos obligatorios y validaciones claras.
2. Consultar el listado y buscar por identificador o por nombre/alias.
3. Ver el detalle de cada expediente con su historial en orden cronológico.
4. Registrar actividades y mover el expediente por sus estados respetando las reglas.
5. Mantener una interfaz en español, simple y consistente.

### Datos principales

| Campo | Descripción |
| --- | --- |
| Identificador | Autogenerado y único: `EXP-0001`, `EXP-0002`, ... |
| Solicitante | Nombre o alias de la persona (obligatorio) |
| Descripción | Descripción breve del caso (obligatoria) |
| Responsable | Persona del bufete a cargo (obligatorio) |
| Categoría | Opcional: civil, familiar o laboral |
| Estado | Abierto, En seguimiento o Cerrado |
| Apertura | Fecha y hora automáticas |
| Cierres | Lista de todos los cierres, cada uno con fecha, hora y motivo |
| Historial | Entradas de apertura, actividad o cambio de estado (las de cierre y reapertura incluyen su motivo) |

Cada actividad tiene descripción obligatoria, tipo opcional y fecha y hora automáticas.

Los cierres se guardan en su propia tabla `cierres` (id, número de expediente, fecha y motivo). Cada cierre agrega una fila nueva; ninguna se modifica ni se borra, así que se conserva el historial completo de cierres aunque el expediente se reabra.

### Reglas

- Para abrir un expediente son obligatorios solicitante, descripción y responsable; se rechazan valores vacíos o con solo espacios.
- Todo expediente nuevo inicia en estado **Abierto**.
- La apertura y cada cambio de estado quedan registrados como entradas propias del historial.
- Solo se agregan actividades a expedientes **Abierto** o **En seguimiento**.
- **Abierto → En seguimiento** cuando el usuario lo solicita.
- **En seguimiento → Cerrado** solo si existe al menos una actividad y se indica un motivo de cierre no vacío.
- **Cerrado → En seguimiento** (reabrir) exige un motivo no vacío. Conserva identificador, datos, actividades y todos los cierres previos, y agrega al historial un evento con fecha, hora, motivo y la transición.
- La reapertura se rechaza si el expediente está **Abierto** o **En seguimiento**; la regla se valida en el backend.
- Después de reabrir se pueden registrar actividades y volver a cerrar con las condiciones originales; el nuevo cierre se suma a los anteriores.
- No hay otras transiciones. Un expediente **Cerrado** solo se consulta o se reabre; no admite actividades.
- La búsqueda por identificador o nombre/alias no distingue mayúsculas (ni tildes) y avisa cuando no hay resultados.
- El historial se muestra en orden cronológico y distingue visualmente apertura, actividades, cambios de estado, cierres y reaperturas.

### Supuestos

- Los expedientes, sus cierres y su historial se guardan en PostgreSQL a través de una API propia (`backend/`); todos los usuarios que usen la misma API ven los mismos datos.
- Las reglas de negocio se validan en el servidor, no solo en la interfaz.
- El nombre del responsable activo se recuerda en una cookie del navegador durante 7 días y solo sirve para precargar el campo Responsable al abrir un expediente.
- No hay inicio de sesión, roles ni rutas protegidas.
- Los datos que se ingresen son ficticios y no se usan para dar asesoría real.
- Para cerrar de nuevo un expediente reabierto basta con que exista al menos una actividad en el expediente; no tiene que ser posterior a la reapertura.

### Responsabilidades de los integrantes

| Integrante | Responsabilidad |
| --- | --- |
| _Por definir_ | _Por definir_ |
| _Por definir_ | _Por definir_ |

### Integración de aportes

- Un único repositorio en GitHub con la rama `main` como versión entregable.
- Cada aporte se integra como un commit por funcionalidad completa, usando Conventional Commits en español (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- Antes de integrar, cada integrante verifica que `npm run build` pase en `frontend/` y que `npm run typecheck` y `npm run build` pasen en `backend/`, para que la app siempre compile.
- Las correcciones a un módulo ya entregado se integran en un commit aparte con `fix:`.
- No se reescriben commits ya publicados (sin amend, rebase ni squash); los cambios de requisitos van en commits nuevos.
- Este README es la única documentación del repositorio; no hay README por carpeta.

## Instrucciones de ejecución y requisitos

### Requisitos

- Node.js 22 o superior (probado con Node.js 24) y npm.
- PostgreSQL 14 o superior instalado y en ejecución (probado con PostgreSQL 18).

### 0. Base de datos

Con PostgreSQL en ejecución, crea la base de datos (por ejemplo desde `psql -U postgres` o pgAdmin):

```sql
CREATE DATABASE bufete;
```

### Estructura

| Carpeta | Contenido |
| --- | --- |
| `frontend/` | Interfaz con React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query, Zustand, react-hook-form con Zod, Axios y react-hot-toast |
| `backend/` | API con Hono, TypeScript, Drizzle ORM, postgres.js y Zod |

### 1. Backend (primera terminal)

Copia `backend/.env.example` a `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` y ajusta en `DATABASE_URL` la contraseña (y el usuario si no es `postgres`) de tu PostgreSQL:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/bufete
PORT=3000
```

Instala las dependencias, crea las tablas y arranca la API:

```bash
cd backend
npm install
npm run db:push
npm run dev
```

La API queda en `http://localhost:3000`. Para comprobar la conexión abre `http://localhost:3000/api/salud`.

| Script | Uso |
| --- | --- |
| `npm run dev` | API en modo desarrollo con recarga automática |
| `npm run build` / `npm start` | Genera `dist/` y la ejecuta |
| `npm run typecheck` | Revisión de tipos con TypeScript |
| `npm run db:push` | Aplica el esquema de Drizzle en la base de datos |
| `npm test` | Pruebas con Vitest |

### 2. Frontend (segunda terminal)

Con la API en ejecución:

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección que muestra Vite (normalmente `http://localhost:5173`). Vite redirige las peticiones a `/api` hacia `http://localhost:3000`. Para la versión de producción: `npm run build` y `npm run preview`.

### 3. Pruebas

```bash
cd backend
npm test
```

Ejecuta con Vitest las pruebas de las reglas de dominio en `backend/src/domain` (apertura, búsqueda, actividades, seguimiento, cierre y reapertura).

### API

| Método y ruta | Descripción |
| --- | --- |
| `GET /api/expedientes?q=` | Listado; `q` filtra por identificador o nombre/alias |
| `GET /api/expedientes/:codigo` | Detalle con `cierres` e `historial` en orden cronológico |
| `POST /api/expedientes` | Abre un expediente (`solicitante`, `descripcion`, `responsable`, `categoria`) |
| `POST /api/expedientes/:codigo/actividades` | Registra una actividad (`descripcion`, `tipo`) |
| `POST /api/expedientes/:codigo/seguimiento` | Abierto → En seguimiento |
| `POST /api/expedientes/:codigo/cierre` | En seguimiento → Cerrado (`motivo`) |
| `POST /api/expedientes/:codigo/reapertura` | Cerrado → En seguimiento (`motivo`) |

Los errores se responden como `{"mensaje": "..."}` en español: 400 datos inválidos, 404 no existe, 409 acción no permitida en el estado actual, 503 sin conexión con la base de datos.

## Decisiones con IA

| Decisión o necesidad | Aporte de la IA | Decisión del equipo y razón | Cómo se comprobó |
| --- | --- | --- | --- |
| Persistencia de los expedientes | En la guía inicial, la IA planteó guardar los expedientes en `localStorage` mediante un adapter de Axios, suficiente para el alcance de una app sin backend. | Usar PostgreSQL con un backend en Hono y Drizzle ORM, para tener persistencia real y que las reglas de negocio se validen en el servidor y no solo en la interfaz. | Recargando la página, reiniciando el backend y consultando las tablas `expedientes`, `historial` y `cierres`: los datos se conservaron. |
| Reapertura (parte 2 del enunciado): pasar de Cerrado a En seguimiento sin perder los cierres anteriores. Cambia la regla inicial de que un expediente cerrado no admite cambios de estado y obliga a que el cierre no sea una columna que se sobrescribe. | La IA implementó una tabla `cierres` (una fila por cierre, que nunca se actualiza ni se borra), la función pura `reabrirExpediente` y la validación en el servidor dentro de una transacción con bloqueo de fila (`for update`). | Se aceptó porque conserva todos los cierres con su fecha y motivo y la regla no depende de la interfaz. No se reescribió el historial de Git: el último commit anterior al anuncio (antes de las 8:38 a. m. del 31 de octubre de 2026), `d2cf244c8b5c915499dfd48711f5cac701419fb1`, sigue en el repositorio y la adaptación está en commits nuevos. Supuesto: el nuevo cierre exige al menos una actividad en el expediente, no necesariamente posterior a la reapertura. | Con 24 pruebas de Vitest, con rechazos reales de la API (motivo vacío → 400, reabrir en Abierto o En seguimiento → 409) y con el recorrido 4 en el navegador, incluida la recarga y el reinicio del backend. |
| Sesión del responsable activo | La IA implementó un storage propio para el `persist` de Zustand sobre `document.cookie`, con `SameSite=Lax`, `path=/` y 7 días de duración, en lugar de `sessionStorage`. | Se aceptó para que el responsable activo sobreviva al cerrar la pestaña, sin guardar en la cookie más que el nombre. | Se verificó que la cookie es persistente (expira 7 días después de guardarla, `SameSite=Lax`, `path=/`), que el nombre se conserva al recargar y que no se guarda nada en `sessionStorage` ni `localStorage`. No se probó cerrando y reabriendo el navegador completo. |

## Lista de comprobación

Verificado en el navegador con el backend y la base de datos reales, sobre la versión final del código.

| Recorrido | Resultado | Observado |
| --- | --- | --- |
| 1. Apertura | Cumple | Se crearon EXP-0001 y EXP-0002; con descripción de solo espacios y responsable vacío se mostró un mensaje por campo y no se envió nada al servidor. |
| 2. Consulta | Cumple | `exp-0002`, `dona chepa` y `ROSA` encontraron el expediente correcto, el detalle mostró datos e historial y «Pedro Inexistente» mostró el mensaje de búsqueda sin resultados. |
| 3. Seguimiento y cierre | Cumple | El cierre sin actividad y con motivo vacío se rechazó indicando lo que faltaba; tras una actividad se cerró, desaparecieron el formulario de actividades y los botones, y la API rechazó actividad y seguimiento en Cerrado (409). |
| 4. Reapertura y trazabilidad | Cumple | Se rechazó el motivo vacío (mensaje bajo el campo) y la reapertura en Abierto y En seguimiento (409 de la API, y el botón no aparece en esos estados); se reabrió, se agregó una actividad, se cerró de nuevo y el detalle mostró las 2 actividades, los 2 cierres y la reapertura. |
| Conservación al recargar | Cumple | Después de recargar la página y de reiniciar el backend, EXP-0001 seguía Cerrado con 2 cierres, 2 actividades y 1 reapertura. |

Los recorridos 1 a 3 se repitieron después de implementar la reapertura para detectar regresiones, sin encontrar fallos.

## Limitaciones conocidas

- Requiere PostgreSQL instalado y en ejecución en la máquina local.
- No hay autenticación ni roles: cualquier persona con acceso a la aplicación puede crear y modificar expedientes, y el responsable activo no se verifica.
- No se pueden editar ni eliminar expedientes, actividades ni cierres.
- El listado no tiene filtro por estado; solo búsqueda por identificador o nombre/alias.

## Recursos externos

- Frontend: [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [React Router](https://reactrouter.com), [TanStack Query](https://tanstack.com/query), [Zustand](https://zustand.docs.pmnd.rs), [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev), [Axios](https://axios-http.com) y [react-hot-toast](https://react-hot-toast.com).
- Backend: [Hono](https://hono.dev), [Drizzle ORM](https://orm.drizzle.team), [postgres.js](https://github.com/porsager/postgres), [PostgreSQL](https://www.postgresql.org) y [Vitest](https://vitest.dev).
- [Claude Code](https://claude.com/claude-code) se usó como apoyo para generar código, pruebas y documentación; el equipo revisó y decidió cada cambio.
