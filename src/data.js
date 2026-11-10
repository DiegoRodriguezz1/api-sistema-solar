// Datos iniciales (se guardan en memoria; al reiniciar el servidor vuelven a este estado)
// Unidades: diametroKm en km, distanciaSolMillonesKm en millones de km,
// periodoOrbitalDias en días terrestres, gravedad en m/s²

const planetasIniciales = [
  {
    id: 1,
    nombre: 'Mercurio',
    tipo: 'rocoso',
    diametroKm: 4879,
    distanciaSolMillonesKm: 57.9,
    periodoOrbitalDias: 88,
    lunas: 0,
    gravedad: 3.7,
    tieneAnillos: false,
    datoCurioso: 'Un día en Mercurio (de amanecer a amanecer) dura unos 176 días terrestres, más que su propio año.'
  },
  {
    id: 2,
    nombre: 'Venus',
    tipo: 'rocoso',
    diametroKm: 12104,
    distanciaSolMillonesKm: 108.2,
    periodoOrbitalDias: 225,
    lunas: 0,
    gravedad: 8.9,
    tieneAnillos: false,
    datoCurioso: 'Es el planeta más caliente del Sistema Solar (unos 465 °C) por su efecto invernadero, y gira al revés que casi todos los demás.'
  },
  {
    id: 3,
    nombre: 'Tierra',
    tipo: 'rocoso',
    diametroKm: 12742,
    distanciaSolMillonesKm: 149.6,
    periodoOrbitalDias: 365.25,
    lunas: 1,
    gravedad: 9.8,
    tieneAnillos: false,
    datoCurioso: 'Es el único planeta conocido con agua líquida estable en la superficie y con vida.'
  },
  {
    id: 4,
    nombre: 'Marte',
    tipo: 'rocoso',
    diametroKm: 6779,
    distanciaSolMillonesKm: 227.9,
    periodoOrbitalDias: 687,
    lunas: 2,
    gravedad: 3.7,
    tieneAnillos: false,
    datoCurioso: 'Tiene el Monte Olimpo, el volcán más grande del Sistema Solar, casi tres veces más alto que el Everest.'
  },
  {
    id: 5,
    nombre: 'Júpiter',
    tipo: 'gigante gaseoso',
    diametroKm: 139820,
    distanciaSolMillonesKm: 778.5,
    periodoOrbitalDias: 4333,
    lunas: 95,
    gravedad: 24.8,
    tieneAnillos: true,
    datoCurioso: 'Su Gran Mancha Roja es una tormenta más grande que la Tierra que lleva activa siglos.'
  },
  {
    id: 6,
    nombre: 'Saturno',
    tipo: 'gigante gaseoso',
    diametroKm: 116460,
    distanciaSolMillonesKm: 1432,
    periodoOrbitalDias: 10759,
    lunas: 146,
    gravedad: 10.4,
    tieneAnillos: true,
    datoCurioso: 'Su densidad media es menor que la del agua: en una bañera gigante, flotaría.'
  },
  {
    id: 7,
    nombre: 'Urano',
    tipo: 'gigante helado',
    diametroKm: 50724,
    distanciaSolMillonesKm: 2867,
    periodoOrbitalDias: 30687,
    lunas: 28,
    gravedad: 8.7,
    tieneAnillos: true,
    datoCurioso: 'Rota prácticamente acostado: su eje está inclinado unos 98 grados.'
  },
  {
    id: 8,
    nombre: 'Neptuno',
    tipo: 'gigante helado',
    diametroKm: 49244,
    distanciaSolMillonesKm: 4515,
    periodoOrbitalDias: 60190,
    lunas: 16,
    gravedad: 11.2,
    tieneAnillos: true,
    datoCurioso: 'Tiene los vientos más rápidos medidos en el Sistema Solar, de más de 2.000 km/h.'
  }
];

module.exports = { planetasIniciales };
