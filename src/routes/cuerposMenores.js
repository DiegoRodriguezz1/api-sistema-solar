const { crearColeccion } = require('../coleccion');
const { cuerposMenoresIniciales } = require('../datos/cuerposMenores');

const rad = (g) => (g * Math.PI) / 180;
const r4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Trayectoria aproximada (órbita de Kepler) a partir de los elementos orbitales.
 * Devuelve `n` puntos de la elipse en UA, con el Sol en el origen y el plano XY = eclíptica.
 * Cada punto trae `t`: la fracción del período (0 a 1, contada desde el perihelio) en que el
 * cuerpo pasa por ahí, lo que permite animar el movimiento con la velocidad correcta
 * (más rápido cerca del Sol).
 */
function trayectoria(c, n) {
  const a = c.semiejeMayorUA;
  const e = c.excentricidad;
  const b = a * Math.sqrt(1 - e * e);
  const [O, w, i] = [rad(c.nodoAscendenteGrados), rad(c.argumentoPerihelioGrados), rad(c.inclinacionGrados)];
  const [cO, sO, cw, sw, ci, si] = [Math.cos(O), Math.sin(O), Math.cos(w), Math.sin(w), Math.cos(i), Math.sin(i)];
  const puntos = [];
  for (let k = 0; k < n; k++) {
    const E = (2 * Math.PI * k) / n; // anomalía excéntrica
    const xp = a * (Math.cos(E) - e);
    const yp = b * Math.sin(E);
    puntos.push({
      x: r4((cO * cw - sO * sw * ci) * xp + (-cO * sw - sO * cw * ci) * yp),
      y: r4((sO * cw + cO * sw * ci) * xp + (-sO * sw + cO * cw * ci) * yp),
      z: r4(sw * si * xp + cw * si * yp),
      t: r4((E - e * Math.sin(E)) / (2 * Math.PI)) // ecuación de Kepler
    });
  }
  return puntos;
}

const numPuntos = (q) => Math.min(360, Math.max(12, parseInt(q) || 96));

module.exports = crearColeccion({
  singular: 'cuerpo menor',
  articulo: 'un',
  iniciales: cuerposMenoresIniciales,
  tipos: ['asteroide', 'cometa', 'planeta enano'],
  numericos: {
    diametroKm: {},
    semiejeMayorUA: { min: 0.01 },
    excentricidad: { max: 0.999 },
    inclinacionGrados: { max: 180 },
    nodoAscendenteGrados: { max: 360 },
    argumentoPerihelioGrados: { max: 360 },
    periodoOrbitalAnios: {}
  },
  derivar: (c) => ({
    perihelioUA: r4(c.semiejeMayorUA * (1 - c.excentricidad)),
    afelioUA: r4(c.semiejeMayorUA * (1 + c.excentricidad))
  }),
  rutasExtra(router, { obtener, buscarPorId }) {
    // GET /api/cuerpos-menores/trayectorias?puntos=96&tipo=cometa -> todas las órbitas en una sola llamada
    // (formato compacto: cada punto es [x, y, z, t])
    router.get('/trayectorias', (req, res) => {
      const n = numPuntos(req.query.puntos);
      let lista = obtener();
      if (req.query.tipo) lista = lista.filter((c) => c.tipo === req.query.tipo);
      res.json({
        ok: true,
        unidades: 'UA',
        formatoPunto: ['x', 'y', 'z', 't'],
        total: lista.length,
        datos: lista.map((c) => ({ id: c.id, nombre: c.nombre, tipo: c.tipo, puntos: trayectoria(c, n).map((p) => [p.x, p.y, p.z, p.t]) }))
      });
    });

    // GET /api/cuerpos-menores/:id/trayectoria?puntos=96
    router.get('/:id/trayectoria', (req, res) => {
      const c = buscarPorId(req, res);
      if (!c) return;
      res.json({
        ok: true,
        datos: {
          id: c.id,
          nombre: c.nombre,
          unidades: 'UA',
          perihelioUA: c.perihelioUA,
          afelioUA: c.afelioUA,
          periodoOrbitalAnios: c.periodoOrbitalAnios,
          puntos: trayectoria(c, numPuntos(req.query.puntos))
        }
      });
    });
  }
});
