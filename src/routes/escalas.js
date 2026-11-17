const express = require('express');

const KM_POR_UA = 149597870.7;
const KM_POR_AL = 9.4607e12;

// Referencias que no pertenecen a ninguna colección, para dar contexto a la escala.
const referencias = [
  { nombre: 'Ser humano', categoria: 'referencia', tamanoKm: 0.0017 },
  { nombre: 'Estación Espacial Internacional', categoria: 'referencia', tamanoKm: 0.109 },
  { nombre: 'Monte Everest', categoria: 'referencia', tamanoKm: 8.849 },
  { nombre: 'Luna', categoria: 'referencia', tamanoKm: 3474.8 },
  { nombre: 'Distancia Tierra–Luna', categoria: 'distancia', tamanoKm: 384400 },
  { nombre: 'Unidad astronómica (Tierra–Sol)', categoria: 'distancia', tamanoKm: KM_POR_UA },
  { nombre: 'Órbita de Neptuno (diámetro)', categoria: 'distancia', tamanoKm: 60.1 * KM_POR_UA },
  { nombre: 'Heliosfera', categoria: 'estructura', tamanoKm: 240 * KM_POR_UA },
  { nombre: 'Año luz', categoria: 'distancia', tamanoKm: KM_POR_AL },
  { nombre: 'Nube de Oort', categoria: 'estructura', tamanoKm: 3.2 * KM_POR_AL },
  { nombre: 'Distancia a Próxima Centauri', categoria: 'distancia', tamanoKm: 4.24 * KM_POR_AL },
  { nombre: 'Grupo Local de galaxias', categoria: 'estructura', tamanoKm: 1e7 * KM_POR_AL },
  { nombre: 'Supercúmulo de Virgo', categoria: 'estructura', tamanoKm: 1.1e8 * KM_POR_AL },
  { nombre: 'Laniakea', categoria: 'estructura', tamanoKm: 5.2e8 * KM_POR_AL },
  { nombre: 'Universo observable', categoria: 'estructura', tamanoKm: 9.3e10 * KM_POR_AL }
];

const normalizar = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function formatear(km) {
  const n = (v) => (v >= 100 ? Math.round(v).toLocaleString('es-CO') : v.toLocaleString('es-CO', { maximumSignificantDigits: 3 }));
  if (km < 1) return `${n(km * 1000)} m`;
  if (km < 1e8) return `${n(km)} km`;
  if (km < 0.1 * KM_POR_AL) return `${n(km / KM_POR_UA)} UA`;
  return `${n(km / KM_POR_AL)} años luz`;
}

/**
 * Router de escalas: junta en una sola lista ordenada por tamaño todo lo que hay en la API
 * (planetas, cuerpos menores, estrellas y galaxias) más algunas referencias.
 * Recibe las colecciones "vivas", así que refleja lo que se cree, edite o elimine.
 */
function crearEscalas({ planetas, cuerposMenores, estrellas, galaxias }) {
  const router = express.Router();

  function todas() {
    const lista = [
      ...referencias,
      ...planetas().map((p) => ({ nombre: p.nombre, categoria: 'planeta', tamanoKm: p.diametroKm })),
      ...cuerposMenores().map((c) => ({ nombre: c.nombre, categoria: 'cuerpo menor', tamanoKm: c.diametroKm })),
      ...estrellas().map((e) => ({ nombre: e.nombre, categoria: 'estrella', tamanoKm: e.diametroKm })),
      ...galaxias().map((g) => ({ nombre: g.nombre, categoria: 'galaxia', tamanoKm: g.diametroAL * KM_POR_AL }))
    ];
    return lista
      .filter((o) => o.tamanoKm > 0)
      .sort((a, b) => a.tamanoKm - b.tamanoKm)
      .map((o) => ({ ...o, tamanoTexto: formatear(o.tamanoKm), log10Km: +Math.log10(o.tamanoKm).toFixed(3) }));
  }

  // GET /api/escalas?categoria=estrella&buscar=sol
  router.get('/', (req, res) => {
    let lista = todas();
    if (req.query.categoria) lista = lista.filter((o) => o.categoria === req.query.categoria);
    if (req.query.buscar) lista = lista.filter((o) => normalizar(o.nombre).includes(normalizar(req.query.buscar)));
    res.json({ ok: true, total: lista.length, categorias: [...new Set(todas().map((o) => o.categoria))], datos: lista });
  });

  // GET /api/escalas/comparar?a=Tierra&b=Sol
  router.get('/comparar', (req, res) => {
    const { a, b } = req.query;
    if (!a || !b) return res.status(400).json({ ok: false, error: 'Envía los dos nombres, por ejemplo ?a=Tierra&b=Sol' });
    const lista = todas();
    const buscar = (n) => lista.find((o) => normalizar(o.nombre) === normalizar(n));
    const [oa, ob] = [buscar(a), buscar(b)];
    if (!oa || !ob) return res.status(404).json({ ok: false, error: `No encontré "${!oa ? a : b}" en la escala. Consulta los nombres en /api/escalas` });

    const [mayor, menor] = oa.tamanoKm >= ob.tamanoKm ? [oa, ob] : [ob, oa];
    const razon = mayor.tamanoKm / menor.tamanoKm;
    const veces = razon >= 100 ? Math.round(razon).toLocaleString('es-CO') : razon.toLocaleString('es-CO', { maximumSignificantDigits: 3 });
    // Si el menor fuera una canica de 1 cm, ¿cuánto mediría el mayor?
    const cm = razon;
    const analogia = cm < 100 ? `${cm.toLocaleString('es-CO', { maximumSignificantDigits: 3 })} cm` : cm < 1e5 ? `${(cm / 100).toLocaleString('es-CO', { maximumSignificantDigits: 3 })} m` : `${(cm / 1e5).toLocaleString('es-CO', { maximumSignificantDigits: 3 })} km`;
    res.json({
      ok: true,
      datos: {
        mayor,
        menor,
        razon,
        ordenesDeMagnitud: +Math.log10(razon).toFixed(2),
        mensaje: razon < 1.005 ? `${mayor.nombre} y ${menor.nombre} tienen prácticamente el mismo tamaño` : `${mayor.nombre} es ${veces} veces más grande que ${menor.nombre}`,
        analogia: `Si ${menor.nombre} fuera una canica de 1 cm, ${mayor.nombre} mediría ${analogia}`
      }
    });
  });

  return router;
}

module.exports = { crearEscalas };
