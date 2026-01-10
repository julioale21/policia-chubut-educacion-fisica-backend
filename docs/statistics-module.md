# Plan: Backend Statistics Module

## Objective

Create a statistics module in the NestJS backend that provides aggregated data for the Flutter frontend progress section.

---

## Existing Backend Architecture

### Relevant Entities:
- **User**: User profile with demographic data
- **Routine**: Exercise routines with duration in days
- **RoutineAssignment**: Routine assignment to user (startDate, endDate)
- **RoutineExercise**: Exercises within a routine (dayOfRoutine, order)
- **Exercise**: Exercise catalog (category: FUERZA, CARDIO, FLEXIBILIDAD, etc.)
- **ExerciseCompletion**: Completed exercise records (isCompleted, completionDate)

### Existing Service:
- `ExerciseProgressService` already calculates progress per routine
- Returns: totalDays, completedDays, percentage, progress per day

---

## Endpoint to Create

### `GET /statistics/user`
Returns aggregated statistics for the authenticated user.

**Response DTO:**
```typescript
{
  overallProgress: number;        // 0-100, average of all routines
  totalDaysCompleted: number;     // total completed days
  totalDaysInProgram: number;     // total days in programs
  activeRoutines: number;         // active routines
  currentStreak: number;          // current streak (consecutive days)
  longestStreak: number;          // longest streak
  lastWorkoutDate: Date | null;   // last completed exercise
  categoryProgress: {             // progress by category
    [category: string]: number;   // FUERZA: 75, CARDIO: 60, etc.
  };
  weeklyData: WeeklyProgressDto[];  // last 7 days
  routines: RoutineStatsDto[];      // summary of each routine
}

WeeklyProgressDto {
  date: Date;
  exercisesCompleted: number;
  dayOfWeek: number;  // 1-7
}

RoutineStatsDto {
  id: string;
  name: string;
  category: string;           // predominant category
  progress: number;           // 0-100
  completedDays: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
}
```

---

## Files to Create

### 1. Statistics Module
**File:** `src/statistics/statistics.module.ts`

### 2. Controller
**File:** `src/statistics/statistics.controller.ts`
- `GET /statistics/user` - Get authenticated user statistics

### 3. Service
**File:** `src/statistics/statistics.service.ts`
- Methods to calculate each statistic
- Inject necessary repositories

### 4. DTOs
**File:** `src/statistics/dto/user-statistics.dto.ts`
- UserStatisticsDto
- WeeklyProgressDto
- RoutineStatsDto

---

## Implementation

### Step 1: Create module structure
```
src/statistics/
├── statistics.module.ts
├── statistics.controller.ts
├── statistics.service.ts
└── dto/
    └── user-statistics.dto.ts
```

### Step 2: Implement DTOs

### Step 3: Implement Service with methods:
- `getUserStatistics(userId: string)`: Main method
- `calculateOverallProgress(assignments)`: Average progress
- `calculateStreak(completions)`: Consecutive days streak
- `calculateCategoryProgress(completions, exercises)`: By category
- `getWeeklyData(completions)`: Last 7 days
- `getRoutineStats(assignments)`: Summary per routine

### Step 4: Implement Controller

### Step 5: Register module in app.module.ts

---

## Statistics Calculations

### Overall Progress
```typescript
// Weighted average of progress from all active routines
overallProgress = sum(routine.percentage) / activeRoutines.length
```

### Current Streak
```typescript
// Consecutive days with at least 1 completed exercise
// Starting from today backwards
let streak = 0;
let currentDate = today;
while (hasCompletionOnDate(currentDate)) {
  streak++;
  currentDate = currentDate - 1 day;
}
```

### Category Progress
```typescript
// For each category, calculate % of completed exercises
categoryProgress = {
  FUERZA: (completedFuerza / totalFuerza) * 100,
  CARDIO: (completedCardio / totalCardio) * 100,
  // etc.
}
```

### Weekly Data
```typescript
// Last 7 days, count completed exercises per day
weeklyData = last7Days.map(date => ({
  date,
  exercisesCompleted: countCompletionsOnDate(date),
  dayOfWeek: date.getDay()
}))
```

---

## Critical Files

| File | Action |
|------|--------|
| `src/statistics/statistics.module.ts` | Create |
| `src/statistics/statistics.controller.ts` | Create |
| `src/statistics/statistics.service.ts` | Create |
| `src/statistics/dto/user-statistics.dto.ts` | Create |
| `src/app.module.ts` | Modify (import StatisticsModule) |

---

## Verification

1. Create the module and verify it compiles (`npm run build`)
2. Start the server (`npm run start:dev`)
3. Make request to `GET /statistics/user` with valid JWT
4. Verify correct data is returned
5. Test with user without data (should return values at 0)
6. Integrate with Flutter frontend

---

## Dependencies

- TypeORM (already installed)
- @nestjs/common, @nestjs/typeorm (already installed)
- Repositories: User, RoutineAssignment, ExerciseCompletion, RoutineExercise, Exercise
