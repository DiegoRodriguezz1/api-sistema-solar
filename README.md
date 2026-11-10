# 🪐 API Sistema Solar

API REST construida con **Node.js + Express** y desplegada en **Render**.
Permite consultar, crear, actualizar y eliminar planetas del Sistema Solar, además de
calcular cuánto pesarías en cada planeta y obtener estadísticas y datos curiosos.

> Los datos se guardan en memoria: si el servidor se reinicia, vuelven a los 8 planetas originales.

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

## Despliegue en Render

- **Build command:** `npm install`
- **Start command:** `npm start`
- Render asigna el puerto en la variable `PORT`, que la app ya usa.
