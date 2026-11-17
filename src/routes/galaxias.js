const { crearColeccion } = require('../coleccion');
const { galaxiasIniciales } = require('../datos/galaxias');

module.exports = crearColeccion({
  singular: 'galaxia',
  articulo: 'una',
  iniciales: galaxiasIniciales,
  tipos: ['espiral', 'espiral barrada', 'elíptica', 'lenticular', 'irregular', 'anular'],
  numericos: {
    diametroAL: {},
    distanciaAL: {},
    estrellasMilesDeMillones: { opcional: true },
    ascensionRectaGrados: { max: 360, opcional: true },
    declinacionGrados: { min: -90, max: 90, opcional: true }
  },
  textos: ['constelacion']
});
