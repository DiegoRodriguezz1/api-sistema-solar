const { crearColeccion } = require('../coleccion');
const { estrellasIniciales } = require('../datos/estrellas');

const DIAMETRO_SOL_KM = 1392700;

module.exports = crearColeccion({
  singular: 'estrella',
  articulo: 'una',
  iniciales: estrellasIniciales,
  tipos: ['enana roja', 'enana naranja', 'enana amarilla', 'enana blanca', 'secuencia principal', 'subgigante', 'gigante', 'supergigante', 'hipergigante'],
  numericos: {
    radioSolar: {},
    masaSolar: {},
    temperaturaK: {},
    distanciaAL: {},
    ascensionRectaGrados: { max: 360, opcional: true },
    declinacionGrados: { min: -90, max: 90, opcional: true }
  },
  textos: ['claseEspectral', 'constelacion'],
  derivar: (e) => ({ diametroKm: Math.round(e.radioSolar * DIAMETRO_SOL_KM) })
});
