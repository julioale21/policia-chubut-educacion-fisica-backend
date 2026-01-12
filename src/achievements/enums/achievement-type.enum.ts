export enum AchievementType {
  // First-time achievements
  FIRST_EXERCISE = 'first_exercise',
  FIRST_ROUTINE_COMPLETED = 'first_routine',

  // Streak achievements
  STREAK_3_DAYS = 'streak_3_days',
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_14_DAYS = 'streak_14_days',
  STREAK_30_DAYS = 'streak_30_days',

  // Exercise milestone achievements
  EXERCISES_10 = 'exercises_10',
  EXERCISES_50 = 'exercises_50',
  EXERCISES_100 = 'exercises_100',
  EXERCISES_500 = 'exercises_500',

  // Recovery/Resilience achievements
  COMEBACK = 'comeback', // Return after 7+ days inactive

  // Schedule-based achievements
  EARLY_BIRD = 'early_bird', // 10 workouts before 7am
  NIGHT_OWL = 'night_owl', // 10 workouts after 10pm
  WEEKEND_WARRIOR = 'weekend_warrior', // Train on Saturday AND Sunday

  // Category-based achievements (based on exercise category)
  CARDIO_MASTER = 'cardio_master', // 50 cardio exercises
  STRENGTH_MASTER = 'strength_master', // 50 strength exercises
  FLEXIBILITY_MASTER = 'flexibility_master', // 30 flexibility exercises
  BALANCED_ATHLETE = 'balanced_athlete', // All 3 categories in one week

  // Time-based milestones
  FIRST_MONTH = 'first_month', // Active for 1 month
  QUARTER_YEAR = 'quarter_year', // Active for 3 months
  HALF_YEAR = 'half_year', // Active for 6 months
  ONE_YEAR = 'one_year', // Active for 1 year
}
