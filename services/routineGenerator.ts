
import { Gender, ExperienceLevel, Goal, Exercise } from '../types';

const MACHINE_EXERCISES = {
  MALE: {
    BEGINNER: [
      { id: 'm_cp', name: 'Chest Press Machine', sets: 3, reps: '12', restSeconds: 90, notes: 'Foco en contracción pectoral.' },
      { id: 'm_lp', name: 'Lat Pulldown Machine', sets: 3, reps: '12', restSeconds: 90, notes: 'Espalda recta, hombros abajo.' },
      { id: 'm_legp', name: 'Leg Press 45°', sets: 3, reps: '15', restSeconds: 120, notes: 'No bloquees rodillas.' },
      { id: 'm_sp', name: 'Shoulder Press Machine', sets: 3, reps: '12', restSeconds: 90, notes: 'Controla el descenso.' }
    ],
    INTERMEDIATE: [
      { id: 'm_pc', name: 'Pec Deck Machine', sets: 4, reps: '10-12', restSeconds: 75 },
      { id: 'm_row', name: 'Seated Row Machine', sets: 4, reps: '10-12', restSeconds: 75 },
      { id: 'm_hack', name: 'Hack Squat Machine', sets: 4, reps: '10-12', restSeconds: 120 },
      { id: 'm_ext', name: 'Leg Extension', sets: 4, reps: '15', restSeconds: 60 }
    ],
    ADVANCED: [
      { id: 'm_dip', name: 'Assisted Dip Machine', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'm_cur', name: 'Leg Curl Seated', sets: 4, reps: '12-15', restSeconds: 60 },
      { id: 'm_inc', name: 'Incline Chest Press Machine', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'm_lat', name: 'Lateral Raise Machine', sets: 4, reps: '15-20', restSeconds: 45 }
    ]
  },
  FEMALE: {
    BEGINNER: [
      { id: 'f_lp', name: 'Leg Press Horizontal', sets: 3, reps: '15', restSeconds: 90, notes: 'Empuje con talones.' },
      { id: 'f_pul', name: 'Lat Pulldown Wide', sets: 3, reps: '12', restSeconds: 90 },
      { id: 'f_glu', name: 'Glute Kickback Machine', sets: 3, reps: '15', restSeconds: 60 },
      { id: 'f_che', name: 'Chest Press Machine', sets: 3, reps: '12', restSeconds: 90 }
    ],
    INTERMEDIATE: [
      { id: 'f_abd', name: 'Abductor Machine', sets: 4, reps: '20', restSeconds: 45 },
      { id: 'f_add', name: 'Adductor Machine', sets: 4, reps: '20', restSeconds: 45 },
      { id: 'f_thr', name: 'Hip Thrust Machine', sets: 4, reps: '12-15', restSeconds: 90 },
      { id: 'f_row', name: 'Seated Cable Row', sets: 3, reps: '12', restSeconds: 60 }
    ],
    ADVANCED: [
      { id: 'f_sqt', name: 'Smith Machine Squat', sets: 4, reps: '10-12', restSeconds: 120 },
      { id: 'f_ext', name: 'Leg Extension', sets: 4, reps: '15', restSeconds: 60, notes: 'Dropset en última serie.' },
      { id: 'f_cur', name: 'Lying Leg Curl', sets: 4, reps: '12', restSeconds: 60 },
      { id: 'f_shl', name: 'Shoulder Press Machine', sets: 3, reps: '12', restSeconds: 60 }
    ]
  }
};

export const generatePlan = (gender: Gender, level: ExperienceLevel, goal: Goal) => {
  const exercises = MACHINE_EXERCISES[gender][level];
  const days = level === ExperienceLevel.BEGINNER ? 4 : level === ExperienceLevel.INTERMEDIATE ? 5 : 6;
  
  return {
    name: `Protocolo ${level} ${gender === Gender.MALE ? 'Masculino' : 'Femenino'}`,
    description: `Plan de ${days} días enfocado en máquinas para máxima hipertrofia y seguridad técnica.`,
    split: days === 4 ? 'Torso/Pierna' : days === 5 ? 'Push/Pull/Legs/Upper/Lower' : 'PPL x 2',
    exercises: exercises
  };
};
