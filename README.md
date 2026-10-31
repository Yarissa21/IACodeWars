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
| Cierre | Fecha, hora y motivo |
| Historial | Entradas de apertura, actividad o cambio de estado |

Cada actividad tiene descripción obligatoria, tipo opcional y fecha y hora automáticas.

### Reglas

- Para abrir un expediente son obligatorios solicitante, descripción y responsable; se rechazan valores vacíos o con solo espacios.
- Todo expediente nuevo inicia en estado **Abierto**.
- La apertura y cada cambio de estado quedan registrados como entradas propias del historial.
- Solo se agregan actividades a expedientes **Abierto** o **En seguimiento**.
- **Abierto → En seguimiento** cuando el usuario lo solicita.
- **En seguimiento → Cerrado** solo si existe al menos una actividad y se indica un motivo de cierre no vacío.
- No hay otras transiciones. Un expediente **Cerrado** solo se consulta.
- La búsqueda no distingue mayúsculas y avisa cuando no hay resultados.
- El historial se muestra en orden cronológico y distingue visualmente actividades y cambios de estado.

### Supuestos

- No hay backend: los expedientes se guardan en el `localStorage` del navegador, así que cada navegador tiene sus propios datos.
- El nombre del responsable activo se recuerda en una cookie durante 7 días.
- No hay inicio de sesión, roles ni rutas protegidas.
- Los datos que se ingresen son ficticios y no se usan para dar asesoría real.

### Responsabilidades de los integrantes

| Integrante | Responsabilidad |
| --- | --- |
| _Por definir_ | _Por definir_ |
| _Por definir_ | _Por definir_ |

### Integración de aportes

- Un único repositorio en GitHub con la rama `main` como versión entregable.
- Cada aporte se integra como un commit por funcionalidad completa, usando Conventional Commits en español (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- Antes de integrar, cada integrante verifica que `npm run build` pase para que la app siempre compile.
- Las correcciones a un módulo ya entregado se integran en un commit aparte con `fix:`.

## Instrucciones de ejecución y requisitos

## Decisiones con IA

## Lista de comprobación

## Limitaciones conocidas

## Recursos externos
