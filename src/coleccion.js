const express = require('express');

/**
 * Crea un router CRUD completo (en memoria) para una colección.
 * Misma forma de respuesta y de filtros que /api/planetas.
 *
 * config = {
 *   singular: 'estrella', articulo: 'una', iniciales: [...],
 *   tipos: ['...'],                                   // valores válidos de "tipo"
 *   numericos: { campo: { min, max, entero, opcional } },
 *   textos: ['constelacion', ...],                    // opcionales
 *   derivar: (obj) => ({ ...campos calculados })      // opcional
 * }
 */
function crearColeccion(config) {
  const { singular, articulo = 'un', iniciales, tipos, numericos, textos = [], derivar = () => ({}) } = config;
  const router = express.Router();
  const conDerivados = (o) => ({ ...o, ...derivar(o) });

  let items = iniciales.map(conDerivados);
  let siguienteId = items.length + 1;

  const camposNum = Object.keys(numericos);
  const permitidos = ['nombre', 'tipo', ...camposNum, ...textos, 'datoCurioso'];
  const ordenables = ['id', 'nombre', ...camposNum, ...Object.keys(derivar(iniciales[0]))];

  function validar(body, parcial = false) {
    const errores = [];
    const tiene = (c) => body[c] !== undefined && body[c] !== null;
    if (!parcial || tiene('nombre')) {
      if (typeof body.nombre !== 'string' || body.nombre.trim().length < 2) {
        errores.push('"nombre" es obligatorio y debe tener al menos 2 caracteres');
      }
    }
    if (!parcial || tiene('tipo')) {
      if (!tipos.includes(body.tipo)) errores.push(`"tipo" debe ser uno de: ${tipos.join(', ')}`);
    }
    for (const campo of camposNum) {
      const r = numericos[campo];
      if (!tiene(campo)) {
        if (!parcial && !r.opcional) errores.push(`"${campo}" es obligatorio`);
        continue;
      }
      const v = body[campo];
      const min = r.min ?? 0;
      if (typeof v !== 'number' || Number.isNaN(v) || v < min || (r.max !== undefined && v > r.max)) {
        errores.push(`"${campo}" debe ser un número ${r.max !== undefined ? `entre ${min} y ${r.max}` : `>= ${min}`}`);
      } else if (r.entero && !Number.isInteger(v)) {
        errores.push(`"${campo}" debe ser un número entero`);
      }
    }
    for (const campo of [...textos, 'datoCurioso']) {
      if (tiene(campo) && typeof body[campo] !== 'string') errores.push(`"${campo}" debe ser texto`);
    }
    return errores;
  }

  function limpiar(body) {
    const out = {};
    for (const k of permitidos) {
      if (body[k] !== undefined && body[k] !== null) out[k] = typeof body[k] === 'string' ? body[k].trim() : body[k];
    }
    return out;
  }

  const nombreRepetido = (nombre, exceptoId) =>
    items.some((p) => p.id !== exceptoId && p.nombre.toLowerCase() === nombre.trim().toLowerCase());

  function buscarPorId(req, res) {
    const id = Number(req.params.id);
    const item = items.find((p) => p.id === id);
    if (!item) {
      res.status(404).json({ ok: false, error: `No existe ${articulo} ${singular} con id ${req.params.id}` });
      return null;
    }
    return item;
  }

  // GET /  -> lista con filtros, búsqueda, orden y paginación
  router.get('/', (req, res) => {
    const { tipo, buscar, ordenar = 'id', dir = 'asc', pagina = 1, limite = 20 } = req.query;
    let resultado = [...items];
    if (tipo) resultado = resultado.filter((p) => p.tipo === tipo);
    if (buscar) {
      const q = String(buscar).toLowerCase();
      resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    if (!ordenables.includes(ordenar)) {
      return res.status(400).json({ ok: false, error: `"ordenar" debe ser uno de: ${ordenables.join(', ')}` });
    }
    const signo = dir === 'desc' ? -1 : 1;
    resultado.sort((a, b) => {
      if (typeof a[ordenar] === 'string') return a[ordenar].localeCompare(b[ordenar]) * signo;
      return ((a[ordenar] ?? 0) - (b[ordenar] ?? 0)) * signo;
    });
    const pag = Math.max(1, parseInt(pagina) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limite) || 20));
    res.json({ ok: true, total: resultado.length, pagina: pag, limite: lim, datos: resultado.slice((pag - 1) * lim, pag * lim) });
  });

  // GET /aleatorio
  router.get('/aleatorio', (req, res) => {
    if (items.length === 0) return res.status(404).json({ ok: false, error: 'No hay registros' });
    const p = items[Math.floor(Math.random() * items.length)];
    res.json({ ok: true, datos: { id: p.id, nombre: p.nombre, datoCurioso: p.datoCurioso || 'Sin dato curioso aún' } });
  });

  // POST /reiniciar
  router.post('/reiniciar', (req, res) => {
    items = iniciales.map(conDerivados);
    siguienteId = items.length + 1;
    res.json({ ok: true, mensaje: 'Datos reiniciados a los originales', total: items.length });
  });

  // Rutas extra de la colección (deben ir antes de /:id)
  if (config.rutasExtra) config.rutasExtra(router, { obtener: () => items, buscarPorId });

  router.get('/:id', (req, res) => {
    const item = buscarPorId(req, res);
    if (item) res.json({ ok: true, datos: item });
  });

  router.post('/', (req, res) => {
    const errores = validar(req.body || {});
    if (errores.length) return res.status(400).json({ ok: false, errores });
    if (nombreRepetido(req.body.nombre)) {
      return res.status(409).json({ ok: false, error: `Ya existe ${articulo} ${singular} con el nombre ${req.body.nombre}` });
    }
    const datos = limpiar(req.body);
    const nuevo = conDerivados({ id: siguienteId++, ...datos, datoCurioso: datos.datoCurioso ?? '' });
    items.push(nuevo);
    res.status(201).json({ ok: true, mensaje: 'Registro creado', datos: nuevo });
  });

  router.put('/:id', (req, res) => {
    const item = buscarPorId(req, res);
    if (!item) return;
    const errores = validar(req.body || {});
    if (errores.length) return res.status(400).json({ ok: false, errores });
    if (nombreRepetido(req.body.nombre, item.id)) {
      return res.status(409).json({ ok: false, error: `Ya existe ${articulo} ${singular} con el nombre ${req.body.nombre}` });
    }
    const datos = limpiar(req.body);
    const actualizado = conDerivados({ id: item.id, ...datos, datoCurioso: datos.datoCurioso ?? '' });
    items = items.map((p) => (p.id === item.id ? actualizado : p));
    res.json({ ok: true, mensaje: 'Registro reemplazado', datos: actualizado });
  });

  router.patch('/:id', (req, res) => {
    const item = buscarPorId(req, res);
    if (!item) return;
    const cambios = limpiar(req.body || {});
    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ ok: false, error: 'Envía al menos un campo para actualizar' });
    }
    const errores = validar(cambios, true);
    if (errores.length) return res.status(400).json({ ok: false, errores });
    if (cambios.nombre && nombreRepetido(cambios.nombre, item.id)) {
      return res.status(409).json({ ok: false, error: `Ya existe ${articulo} ${singular} con el nombre ${cambios.nombre}` });
    }
    Object.assign(item, cambios);
    Object.assign(item, derivar(item));
    res.json({ ok: true, mensaje: 'Registro actualizado', datos: item });
  });

  router.delete('/:id', (req, res) => {
    const item = buscarPorId(req, res);
    if (!item) return;
    items = items.filter((p) => p.id !== item.id);
    res.json({ ok: true, mensaje: `${item.nombre} eliminado`, datos: item });
  });

  router.obtener = () => items;
  return router;
}

module.exports = { crearColeccion };
