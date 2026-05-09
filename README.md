# Job Match API

![GitHub repo size](https://img.shields.io/github/repo-size/dfleper/job-match-api?logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/dfleper/job-match-api?color=blue&label=last-commit&logo=github&logoColor=white)

API REST en Node.js + TypeScript para calcular compatibilidad entre un perfil candidato y una lista de ofertas de trabajo. El servicio expone un endpoint que recibe habilidades y experiencia, calcula un score de matching por oferta y devuelve los resultados ordenados de mayor a menor compatibilidad.

## Índice

- [Tecnologías](#tecnologías)
- [Funcionamiento general](#funcionamiento-general)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación local](#instalación-local)
- [Arrancar la aplicación](#arrancar-la-aplicación)
- [Arrancar con Docker](#arrancar-con-docker)
- [Scripts disponibles](#scripts-disponibles)
- [Endpoints](#endpoints)
- [Formato de datos](#formato-de-datos)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Validaciones y seguridad](#validaciones-y-seguridad)
- [Algoritmo de matching](#algoritmo-de-matching)
- [Compilación para producción](#compilación-para-producción)
- [Solución de problemas](#solución-de-problemas)

## Tecnologías

- **Node.js 20**: runtime usado por la imagen Docker oficial `node:20-alpine`.
- **TypeScript 6.0.3**: tipado estático y compilación a JavaScript.
- **Express 5.2.1**: framework HTTP para exponer la API REST.
- **CORS 2.8.6**: middleware para permitir peticiones cross-origin.
- **ts-node-dev 2.0.0**: ejecución en modo desarrollo con recarga automática.
- **Docker / Docker Compose**: alternativa para levantar la API en contenedor.

## Funcionamiento general

La API recibe un cuerpo JSON con:

1. Un perfil de candidato (`candidate`) con sus habilidades y, opcionalmente, años de experiencia.
2. Una lista de ofertas (`jobs`) con identificador, título, habilidades requeridas y, opcionalmente, años de experiencia.

El servicio compara las habilidades del candidato contra las habilidades de cada oferta, calcula un porcentaje de compatibilidad y devuelve las ofertas ordenadas por score descendente.

## Estructura del proyecto

```text
.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.json
└── src
    ├── index.ts
    ├── routes
    │   └── job.routes.ts
    ├── services
    │   └── jobMatch.service.ts
    └── types
        └── job.types.ts
```

Descripción rápida:

- `src/index.ts`: punto de entrada de la aplicación Express, middlewares, rutas, health check y gestión básica de errores.
- `src/routes/job.routes.ts`: definición del endpoint de matching y validación del payload de entrada.
- `src/services/jobMatch.service.ts`: lógica de cálculo de compatibilidad entre candidato y ofertas.
- `src/types/job.types.ts`: interfaces TypeScript del dominio.
- `Dockerfile`: imagen para ejecutar la API en contenedor.
- `docker-compose.yml`: servicio Docker Compose para desarrollo.

## Requisitos

### Opción local

- Node.js compatible con el proyecto. La imagen Docker usa **Node.js 20**, por lo que se recomienda usar Node.js 20 también en local.
- npm.

### Opción Docker

- Docker.
- Docker Compose.

## Variables de entorno

La aplicación puede configurarse con las siguientes variables:

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto HTTP donde se expone la API. |

Ejemplo:

```bash
PORT=3000 npm run dev
```

Actualmente no se requiere archivo `.env` para arrancar la aplicación.

## Instalación local

Desde la raíz del repositorio:

```bash
npm install
```

> Nota: el repositorio incluye `package-lock.json`, por lo que en entornos CI/CD o instalaciones reproducibles también puedes usar `npm ci`.

## Arrancar la aplicación

### Modo desarrollo

Ejecuta la API con TypeScript directamente y recarga automática:

```bash
npm run dev
```

La API quedará disponible por defecto en:

```text
http://localhost:3000
```

Si necesitas otro puerto:

```bash
PORT=4000 npm run dev
```

### Modo producción local

Primero compila TypeScript:

```bash
npm run build
```

Después ejecuta el código compilado:

```bash
npm start
```

El comando `npm start` ejecuta:

```bash
node dist/index.js
```

## Arrancar con Docker

### Usando Docker Compose

Construye y levanta el servicio:

```bash
docker compose up --build
```

La API quedará disponible en:

```text
http://localhost:3000
```

Para detener el servicio:

```bash
docker compose down
```

### Usando Docker directamente

Construir la imagen:

```bash
docker build -t job-match-api .
```

Ejecutar el contenedor:

```bash
docker run --rm -p 3000:3000 job-match-api
```

## Scripts disponibles

Los scripts definidos en `package.json` son:

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm run dev` | `ts-node-dev --respawn --transpile-only src/index.ts` | Arranca la API en modo desarrollo con recarga automática. |
| `npm run build` | `tsc` | Compila TypeScript en la carpeta `dist`. |
| `npm start` | `node dist/index.js` | Arranca la API desde el JavaScript compilado. |

## Endpoints

### `GET /health`

Endpoint de comprobación de estado.

Respuesta esperada:

```json
{
  "status": "ok"
}
```

Ejemplo:

```bash
curl http://localhost:3000/health
```

### `POST /api/jobs/match`

Calcula la compatibilidad entre un candidato y una lista de ofertas.

Headers recomendados:

```text
Content-Type: application/json
```

Body:

```json
{
  "candidate": {
    "skills": ["TypeScript", "Node.js", "Express"],
    "experienceYears": 3
  },
  "jobs": [
    {
      "id": "job-1",
      "title": "Backend Developer",
      "skills": ["Node.js", "TypeScript", "PostgreSQL"],
      "experienceYears": 2
    },
    {
      "id": "job-2",
      "title": "Frontend Developer",
      "skills": ["React", "CSS"],
      "experienceYears": 1
    }
  ]
}
```

Respuesta:

```json
{
  "matches": [
    {
      "jobId": "job-1",
      "title": "Backend Developer",
      "score": 73.33,
      "matchedSkills": ["node.js", "typescript"]
    },
    {
      "jobId": "job-2",
      "title": "Frontend Developer",
      "score": 20,
      "matchedSkills": []
    }
  ]
}
```

## Formato de datos

### CandidateProfile

```ts
interface CandidateProfile {
  skills: string[];
  experienceYears?: number;
}
```

Reglas:

- `skills` es obligatorio y debe ser un array de strings.
- `experienceYears` es opcional.
- Si se envía `experienceYears`, debe ser un número finito mayor o igual que `0`.

### JobPosting

```ts
interface JobPosting {
  id: string;
  title: string;
  skills: string[];
  experienceYears?: number;
}
```

Reglas:

- `id` es obligatorio, debe ser string y no puede estar vacío.
- `title` es obligatorio, debe ser string y no puede estar vacío.
- `skills` es obligatorio y debe ser un array de strings.
- `experienceYears` es opcional.
- Si se envía `experienceYears`, debe ser un número finito mayor o igual que `0`.

### JobMatchResult

```ts
interface JobMatchResult {
  jobId: string;
  title: string;
  score: number;
  matchedSkills: string[];
}
```

Campos de respuesta:

- `jobId`: identificador de la oferta.
- `title`: título de la oferta.
- `score`: porcentaje de compatibilidad entre `0` y `100`.
- `matchedSkills`: habilidades coincidentes normalizadas en minúsculas.

## Ejemplos de uso

### Health check

```bash
curl http://localhost:3000/health
```

Resultado esperado:

```json
{"status":"ok"}
```

### Matching de candidato contra ofertas

```bash
curl -X POST http://localhost:3000/api/jobs/match \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": {
      "skills": ["TypeScript", "Node.js", "Express"],
      "experienceYears": 3
    },
    "jobs": [
      {
        "id": "job-1",
        "title": "Backend Developer",
        "skills": ["Node.js", "TypeScript", "PostgreSQL"],
        "experienceYears": 2
      },
      {
        "id": "job-2",
        "title": "Frontend Developer",
        "skills": ["React", "CSS"],
        "experienceYears": 1
      }
    ]
  }'
```

Resultado esperado aproximado:

```json
{
  "matches": [
    {
      "jobId": "job-1",
      "title": "Backend Developer",
      "score": 73.33,
      "matchedSkills": ["node.js", "typescript"]
    },
    {
      "jobId": "job-2",
      "title": "Frontend Developer",
      "score": 20,
      "matchedSkills": []
    }
  ]
}
```

### Payload inválido

```bash
curl -i -X POST http://localhost:3000/api/jobs/match \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": {
      "skills": "TypeScript"
    },
    "jobs": []
  }'
```

Resultado esperado:

- Código HTTP `400`.
- Respuesta JSON con `error: "Invalid request body"`.

### Ruta inexistente

```bash
curl -i http://localhost:3000/no-existe
```

Resultado esperado:

- Código HTTP `404`.
- Respuesta JSON con `error: "Not found"`.

## Validaciones y seguridad

La API incluye varias defensas básicas:

- Desactiva la cabecera `X-Powered-By` de Express.
- Limita el tamaño del JSON de entrada a `100kb`.
- Valida la estructura del body antes de llamar al servicio de matching.
- Rechaza `experienceYears` negativos, infinitos o no numéricos.
- Requiere que `jobs[].id` y `jobs[].title` sean strings no vacíos.
- Devuelve errores genéricos para errores internos.
- Usa JSON como formato de entrada y salida.

Importante: actualmente no hay autenticación ni autorización implementadas. Si esta API se expone públicamente, se recomienda añadir controles de acceso, rate limiting y políticas CORS más restrictivas según el entorno de despliegue.

## Algoritmo de matching

La compatibilidad se calcula en `src/services/jobMatch.service.ts` con estos pasos:

1. Normaliza las habilidades con `trim()` y `toLowerCase()`.
2. Elimina habilidades vacías y duplicadas usando `Set`.
3. Calcula el porcentaje de habilidades requeridas por la oferta que están presentes en el candidato.
4. Calcula un score de experiencia si candidato y oferta informan `experienceYears`.
5. Combina ambos factores:
   - **80%** peso de habilidades.
   - **20%** peso de experiencia.
6. Redondea el resultado a dos decimales.
7. Ordena las ofertas de mayor a menor score.

Fórmula simplificada:

```text
score = ((skillScore * 0.8) + (experienceScore * 0.2)) * 100
```

Notas:

- Si una oferta no tiene habilidades válidas, `skillScore` es `0`.
- Si no se informa experiencia en candidato u oferta, `experienceScore` se considera `1`.
- Las habilidades devueltas en `matchedSkills` aparecen normalizadas en minúsculas.

## Compilación para producción

Compilar:

```bash
npm run build
```

Esto genera la carpeta `dist` con JavaScript, declaraciones TypeScript y sourcemaps según la configuración de `tsconfig.json`.

Arrancar desde compilado:

```bash
npm start
```

Verificar que está funcionando:

```bash
curl http://localhost:3000/health
```

## Solución de problemas

### El puerto 3000 está ocupado

Usa otro puerto:

```bash
PORT=4000 npm run dev
```

Y prueba:

```bash
curl http://localhost:4000/health
```

### `npm start` falla porque no existe `dist/index.js`

Primero compila:

```bash
npm run build
npm start
```

### Docker no refleja cambios locales

El `docker-compose.yml` monta el directorio actual en `/app`, por lo que los cambios deberían reflejarse durante el desarrollo. Si hay problemas con dependencias o caché, reconstruye:

```bash
docker compose down
docker compose up --build
```

### Error `Invalid request body`

Revisa que:

- `candidate.skills` sea un array de strings.
- `jobs` sea un array.
- Cada job tenga `id`, `title` y `skills` válidos.
- `experienceYears`, si existe, sea un número mayor o igual que `0`.

## Licencia

Este proyecto declara licencia `ISC` en `package.json`.