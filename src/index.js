const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const planetasRouter = require('./routes/planetas');
const estrellasRouter = require('./routes/estrellas');
const cuerposMenoresRouter = require('./routes/cuerposMenores');
const galaxiasRouter = require('./routes/galaxias');
const { crearEscalas } = require('./routes/escalas');

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
    version: '2.0.0',
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
      'POST   /api/planetas/reiniciar': 'Restaurar datos originales',
      'GET    /api/estrellas': 'Estrellas (query: tipo, buscar, ordenar, dir, pagina, limite)',
      'GET    /api/cuerpos-menores': 'Asteroides, cometas y planetas enanos con sus elementos orbitales',
      'GET    /api/cuerpos-menores/:id/trayectoria?puntos=96': 'Puntos de la órbita aproximada (UA)',
      'GET    /api/cuerpos-menores/trayectorias?puntos=96': 'Todas las órbitas en una sola llamada',
      'GET    /api/galaxias': 'Galaxias (query: tipo, buscar, ordenar, dir, pagina, limite)',
      'GET    /api/escalas': 'Todo ordenado por tamaño (query: categoria, buscar)',
      'GET    /api/escalas/comparar?a=Tierra&b=Sol': 'Compara el tamaño de dos objetos',
      'CRUD   /api/estrellas, /api/cuerpos-menores, /api/galaxias': 'GET /:id, GET /aleatorio, POST, PUT /:id, PATCH /:id, DELETE /:id, POST /reiniciar'
    }
  });
});

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, estado: 'funcionando', uptimeSegundos: Math.round(process.uptime()), fecha: new Date().toISOString() });
});

app.use('/api/planetas', planetasRouter);
app.use('/api/estrellas', estrellasRouter);
app.use('/api/cuerpos-menores', cuerposMenoresRouter);
app.use('/api/galaxias', galaxiasRouter);
app.use('/api/escalas', crearEscalas({
  planetas: planetasRouter.obtener,
  cuerposMenores: cuerposMenoresRouter.obtener,
  estrellas: estrellasRouter.obtener,
  galaxias: galaxiasRouter.obtener
}));

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
