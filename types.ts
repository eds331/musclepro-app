
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum Goal {
  HYPERTROPHY = 'HYPERTROPHY',
  STRENGTH = 'STRENGTH',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  ATHLETIC_PERFORMANCE = 'ATHLETIC_PERFORMANCE'
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  PAYMENT_PENDING = 'PAYMENT_PENDING'
}

export interface UserStats {
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: Gender;
  goal: Goal;
  level: ExperienceLevel;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-12"
  rpeTarget?: number;
  restSeconds: number;
  videoUrl?: string; 
  gifUrl?: string; 
  notes?: string;
}

export interface WorkoutSetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  sets: WorkoutSetLog[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO
  planName: string;
  durationSeconds: number;
  volume: number;
  logs: WorkoutExerciseLog[];
  xpEarned?: number;
}

export interface DietMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
}

export interface DailyLog {
  date: string; // ISO Date YYYY-MM-DD
  mealsEaten: string[]; // IDs of meals eaten
  cardioDone: boolean;
  workoutCompletedId?: string; // ID of the workout session if done
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; 
  dateEarned: string;
}

// --- AGENDA TYPES (Updated) ---

export type AgendaItemType = 'TASK' | 'MEETING' | 'REMINDER' | 'APPOINTMENT';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: AgendaItemType;
  completed: boolean;
  isGoogleEvent: boolean; // To distinguish synced events
}

// --- MUNDO MUSCLEPRO TYPES (New Module) ---

export type LifeAreaName = 
  | 'Salud & Energía'
  | 'Cuerpo & Movimiento'
  | 'Trabajo / Empresa'
  | 'Finanzas'
  | 'Relaciones'
  | 'Disciplina & Enfoque'
  | 'Desarrollo Personal'
  | 'Familia'
  | 'Descanso & Balance';

export interface LifeHabit {
  id: string;
  text: string;
  impactEnergy: number; // Can be negative
  impactXp: number;
  impactCredits: number;
}

export interface LifeArea {
  name: LifeAreaName;
  level: number;
  currentXp: number;
  habits: LifeHabit[];
}

export interface WorldProfile {
  energy: number; // Max 1000
  credits: number;
  globalLevel: number;
  areas: Record<LifeAreaName, LifeArea>;
  inventory: string[]; // Items bought
}

// Social & Match Types
export interface SocialPartner {
  id: string;
  username: string;
  level: number;
  goal: Goal;
  experience: ExperienceLevel;
  avatarColor: string;
  matchPercentage: number; // Calculated dynamically
  isOnline: boolean;
}

export interface SocialMessage {
  id: string;
  senderId: string; // 'me' or partnerId
  text: string;
  timestamp: string;
}

// ------------------------------------------

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  stats?: UserStats;
  
  // Gamification Core Fitness
  level: number;
  currentXP: number;
  badges: Badge[];

  currentPlan?: {
    name: string;
    description: string;
    split: string;
    exercises: Exercise[];
  };
  diet?: {
    calories: number;
    meals: DietMeal[];
  };
  cardio?: {
    frequency: string;
    duration: string;
    type: string;
  };
  history: WorkoutSession[];
  dailyLogs: DailyLog[]; // Track daily adherence

  // NEW: Agenda Data
  agenda: AgendaItem[];

  // NEW: World Module Data
  worldProfile?: WorldProfile;
}
