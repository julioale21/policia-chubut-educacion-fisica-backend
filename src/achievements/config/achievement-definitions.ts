import { AchievementType } from '../enums/achievement-type.enum';

export interface AchievementDefinition {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: 'first_time' | 'streak' | 'milestone' | 'schedule' | 'category' | 'time';
}

export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  AchievementDefinition
> = {
  // First-time achievements
  [AchievementType.FIRST_EXERCISE]: {
    type: AchievementType.FIRST_EXERCISE,
    title: 'Primer Paso',
    description:
      'Completaste tu primer ejercicio. El viaje de mil millas comienza con un solo paso.',
    icon: 'trophy_first',
    points: 10,
    category: 'first_time',
  },
  [AchievementType.FIRST_ROUTINE_COMPLETED]: {
    type: AchievementType.FIRST_ROUTINE_COMPLETED,
    title: 'Mision Cumplida',
    description: 'Completaste tu primera rutina al 100%. Excelente compromiso.',
    icon: 'medal_gold',
    points: 50,
    category: 'first_time',
  },

  // Streak achievements
  [AchievementType.STREAK_3_DAYS]: {
    type: AchievementType.STREAK_3_DAYS,
    title: 'Racha de 3 Dias',
    description: '3 dias consecutivos entrenando. Estas creando un habito.',
    icon: 'fire_3',
    points: 15,
    category: 'streak',
  },
  [AchievementType.STREAK_7_DAYS]: {
    type: AchievementType.STREAK_7_DAYS,
    title: 'Primera Semana',
    description: '7 dias consecutivos. Una semana completa de dedicacion.',
    icon: 'fire_7',
    points: 30,
    category: 'streak',
  },
  [AchievementType.STREAK_14_DAYS]: {
    type: AchievementType.STREAK_14_DAYS,
    title: 'Dos Semanas',
    description: '14 dias consecutivos. Tu disciplina es admirable.',
    icon: 'fire_14',
    points: 60,
    category: 'streak',
  },
  [AchievementType.STREAK_30_DAYS]: {
    type: AchievementType.STREAK_30_DAYS,
    title: 'Primer Mes',
    description: '30 dias consecutivos. Eres un ejemplo de constancia.',
    icon: 'fire_30',
    points: 150,
    category: 'streak',
  },

  // Exercise milestone achievements
  [AchievementType.EXERCISES_10]: {
    type: AchievementType.EXERCISES_10,
    title: '10 Ejercicios',
    description: 'Has completado 10 ejercicios en total.',
    icon: 'dumbbell_bronze',
    points: 20,
    category: 'milestone',
  },
  [AchievementType.EXERCISES_50]: {
    type: AchievementType.EXERCISES_50,
    title: '50 Ejercicios',
    description: 'Has completado 50 ejercicios. Sigue asi.',
    icon: 'dumbbell_silver',
    points: 50,
    category: 'milestone',
  },
  [AchievementType.EXERCISES_100]: {
    type: AchievementType.EXERCISES_100,
    title: 'Centenario',
    description: '100 ejercicios completados. Eres imparable.',
    icon: 'dumbbell_gold',
    points: 100,
    category: 'milestone',
  },
  [AchievementType.EXERCISES_500]: {
    type: AchievementType.EXERCISES_500,
    title: 'Leyenda',
    description: '500 ejercicios. Tu dedicacion es legendaria.',
    icon: 'dumbbell_platinum',
    points: 500,
    category: 'milestone',
  },

  // Recovery/Resilience achievements
  [AchievementType.COMEBACK]: {
    type: AchievementType.COMEBACK,
    title: 'Resiliencia',
    description: 'Volviste despues de una pausa. Caer esta permitido, quedarse no.',
    icon: 'comeback',
    points: 25,
    category: 'first_time',
  },

  // Schedule-based achievements
  [AchievementType.EARLY_BIRD]: {
    type: AchievementType.EARLY_BIRD,
    title: 'Guardia Matutina',
    description: '10 entrenamientos antes de las 7am. Mientras otros duermen, tu avanzas.',
    icon: 'early_bird',
    points: 40,
    category: 'schedule',
  },
  [AchievementType.NIGHT_OWL]: {
    type: AchievementType.NIGHT_OWL,
    title: 'Turno Nocturno',
    description: '10 entrenamientos despues de las 10pm. Ni el cansancio te detiene.',
    icon: 'night_owl',
    points: 40,
    category: 'schedule',
  },
  [AchievementType.WEEKEND_WARRIOR]: {
    type: AchievementType.WEEKEND_WARRIOR,
    title: 'Guerrero de Fin de Semana',
    description: 'Entrenaste sabado y domingo. Sin dias libres para la disciplina.',
    icon: 'weekend_warrior',
    points: 30,
    category: 'schedule',
  },

  // Category-based achievements
  [AchievementType.CARDIO_MASTER]: {
    type: AchievementType.CARDIO_MASTER,
    title: 'Corazon de Acero',
    description: '50 ejercicios cardiovasculares. Resistencia que no se rinde.',
    icon: 'cardio_master',
    points: 60,
    category: 'category',
  },
  [AchievementType.STRENGTH_MASTER]: {
    type: AchievementType.STRENGTH_MASTER,
    title: 'Fuerza Interior',
    description: '50 ejercicios de fuerza. La fuerza viene de adentro.',
    icon: 'strength_master',
    points: 60,
    category: 'category',
  },
  [AchievementType.FLEXIBILITY_MASTER]: {
    type: AchievementType.FLEXIBILITY_MASTER,
    title: 'Flexibilidad',
    description: '30 ejercicios de estiramiento. Adaptarse es sobrevivir.',
    icon: 'flexibility_master',
    points: 40,
    category: 'category',
  },
  [AchievementType.BALANCED_ATHLETE]: {
    type: AchievementType.BALANCED_ATHLETE,
    title: 'Atleta Equilibrado',
    description: 'Cardio, fuerza y flexibilidad en una semana. Cuerpo completo, mente completa.',
    icon: 'balanced_athlete',
    points: 50,
    category: 'category',
  },

  // Time-based milestones
  [AchievementType.FIRST_MONTH]: {
    type: AchievementType.FIRST_MONTH,
    title: 'Primer Mes Activo',
    description: 'Un mes completo de actividad. El primer mes es el mas dificil.',
    icon: 'first_month',
    points: 75,
    category: 'time',
  },
  [AchievementType.QUARTER_YEAR]: {
    type: AchievementType.QUARTER_YEAR,
    title: 'Trimestre de Oro',
    description: '3 meses activo. La constancia se vuelve habito.',
    icon: 'quarter_year',
    points: 150,
    category: 'time',
  },
  [AchievementType.HALF_YEAR]: {
    type: AchievementType.HALF_YEAR,
    title: 'Semestre de Hierro',
    description: '6 meses de actividad. Medio año transformandote.',
    icon: 'half_year',
    points: 300,
    category: 'time',
  },
  [AchievementType.ONE_YEAR]: {
    type: AchievementType.ONE_YEAR,
    title: 'Veterano',
    description: 'Un año completo. Tu dedicacion es inspiradora.',
    icon: 'one_year',
    points: 500,
    category: 'time',
  },
};
