
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
      { id: 'm_ext', name: 'Leg Extension', sets: 4, reps: '15', restSeconds: 60 },
      { id: 'm_cur', name: 'Lying Leg Curl', sets: 3, reps: '12', restSeconds: 60 }
    ],
    ADVANCED: [
      { id: 'm_dip', name: 'Assisted Dip Machine', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'm_inc', name: 'Incline Chest Press Machine', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'm_lat', name: 'Lateral Raise Machine', sets: 4, reps: '15-20', restSeconds: 45 },
      { id: 'm_lp45', name: 'Leg Press 45 (Unilateral)', sets: 4, reps: '12', restSeconds: 90 },
      { id: 'm_cal', name: 'Standing Calf Raise Machine', sets: 4, reps: '20', restSeconds: 45 },
      { id: 'm_puv', name: 'Pullover Machine', sets: 3, reps: '12', restSeconds: 75 }
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
      { id: 'f_row', name: 'Seated Cable Row', sets: 3, reps: '12', restSeconds: 60 },
      { id: 'f_ext', name: 'Leg Extension', sets: 3, reps: '15', restSeconds: 60 }
    ],
    ADVANCED: [
      { id: 'f_sqt', name: 'Smith Machine Squat', sets: 4, reps: '10-12', restSeconds: 120 },
      { id: 'f_thr_h', name: 'Heavy Hip Thrust Machine', sets: 4, reps: '8-10', restSeconds: 120 },
      { id: 'f_ext_d', name: 'Leg Extension (Dropset)', sets: 4, reps: '15', restSeconds: 60 },
      { id: 'f_cur', name: 'Lying Leg Curl', sets: 4, reps: '12', restSeconds: 60 },
      { id: 'f_shl', name: 'Shoulder Press Machine', sets: 3, reps: '12', restSeconds: 60 },
      { id: 'f_pc', name: 'Pec Deck (Flys)', sets: 3, reps: '15', restSeconds: 60 }
    ]
  }
};

export const generatePlan = (gender: Gender, level: ExperienceLevel, goal: Goal) => {
  const exercises = MACHINE_EXERCISES[gender][level];
  const days = level === ExperienceLevel.BEGINNER ? 4 : level === ExperienceLevel.INTERMEDIATE ? 5 : 6;
  
  return {
    name: `Protocolo ${level === ExperienceLevel.BEGINNER ? 'Bronce' : level === ExperienceLevel.INTERMEDIATE ? 'Plata' : 'Oro'} ${gender === Gender.MALE ? 'Masculino' : 'Femenino'}`,
    description: `Diseño biomecánico de ${days} días enfocado en máquinas para máxima hipertrofia.`,
    split: days === 4 ? 'Full Body / Upper-Lower' : days === 5 ? 'Push-Pull-Legs-Upper-Lower' : 'PPL x 2 (Elite Frequency)',
    exercises: exercises
  };
};
