# API Sistema Solar

API REST construida con **Node.js + Express** y desplegada en **Render**.
Permite consultar, crear, actualizar y eliminar planetas del Sistema Solar, además de
calcular cuánto pesarías en cada planeta y obtener estadísticas y datos curiosos.

Desde la **versión 2** también incluye estrellas, asteroides, cometas y planetas enanos (con su
trayectoria aproximada), galaxias y un servicio de comparación de escalas.

> Los datos se guardan en memoria: si el servidor se reinicia, vuelven a los datos originales.
> Los valores astronómicos son aproximados y tienen fines educativos.

## Ejecutar en local

```bash
npm install
npm start          # http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Información de la API y lista de endpoints |
| GET | `/api/salud` | Estado del servidor |
| GET | `/api/planetas` | Lista de planetas (filtros abajo) |
| GET | `/api/planetas/:id` | Un planeta por id |
| GET | `/api/planetas/:id/peso?kg=70` | Peso equivalente en ese planeta |
| GET | `/api/planetas/aleatorio` | Planeta al azar con dato curioso |
| GET | `/api/planetas/estadisticas` | Resumen del sistema |
| POST | `/api/planetas` | Crear planeta |
| PUT | `/api/planetas/:id` | Reemplazar planeta completo |
| PATCH | `/api/planetas/:id` | Actualizar algunos campos |
| DELETE | `/api/planetas/:id` | Eliminar planeta |
| POST | `/api/planetas/reiniciar` | Restaurar los datos originales |

### Filtros de `GET /api/planetas`

- `tipo`: `rocoso`, `gigante gaseoso`, `gigante helado`, `enano`
- `anillos`: `true` / `false`
- `buscar`: texto contenido en el nombre
- `ordenar`: `id`, `nombre`, `diametroKm`, `distanciaSolMillonesKm`, `periodoOrbitalDias`, `lunas`, `gravedad`
- `dir`: `asc` / `desc`
- `pagina`, `limite`: paginación

### Cuerpo para crear (POST) o reemplazar (PUT)

```json
{
  "nombre": "Plutón",
  "tipo": "enano",
  "diametroKm": 2377,
  "distanciaSolMillonesKm": 5906,
  "periodoOrbitalDias": 90560,
  "lunas": 5,
  "gravedad": 0.62,
  "tieneAnillos": false,
  "datoCurioso": "Fue reclasificado como planeta enano en 2006."
}
```

### Códigos de respuesta

- `200` OK · `201` creado · `400` datos inválidos · `404` no encontrado · `409` nombre repetido · `500` error interno

## Versión 2: estrellas, cuerpos menores, galaxias y escalas

Las tres colecciones nuevas funcionan igual que `/api/planetas`: mismo formato de respuesta,
mismos filtros (`tipo`, `buscar`, `ordenar`, `dir`, `pagina`, `limite`) y CRUD completo
(`GET /:id`, `GET /aleatorio`, `POST`, `PUT /:id`, `PATCH /:id`, `DELETE /:id`, `POST /reiniciar`).

| Ruta | Contenido | Tipos válidos |
|---|---|---|
| `/api/estrellas` | 23 estrellas: el Sol, vecinas cercanas y gigantes | `enana roja`, `enana naranja`, `enana amarilla`, `enana blanca`, `secuencia principal`, `subgigante`, `gigante`, `supergigante`, `hipergigante` |
| `/api/cuerpos-menores` | 20 asteroides, cometas y planetas enanos con sus elementos orbitales | `asteroide`, `cometa`, `planeta enano` |
| `/api/galaxias` | 17 galaxias: la Vía Láctea, el Grupo Local y otras notables | `espiral`, `espiral barrada`, `elíptica`, `lenticular`, `irregular`, `anular` |

### Trayectorias

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/cuerpos-menores/:id/trayectoria?puntos=96` | Puntos de la órbita de un cuerpo |
| GET | `/api/cuerpos-menores/trayectorias?puntos=96&tipo=cometa` | Todas las órbitas en una sola llamada (cada punto es `[x, y, z, t]`) |

La trayectoria es una órbita de Kepler calculada con los elementos orbitales del cuerpo
(semieje mayor, excentricidad, inclinación, nodo ascendente y argumento del perihelio).
Las coordenadas van en UA, con el Sol en el origen y el plano XY sobre la eclíptica.
`t` es la fracción del período (0 a 1, desde el perihelio) en la que el cuerpo pasa por ese punto,
para poder animarlo con su velocidad real (más rápido cerca del Sol). `puntos` admite de 12 a 360.

### Escalas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/escalas?categoria=estrella&buscar=sol` | Todo lo que hay en la API ordenado por tamaño, más referencias (una persona, la Luna, un año luz, el universo observable…) |
| GET | `/api/escalas/comparar?a=Tierra&b=Sol` | Cuántas veces es más grande uno que otro, con una analogía |

Categorías: `referencia`, `cuerpo menor`, `planeta`, `estrella`, `distancia`, `estructura`, `galaxia`.
La lista se arma con los datos vivos de las colecciones, así que refleja lo que se cree o se elimine.

### Cuerpo para crear un cuerpo menor

```json
{
  "nombre": "Gonggong",
  "tipo": "planeta enano",
  "diametroKm": 1230,
  "semiejeMayorUA": 67.5,
  "excentricidad": 0.5,
  "inclinacionGrados": 30.7,
  "nodoAscendenteGrados": 336.8,
  "argumentoPerihelioGrados": 207.7,
  "periodoOrbitalAnios": 554,
  "datoCurioso": "Tiene una luna llamada Xiangliu."
}
```

### Estructura del código

- `src/coleccion.js`: fábrica de routers CRUD en memoria (la usan las tres colecciones nuevas).
- `src/datos/`: datos iniciales de estrellas, cuerpos menores y galaxias.
- `src/routes/`: `planetas.js` (sin cambios de comportamiento), `estrellas.js`, `cuerposMenores.js`, `galaxias.js`, `escalas.js`.

## Despliegue en Render

- **Build command:** `npm install`
- **Start command:** `npm start`
- Render asigna el puerto en la variable `PORT`, que la app ya usa.
