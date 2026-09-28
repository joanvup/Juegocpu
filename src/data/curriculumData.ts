import { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'byte',
    name: 'Byte el Robot',
    role: 'Explorador Cibernético',
    color: 'from-blue-500 to-indigo-600',
    avatarEmoji: '🤖',
    description: '¡Un robot súper rápido y curioso que ama descifrar circuitos!',
  },
  {
    id: 'pixel',
    name: 'Pixel el Dino',
    role: 'Artista de Paint',
    color: 'from-emerald-500 to-teal-600',
    avatarEmoji: '🦖',
    description: '¡El dinosaurio dibujante que nunca olvida guardar sus dibujos!',
  },
  {
    id: 'chipita',
    name: 'Chipita la Gatita',
    role: 'Guardiana de la CPU',
    color: 'from-pink-500 to-rose-600',
    avatarEmoji: '🐱',
    description: '¡Ágil y saltarina, experta en mantener fresca la computadora!',
  },
  {
    id: 'nano',
    name: 'Nano el Astronauta',
    role: 'Viajero de la Nube',
    color: 'from-amber-400 to-orange-500',
    avatarEmoji: '🧑‍🚀',
    description: '¡Viaja por cables submarinos hasta los gigantescos Centros de Datos!',
  },
];

export const ACCESSORY_HATS = [
  { id: 'ninguno', name: 'Sin accesorio', emoji: '✨', cost: 0 },
  { id: 'chef', name: 'Gorro del Chef CPU', emoji: '👨‍🍳', cost: 15 },
  { id: 'detective', name: 'Lupa de Detective', emoji: '🔍', cost: 25 },
  { id: 'corona', name: 'Corona de Silicio', emoji: '👑', cost: 40 },
  { id: 'mochila', name: 'Mochila USB Dorada', emoji: '🎒', cost: 60 },
  { id: 'nube', name: 'Alas de la Nube', emoji: '🪽', cost: 80 },
];

export interface CuriosityFact {
  id: string;
  title: string;
  category: string;
  emoji: string;
  summary: string;
  detailedText: string;
  funFact: string;
  audioVoiceText: string;
}

