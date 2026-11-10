const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const planetasRouter = require('./routes/planetas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Raíz: documentación rápida de la API
app.get('/', (req, res) => {
  res.json({
    ok: true,
    nombre: 'API Sistema Solar 🪐',
    version: '1.0.0',
    autor: 'Diego Alejandro Rodriguez Hernandez',
    endpoints: {
      'GET    /api/salud': 'Estado del servidor',
      'GET    /api/planetas': 'Lista planetas (query: tipo, anillos, buscar, ordenar, dir, pagina, limite)',
      'GET    /api/planetas/:id': 'Un planeta por id',
      'GET    /api/planetas/:id/peso?kg=70': 'Cuánto pesarías en ese planeta',
      'GET    /api/planetas/aleatorio': 'Planeta al azar con dato curioso',
      'GET    /api/planetas/estadisticas': 'Resumen del sistema',
      'POST   /api/planetas': 'Crear planeta',
      'PUT    /api/planetas/:id': 'Reemplazar planeta',
      'PATCH  /api/planetas/:id': 'Actualizar campos de un planeta',
      'DELETE /api/planetas/:id': 'Eliminar planeta',
      'POST   /api/planetas/reiniciar': 'Restaurar datos originales'
    }
  });
});

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, estado: 'funcionando', uptimeSegundos: Math.round(process.uptime()), fecha: new Date().toISOString() });
});

app.use('/api/planetas', planetasRouter);

// 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo de errores (ej. JSON mal formado)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Sistema Solar escuchando en el puerto ${PORT}`);
});
