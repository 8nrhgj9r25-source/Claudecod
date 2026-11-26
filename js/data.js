/* Browine — static data */
(function (global) {
  'use strict';

  // hydration: fraction of the volume that counts towards the goal (negative = dehydrates)
  const DRINKS = [
    { id: 'agua', name: 'Agua', color: '#14B4E0', vessel: 'glass', decor: 'bubbles', hydration: 1, kcal: 0, sizes: [140, 250, 330, 500] },
    { id: 'te', name: 'Té verde', color: '#6BBE1F', vessel: 'mug', decor: 'leaves', hydration: 1, kcal: 1, sizes: [150, 250, 350] },
    { id: 'cafe', name: 'Café', color: '#6B3E2E', vessel: 'cup', decor: 'bubbles', hydration: 0.8, kcal: 2, sizes: [60, 180, 250, 350] },
    { id: 'jugo', name: 'Jugo', color: '#FFA00A', vessel: 'cup', decor: 'lemon', hydration: 0.9, kcal: 45, sizes: [150, 250, 330] },
    { id: 'smoothie', name: 'Smoothie', color: '#F0607A', vessel: 'smoothie', decor: 'seeds', hydration: 0.8, kcal: 60, sizes: [250, 330, 450] },
    { id: 'leche', name: 'Leche', color: '#AFC4D9', vessel: 'bottle', decor: 'bubbles', hydration: 0.9, kcal: 60, sizes: [200, 250, 330] },
    { id: 'coco', name: 'Agua de coco', color: '#7FD3BE', vessel: 'glass', decor: 'coco', hydration: 1, kcal: 19, sizes: [250, 330, 500] },
    { id: 'refresco', name: 'Refresco', color: '#D7263D', vessel: 'can', decor: 'bubbles', hydration: 0.85, kcal: 42, sizes: [250, 330, 500] },
    { id: 'energia', name: 'Bebida energética', color: '#2747B8', vessel: 'can', decor: 'bolt', hydration: 0.7, kcal: 45, sizes: [250, 330, 500] },
    { id: 'cerveza', name: 'Cerveza', color: '#F6C52B', vessel: 'beer', decor: 'foam', hydration: -0.6, kcal: 43, sizes: [330, 500] },
    { id: 'vino', name: 'Vino tinto', color: '#A3132C', vessel: 'wine', decor: 'bubbles', hydration: -1.6, kcal: 85, sizes: [150, 250] },
    { id: 'licor', name: 'Licor fuerte', color: '#B86A28', vessel: 'rocks', decor: 'ice', hydration: -3.2, kcal: 230, sizes: [40, 140, 330] },
  ];

  // Collectable capybaras (unlocked one per completed day)
  const FURS = ['#E39A5C', '#C88A55', '#D9A06B', '#B9773F', '#E8AE78', '#A86E45'];
  const ACCS = [null, 'orange', 'glasses', 'flower', 'beanie', 'crown', 'scarf', 'cap', 'headphones', 'bow', 'leaf'];
  const NAMES = ['Coco', 'Naranjita', 'Lentes', 'Flor', 'Gorrito', 'Rey Capi', 'Bufanda', 'Surfer', 'DJ Capi', 'Moñito', 'Hojita',
    'Canela', 'Mango', 'Panchito', 'Lulú', 'Toffee', 'Chispa', 'Nube', 'Cacao', 'Bruno', 'Paja', 'Tito', 'Maní', 'Pelusa',
    'Dulce', 'Tomás', 'Kiwi', 'Pipa', 'Brisa', 'Bombón', 'Tula', 'Rocco', 'Ola'];
  const CHARACTERS = NAMES.map((n, i) => ({
    id: i,
    name: 'Capi ' + n,
    fur: FURS[i % FURS.length],
    dark: global.Art.shade(FURS[i % FURS.length], -28),
    light: global.Art.shade(FURS[i % FURS.length], 18),
    accessory: ACCS[i % ACCS.length],
  }));

  const CHALLENGES = [
    { id: 'sinazucar', name: 'Capi sin azúcar', days: 7, color: '#F0607A', acc: 'flower',
      text: 'Una semana sin bebidas azucaradas. Cambia refrescos y jugos por agua, té o agua de coco.',
      benefits: ['Más energía estable durante el día', 'Mejor salud dental', 'Menos antojos de dulce'] },
    { id: 'jugoso', name: 'Carpincho jugoso', days: 10, color: '#FFA00A', acc: 'orange',
      text: 'Toma una fruta o un jugo natural cada día para sumar vitaminas a tu hidratación.',
      benefits: ['Vitamina C para tus defensas', 'Hidratación con sabor'] },
    { id: 'sobrio', name: 'Capi sobrio', days: 10, color: '#5468FF', acc: 'beanie',
      text: 'Haz una pausa saludable en tu rutina de consumo de alcohol. Disfruta otras bebidas o incluso agua mineral y toma conciencia de cuánto alcohol consumes realmente.',
      benefits: ['Una dieta sin alcohol mejora tu sueño profundo', 'Tu cuerpo se renueva y recarga energía', 'Piel más hidratada'] },
    { id: 'sincafe', name: 'Capi descafeinado', days: 10, color: '#6B3E2E', acc: 'headphones',
      text: 'Reduce la cafeína: cambia el segundo café del día por un té verde o agua.',
      benefits: ['Menos ansiedad', 'Mejor descanso'] },
    { id: 'verde', name: 'Capi zen', days: 7, color: '#6BBE1F', acc: 'leaf',
      text: 'Una taza de té verde al día durante una semana.',
      benefits: ['Antioxidantes', 'Concentración tranquila'] },
    { id: 'rey', name: 'Rey del agua', days: 14, color: '#D7263D', acc: 'crown',
      text: 'Cumple tu meta de hidratación 14 días seguidos.',
      benefits: ['Hábitos que duran', 'Desbloqueas un personaje exclusivo'] },
  ];

  const LIMITED = {
    name: 'Capi Coco Tropical', days: 7, color: '#E6533C', acc: 'flower',
    text: 'Disponible solamente esta semana. Una forma deliciosa de enriquecer tu dieta: agrega un vaso de agua de coco cada día.',
  };

  const TIPS = [
    { title: '¡Hidrátate con coco!', text: 'El agua de coco tiene electrolitos naturales como el potasio. Ideal después de hacer ejercicio.', color: '#BFF0E4' },
    { title: 'Empieza el día con agua', text: 'Un vaso al despertar reactiva tu cuerpo después de horas sin beber.', color: '#C8EEFB' },
    { title: 'Ten tu botella a la vista', text: 'Lo que ves, lo bebes. Deja tu botella en tu escritorio.', color: '#FFE7B8' },
    { title: 'Come agua', text: 'Sandía, pepino y naranja son más de 85% agua.', color: '#FFD3DC' },
    { title: 'Escucha a tu cuerpo', text: 'La boca seca y el cansancio pueden ser señales de deshidratación.', color: '#E3DCFF' },
    { title: 'Un vaso por comida', text: 'Acompaña cada comida con un vaso de agua para sumar sin esfuerzo.', color: '#D5F5C4' },
    { title: 'Menos alcohol, más sueño', text: 'El alcohol deshidrata y reduce el sueño profundo.', color: '#FFE0CC' },
    { title: 'Haz pausas activas', text: 'Cada vez que te levantes, toma unos sorbos.', color: '#C8EEFB' },
    { title: 'Agrega sabor natural', text: 'Rodajas de limón, menta o pepino hacen el agua más divertida.', color: '#D5F5C4' },
  ];

  global.Data = { DRINKS, CHARACTERS, CHALLENGES, LIMITED, TIPS };
})(window);
