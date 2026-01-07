
export const MOTIVATIONAL_QUOTES = [
  "La disciplina es el puente entre tus metas y tus logros.",
  "El cuerpo logra lo que la mente cree.",
  "No te detengas cuando estés cansado, detente cuando hayas terminado.",
  "La consistencia vence a la intensidad a largo plazo.",
  "Tu único límite eres tú mismo.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No es por estética, es por respeto a tu potencial.",
  "La fuerza no viene de la capacidad física, viene de una voluntad indomable.",
  "Hoy es otra oportunidad para ser mejor que ayer.",
  "Entrena como un atleta, come como un nutricionista y duerme como un bebé.",
  "El dolor es debilidad abandonando el cuerpo.",
  "Si fuera fácil, todo el mundo lo haría.",
  "No cuentes los días, haz que los días cuenten.",
  "La motivación te pone en marcha, el hábito te mantiene.",
  "Tu cuerpo es tu templo, cuídalo con hierro.",
  "Ganar es no rendirse nunca.",
  "La mayor recompensa no es lo que obtienes, sino en lo que te conviertes.",
  "Donde no hay lucha, no hay fuerza.",
  "Tu futuro se crea por lo que haces hoy, no mañana.",
  "El fracaso es solo la oportunidad de empezar de nuevo de forma más inteligente."
];

export const getDailyQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Usamos el día del año para rotar entre las frases
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};
