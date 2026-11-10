const express = require('express');
const { planetasIniciales } = require('../data');

const router = express.Router();

// "Base de datos" en memoria
let planetas = structuredClone(planetasIniciales);
let siguienteId = planetas.length + 1;

const TIPOS_VALIDOS = ['rocoso', 'gigante gaseoso', 'gigante helado', 'enano'];
const CAMPOS_NUMERICOS = ['diametroKm', 'distanciaSolMillonesKm', 'periodoOrbitalDias', 'lunas', 'gravedad'];
const CAMPOS_ORDENABLES = ['id', 'nombre', ...CAMPOS_NUMERICOS];

// Valida el cuerpo de la petición. Si parcial = true (PATCH), solo valida los campos enviados.
function validarPlaneta(body, parcial = false) {
  const errores = [];
  const tiene = (c) => body[c] !== undefined;

  if (!parcial || tiene('nombre')) {
    if (typeof body.nombre !== 'string' || body.nombre.trim().length < 2) {
      errores.push('"nombre" es obligatorio y debe tener al menos 2 caracteres');
    }
  }
  if (!parcial || tiene('tipo')) {
    if (!TIPOS_VALIDOS.includes(body.tipo)) {
      errores.push(`"tipo" debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }
  }
  for (const campo of CAMPOS_NUMERICOS) {
    if (!parcial || tiene(campo)) {
      if (typeof body[campo] !== 'number' || body[campo] < 0) {
        errores.push(`"${campo}" es obligatorio y debe ser un número >= 0`);
      }
    }
  }
  if (tiene('lunas') && !Number.isInteger(body.lunas)) {
    errores.push('"lunas" debe ser un número entero');
  }
  if (!parcial || tiene('tieneAnillos')) {
    if (typeof body.tieneAnillos !== 'boolean') {
      errores.push('"tieneAnillos" es obligatorio y debe ser true o false');
    }
  }
  if (tiene('datoCurioso') && typeof body.datoCurioso !== 'string') {
    errores.push('"datoCurioso" debe ser texto');
  }
  return errores;
}

// Toma solo los campos permitidos del body
function limpiar(body) {
  const permitidos = ['nombre', 'tipo', ...CAMPOS_NUMERICOS, 'tieneAnillos', 'datoCurioso'];
  const out = {};
  for (const k of permitidos) if (body[k] !== undefined) out[k] = typeof body[k] === 'string' ? body[k].trim() : body[k];
  return out;
}

const nombreRepetido = (nombre, exceptoId) =>
  planetas.some((p) => p.id !== exceptoId && p.nombre.toLowerCase() === nombre.trim().toLowerCase());

function buscarPorId(req, res) {
  const id = Number(req.params.id);
  const planeta = planetas.find((p) => p.id === id);
  if (!planeta) {
    res.status(404).json({ ok: false, error: `No existe un planeta con id ${req.params.id}` });
    return null;
  }
  return planeta;
}

// GET /api/planetas  -> lista con filtros, búsqueda, orden y paginación
router.get('/', (req, res) => {
  const { tipo, anillos, buscar, ordenar = 'id', dir = 'asc', pagina = 1, limite = 20 } = req.query;
  let resultado = [...planetas];

  if (tipo) resultado = resultado.filter((p) => p.tipo === tipo);
  if (anillos !== undefined) resultado = resultado.filter((p) => p.tieneAnillos === (anillos === 'true'));
  if (buscar) {
    const q = buscar.toLowerCase();
    resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(q));
  }

  if (!CAMPOS_ORDENABLES.includes(ordenar)) {
    return res.status(400).json({ ok: false, error: `"ordenar" debe ser uno de: ${CAMPOS_ORDENABLES.join(', ')}` });
  }
  const signo = dir === 'desc' ? -1 : 1;
  resultado.sort((a, b) => {
    if (typeof a[ordenar] === 'string') return a[ordenar].localeCompare(b[ordenar]) * signo;
    return (a[ordenar] - b[ordenar]) * signo;
  });

  const pag = Math.max(1, parseInt(pagina) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limite) || 20));
  const total = resultado.length;
  const datos = resultado.slice((pag - 1) * lim, pag * lim);

  res.json({ ok: true, total, pagina: pag, limite: lim, datos });
});

// GET /api/planetas/estadisticas -> resumen del sistema
router.get('/estadisticas', (req, res) => {
  if (planetas.length === 0) return res.json({ ok: true, datos: { totalPlanetas: 0 } });
  const masGrande = planetas.reduce((a, b) => (b.diametroKm > a.diametroKm ? b : a));
  const masPequeno = planetas.reduce((a, b) => (b.diametroKm < a.diametroKm ? b : a));
  const masLunas = planetas.reduce((a, b) => (b.lunas > a.lunas ? b : a));
  const porTipo = planetas.reduce((acc, p) => ({ ...acc, [p.tipo]: (acc[p.tipo] || 0) + 1 }), {});
  res.json({
    ok: true,
    datos: {
      totalPlanetas: planetas.length,
      totalLunas: planetas.reduce((s, p) => s + p.lunas, 0),
      conAnillos: planetas.filter((p) => p.tieneAnillos).length,
      porTipo,
      masGrande: masGrande.nombre,
      masPequeno: masPequeno.nombre,
      masLunas: `${masLunas.nombre} (${masLunas.lunas})`
    }
  });
});

// GET /api/planetas/aleatorio -> un planeta al azar con su dato curioso
router.get('/aleatorio', (req, res) => {
  if (planetas.length === 0) return res.status(404).json({ ok: false, error: 'No hay planetas registrados' });
  const p = planetas[Math.floor(Math.random() * planetas.length)];
  res.json({ ok: true, datos: { nombre: p.nombre, datoCurioso: p.datoCurioso || 'Sin dato curioso aún' } });
});

// POST /api/planetas/reiniciar -> vuelve a los datos originales
router.post('/reiniciar', (req, res) => {
  planetas = structuredClone(planetasIniciales);
  siguienteId = planetas.length + 1;
  res.json({ ok: true, mensaje: 'Datos reiniciados a los 8 planetas originales', total: planetas.length });
});

// GET /api/planetas/:id/peso?kg=70 -> cuánto pesarías en ese planeta
router.get('/:id/peso', (req, res) => {
  const planeta = buscarPorId(req, res);
  if (!planeta) return;
  const kg = Number(req.query.kg);
  if (!req.query.kg || Number.isNaN(kg) || kg <= 0) {
    return res.status(400).json({ ok: false, error: 'Envía tu masa en kg, por ejemplo ?kg=70' });
  }
  const equivalenteKg = +(kg * (planeta.gravedad / 9.8)).toFixed(2);
  res.json({
    ok: true,
    datos: {
      planeta: planeta.nombre,
      masaEnTierraKg: kg,
      gravedad: planeta.gravedad,
      pesoEquivalenteKg: equivalenteKg,
      mensaje: `En ${planeta.nombre} la báscula marcaría ${equivalenteKg} kg`
    }
  });
});

// GET /api/planetas/:id
router.get('/:id', (req, res) => {
  const planeta = buscarPorId(req, res);
  if (planeta) res.json({ ok: true, datos: planeta });
});

// POST /api/planetas
router.post('/', (req, res) => {
  const errores = validarPlaneta(req.body || {});
  if (errores.length) return res.status(400).json({ ok: false, errores });
  if (nombreRepetido(req.body.nombre)) {
    return res.status(409).json({ ok: false, error: `Ya existe un planeta llamado ${req.body.nombre}` });
  }
  const datos = limpiar(req.body);
  const nuevo = { id: siguienteId++, ...datos, datoCurioso: datos.datoCurioso ?? '' };
  planetas.push(nuevo);
  res.status(201).json({ ok: true, mensaje: 'Planeta creado', datos: nuevo });
});

// PUT /api/planetas/:id -> reemplazo completo
router.put('/:id', (req, res) => {
  const planeta = buscarPorId(req, res);
  if (!planeta) return;
  const errores = validarPlaneta(req.body || {});
  if (errores.length) return res.status(400).json({ ok: false, errores });
  if (nombreRepetido(req.body.nombre, planeta.id)) {
    return res.status(409).json({ ok: false, error: `Ya existe un planeta llamado ${req.body.nombre}` });
  }
  const datos = limpiar(req.body);
  const actualizado = { id: planeta.id, ...datos, datoCurioso: datos.datoCurioso ?? '' };
  planetas = planetas.map((p) => (p.id === planeta.id ? actualizado : p));
  res.json({ ok: true, mensaje: 'Planeta reemplazado', datos: actualizado });
});

// PATCH /api/planetas/:id -> actualización parcial
router.patch('/:id', (req, res) => {
  const planeta = buscarPorId(req, res);
  if (!planeta) return;
  const cambios = limpiar(req.body || {});
  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({ ok: false, error: 'Envía al menos un campo para actualizar' });
  }
  const errores = validarPlaneta(cambios, true);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  if (cambios.nombre && nombreRepetido(cambios.nombre, planeta.id)) {
    return res.status(409).json({ ok: false, error: `Ya existe un planeta llamado ${cambios.nombre}` });
  }
  Object.assign(planeta, cambios);
  res.json({ ok: true, mensaje: 'Planeta actualizado', datos: planeta });
});

// DELETE /api/planetas/:id
router.delete('/:id', (req, res) => {
  const planeta = buscarPorId(req, res);
  if (!planeta) return;
  planetas = planetas.filter((p) => p.id !== planeta.id);
  res.json({ ok: true, mensaje: `Planeta ${planeta.nombre} eliminado`, datos: planeta });
});

module.exports = router;
