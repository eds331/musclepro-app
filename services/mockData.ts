
import { User, UserRole, Gender, Goal, ExperienceLevel, SubscriptionStatus } from "../types";

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
  }
];

export const INITIAL_USER: User = {
  id: 'u1',
  username: 'Ed Sanhueza',
  email: 'ed.sanhuezag@gmail.com',
  role: UserRole.ADMIN, // CAMBIADO A ADMIN PARA ACCESO TOTAL
  subscriptionStatus: SubscriptionStatus.ACTIVE,
  level: 5,
  currentXP: 5200,
  badges: [
    { id: 'b1', name: 'Miembro Fundador', description: 'Joined MUSCLEPRO Early Access', icon: '👑', dateEarned: new Date().toISOString() }
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
    description: 'Fase de acumulación de volumen.',
    split: 'Push / Pull / Legs',
    exercises: [...MOCK_EXERCISES_DB]
  },
  diet: {
    calories: 2800,
    meals: [
      { id: 'm1', name: 'Desayuno', calories: 600, protein: 40, carbs: 60, fats: 20, items: ['3 Huevos', 'Avena 80g'] },
      { id: 'm2', name: 'Almuerzo', calories: 800, protein: 60, carbs: 90, fats: 25, items: ['Pollo 200g', 'Arroz 250g'] },
    ]
  },
  cardio: {
    frequency: 'Diario',
    duration: '20 min',
    type: 'Caminata Inclinada'
  },
  history: [],
  dailyLogs: [],
  agenda: []
};
