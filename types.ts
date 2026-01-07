
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
  height: number;
  weight: number;
  gender: Gender;
  goal: Goal;
  level: ExperienceLevel;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
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
  date: string;
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
  date: string;
  mealsEaten: string[];
  cardioDone: boolean;
  workoutCompletedId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; 
  dateEarned: string;
}

export type AgendaItemType = 'TASK' | 'MEETING' | 'REMINDER' | 'APPOINTMENT';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: AgendaItemType;
  completed: boolean;
  isGoogleEvent: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  stats?: UserStats;
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
  dailyLogs: DailyLog[]; 
  agenda: AgendaItem[];
  // syncTimestamp is used to track the latest version of the user data in the cloud
  syncTimestamp?: number;
}