export const CURIOSITIES: CuriosityFact[] = [
  {
    id: 'curiosity_cpu_chef',
    title: '¿Quién es el Chef de la Computadora?',
    category: 'La CPU',
    emoji: '👨‍🍳',
    summary: 'La CPU (Unidad Central de Procesamiento) es como el Chef de un restaurante.',
    detailedText:
      'Imagina que la computadora es una cocina. Los ingredientes que tú le entregas con el teclado o el ratón son la Entrada. La CPU (el Chef) piensa súper rápido, mezcla todo y cocina (Proceso). ¡Y al final te entrega un delicioso pastel en la pantalla (Salida)!',
    funFact: '¡Si escribes "2 + 2", la CPU hace la cuenta en menos de un parpadeo!',
    audioVoiceText: 'La CPU es la Unidad Central de Procesamiento. Es como el Chef principal de una gran cocina.',
  },
  {
    id: 'curiosity_cpu_speed',
    title: '¡Súper Rápido como el Rayo!',
    category: 'La CPU',
    emoji: '⚡',
    summary: 'La CPU puede hacer millones de sumas en un solo segundo.',
    detailedText:
      'Cuando juegas o ves un video, el cerebro de la computadora hace millones de cálculos por segundo. ¡Es más rápido que parpadear un ojo mil veces seguidas!',
    funFact: '¡Tú tardas unos segundos en sumar 5 + 5, pero la CPU hace millones en un segundo!',
    audioVoiceText: 'La CPU es súper veloz. Puede hacer millones de sumas en un solo segundo.',
  },
  {
    id: 'curiosity_ventilador',
    title: '¿Por qué hace "¡Fuuuuuu!" la computadora?',
    category: 'Ciencia del Calor',
    emoji: '💨',
    summary: 'Como la CPU piensa tan rápido, ¡se calienta mucho igual que tú cuando corres en el recreo!',
    detailedText:
      'Cuando corres en el patio te da calor y sudas. La CPU hace lo mismo: como trabaja tanto, se pone caliente. Por eso tiene un pequeño ventilador adentro que le echa aire fresco para que no se queme.',
    funFact: '¡Ese ruidito zumbador que escuchas al encender la compu es el ventilador cuidando a la CPU!',
    audioVoiceText: 'El ventilador echa aire frío a la CPU para que su cerebro mágico no se queme.',
  },
  {
    id: 'curiosity_silicio',
    title: '¿De qué está hecho el Cerebro Mágico?',
    category: 'Materiales',
    emoji: '🏖️',
    summary: '¡No es blandito! Es un cuadradito duro hecho de Silicio, que sale de la arena de la playa.',
    detailedText:
      'Aunque le llamamos cerebro, no es suave como el nuestro. Es una pieza pequeña y dura hecha de Silicio (un mineral que se obtiene de la arena de la playa). Por dentro tiene millones de caminitos eléctricos invisibles que llevan la luz y la información.',
    funFact: '¡La arena de la playa ayuda a fabricar los cerebros de los teléfonos y computadoras!',
    audioVoiceText: 'La CPU está hecha de Silicio, un material especial que se obtiene de la arena de la playa.',
  },
  {
    id: 'curiosity_dino_paint',
    title: 'El Misterio del Dinosaurio de Paint',
    category: 'Almacenamiento',
    emoji: '🦖',
    summary: 'Si se corta la luz y no guardaste tu dibujo, ¡desaparecerá! Siempre pulsa GUARDAR.',
    detailedText:
      'Cuando estás dibujando en Paint, la computadora lo tiene en una memoria temporal. Si se apaga la luz antes de guardarlo... ¡Zas! Se borra. Por eso es vital guardarlo en el Disco Duro, en una USB o en la Nube.',
    funFact: '¡El botón de guardar parece un cuadradito mágico que protege tus creaciones!',
    audioVoiceText: 'Recuerda siempre guardar tus dibujos para que no se borren si se corta la luz.',
  },
  {
    id: 'curiosity_disco_duro',
    title: 'El Disco Duro: El Baúl Grande',
    category: 'Almacenamiento',
    emoji: '💿',
    summary: 'Es como tu habitación: un baúl inmenso dentro de la compu donde caben todos tus juegos.',
    detailedText:
      'El Disco Duro está escondido dentro de la caja de la computadora. Allí se guardan los programas, el sistema operativo, tus fotos y tus videojuegos para siempre, aunque la compu esté apagada.',
    funFact: '¡En un disco duro caben miles de libros y dibujos juntos!',
    audioVoiceText: 'El Disco Duro es el baúl grande de la casa donde caben todos tus archivos y programas.',
  },
  {
    id: 'curiosity_memoria_usb',
    title: 'La Memoria USB: La Mochila Viajera',
    category: 'Almacenamiento',
    emoji: '🎒',
    summary: 'Es un dedito portátil que puedes llevar en el bolsillo a la escuela.',
    detailedText:
      'La memoria USB es pequeñita. Sirve para guardar un dibujo o una tarea en tu casa, sacarla, meterla a la mochila e ir a la computadora del colegio a imprimirla o mostrarla.',
    funFact: '¡Es un baúl con ruedas para llevar tus archivos a donde quieras!',
    audioVoiceText: 'La memoria USB es como una mochila de viaje que cabe en tu bolsillo para llevar archivos.',
  },
  {
    id: 'curiosity_nube_secreto',
    title: 'El Gran Secreto de La Nube',
    category: 'Internet y Nube',
    emoji: '☁️',
    summary: '¡No es una nube del cielo hecha de agua! Son cables submarinos y Centros de Datos.',
    detailedText:
      'Cuando subes un video a YouTube o un documento a Google Drive, no vuela al cielo. Viaja por cables larguísimos que cruzan calles y el fondo del océano hasta llegar a edificios gigantes llamados Centros de Datos, llenos de computadoras cuidando tus fotos día y noche.',
    funFact: '¡Hay cables de internet bajo el mar donde nadan tiburones y peces!',
    audioVoiceText: 'La nube no es de agua. Son miles de computadoras en edificios gigantes llamados Centros de Datos.',
  },
];

export const BADGES = [
  {
    id: 'badge_entrada',
    name: 'Maestro de la Entrada',
    emoji: '⌨️',
    description: 'Aprendiste a darle órdenes a la computadora con el teclado y el ratón.',
    world: 'entrada',
  },
  {
    id: 'badge_cpu',
    name: 'Chef Supremo de la CPU',
    emoji: '👨‍🍳',
    description: 'Descubriste el secreto del silicio, la supervelocidad y el ventilador.',
    world: 'cpu',
  },
  {
    id: 'badge_almacenamiento',
    name: 'Guardián de los Baúles Digitales',
    emoji: '💾',
    description: 'Dominaste el Disco Duro, la USB y los Centros de Datos de la Nube.',
    world: 'almacenamiento',
  },
  {
    id: 'badge_ciclo',
    name: 'Gran Detective de la Computadora',
    emoji: '🏆',
    description: 'Completaste los 4 pasos mágicos: Entrada, Proceso, Salida y Almacenamiento.',
    world: 'salida',
  },
];
