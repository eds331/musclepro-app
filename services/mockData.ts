
import { User, UserRole, Gender, Goal, ExperienceLevel, SubscriptionStatus, LifeAreaName, WorldProfile } from "../types";

export const MOCK_EXERCISES_DB = [
  { 
    id: 'sq1', 
    name: 'Barbell Squat', 
    sets: 4, 
    reps: '6-8', 
    restSeconds: 180, 
    rpeTarget: 8, 
    notes: 'Control the descent. Explode up.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjRyb2VwZWR4ZnR5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKKl7Yn99nC1HhK/giphy.gif'
  },
  { 
    id: 'bp1', 
    name: 'Bench Press', 
    sets: 4, 
    reps: '8-10', 
    restSeconds: 120, 
    rpeTarget: 8, 
    notes: 'Scapular retraction is mandatory.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWw0bHl5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41Yh18f5T015Ik00/giphy.gif'
  },
  { 
    id: 'dl1', 
    name: 'Deadlift', 
    sets: 3, 
    reps: '5', 
    restSeconds: 240, 
    rpeTarget: 9, 
    notes: 'Maintain neutral spine.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWw0bHl5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pS6qtZrmN2rS0/giphy.gif'
  },
  { 
    id: 'ohp1', 
    name: 'Overhead Press', 
    sets: 3, 
    reps: '8-12', 
    restSeconds: 120, 
    rpeTarget: 8, 
    notes: 'Tight core, do not arch back.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWw0bHl5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRL7YrutHKsHtCg/giphy.gif'
  },
  { 
    id: 'pull1', 
    name: 'Pull Ups', 
    sets: 4, 
    reps: 'AMRAP', 
    restSeconds: 90, 
    rpeTarget: 9, 
    notes: 'Full range of motion.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWw0bHl5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMyf8Ff4D4q5zbi/giphy.gif'
  },
  { 
    id: 'db_row', 
    name: 'Dumbbell Row', 
    sets: 3, 
    reps: '10-12', 
    restSeconds: 90, 
    rpeTarget: 8, 
    notes: 'Keep torso stable.',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWw0bHl5Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3Znh3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKKl7Yn99nC1HhK/giphy.gif' 
  },
];

const INITIAL_WORLD_PROFILE: WorldProfile = {
  energy: 850,
  credits: 120,
  globalLevel: 3,
  inventory: [],
  areas: {
    'Salud & Energía': { name: 'Salud & Energía', level: 3, currentXp: 50, habits: [] },
    'Cuerpo & Movimiento': { name: 'Cuerpo & Movimiento', level: 4, currentXp: 20, habits: [] },
    'Trabajo / Empresa': { name: 'Trabajo / Empresa', level: 2, currentXp: 80, habits: [] },
    'Finanzas': { name: 'Finanzas', level: 2, currentXp: 10, habits: [] },
    'Relaciones': { name: 'Relaciones', level: 3, currentXp: 0, habits: [] },
    'Disciplina & Enfoque': { name: 'Disciplina & Enfoque', level: 5, currentXp: 90, habits: [] },
    'Desarrollo Personal': { name: 'Desarrollo Personal', level: 2, currentXp: 40, habits: [] },
    'Familia': { name: 'Familia', level: 4, currentXp: 10, habits: [] },
    'Descanso & Balance': { name: 'Descanso & Balance', level: 1, currentXp: 90, habits: [] },
  }
};

export const INITIAL_USER: User = {
  id: 'u1',
  username: 'Ed Sanhueza',
  email: 'ed.sanhuezag@gmail.com',
  role: UserRole.CLIENT,
  subscriptionStatus: SubscriptionStatus.ACTIVE,
  level: 5,
  currentXP: 5200,
  badges: [
    { id: 'b1', name: 'Miembro Fundador', description: 'Joined MUSCLEPRO Early Access', icon: '👑', dateEarned: new Date().toISOString() },
    { id: 'b2', name: 'Disciplina de Acero', description: '7 días de racha perfecta', icon: '🔥', dateEarned: new Date().toISOString() }
  ],
  stats: {
    age: 28,
    height: 178,
    weight: 82,
    gender: Gender.MALE,
    goal: Goal.HYPERTROPHY,
    level: ExperienceLevel.ADVANCED
  },
  currentPlan: {
    name: 'Protocolo Hipertrofia V2',
    description: 'Fase de acumulación de volumen. Énfasis en tensión mecánica.',
    split: 'Push / Pull / Legs',
    exercises: [...MOCK_EXERCISES_DB]
  },
  diet: {
    calories: 2800,
    meals: [
      { id: 'm1', name: 'Desayuno', calories: 600, protein: 40, carbs: 60, fats: 20, items: ['3 Huevos', 'Avena 80g', 'Frutos Rojos'] },
      { id: 'm2', name: 'Almuerzo', calories: 800, protein: 60, carbs: 90, fats: 25, items: ['Pollo 200g', 'Arroz 250g', 'Brócoli'] },
      { id: 'm3', name: 'Pre-Entreno', calories: 400, protein: 30, carbs: 50, fats: 10, items: ['Whey Protein', 'Plátano', 'Miel'] },
      { id: 'm4', name: 'Cena', calories: 600, protein: 50, carbs: 50, fats: 20, items: ['Salmón 200g', 'Papa Asada', 'Aceite Oliva'] },
    ]
  },
  cardio: {
    frequency: 'Diario',
    duration: '20 min',
    type: 'Caminata Inclinada (Zona 2)'
  },
  history: [
    { id: 'h1', date: new Date(Date.now() - 86400000 * 2).toISOString(), planName: 'Protocolo Hipertrofia V2', durationSeconds: 3600, volume: 12500, logs: [] },
    { id: 'h2', date: new Date(Date.now() - 86400000 * 4).toISOString(), planName: 'Protocolo Hipertrofia V2', durationSeconds: 3400, volume: 11800, logs: [] },
  ],
  dailyLogs: [
    {
      date: new Date().toISOString().split('T')[0],
      mealsEaten: ['m1', 'm2'],
      cardioDone: false
    }
  ],
  agenda: [
    { id: 'a1', title: 'Prep Comidas Semanales', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'TASK', completed: true, isGoogleEvent: false },
    { id: 'a2', title: 'Revisión Técnica con Coach', date: new Date().toISOString().split('T')[0], time: '18:00', type: 'APPOINTMENT', completed: false, isGoogleEvent: false },
  ],
  worldProfile: INITIAL_WORLD_PROFILE
};
