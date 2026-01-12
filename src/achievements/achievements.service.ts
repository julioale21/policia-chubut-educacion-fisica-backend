import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserAchievement } from './entities/user-achievement.entity';
import { AchievementType } from './enums/achievement-type.enum';
import { ACHIEVEMENT_DEFINITIONS } from './config/achievement-definitions';
import { ACHIEVEMENT_EVENTS } from './constants/achievement-events';
import { ExerciseCompletedEvent } from './events/exercise-completed.event';
import { RoutineProgressUpdatedEvent } from './events/routine-progress-updated.event';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { StatisticsService } from '../statistics/statistics.service';
import { ExerciseCompletion } from '../exercise-completions/entities/exercise-completion.entity';
import { ExerciseCategory } from '../common/enums/excersises-category.enum';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectRepository(UserAchievement)
    private readonly achievementRepo: Repository<UserAchievement>,
    @InjectRepository(ExerciseCompletion)
    private readonly completionRepo: Repository<ExerciseCompletion>,
    private readonly notificationsService: NotificationsService,
    private readonly statisticsService: StatisticsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ========== EVENT LISTENERS ==========

  @OnEvent(ACHIEVEMENT_EVENTS.EXERCISE_COMPLETED, { async: true })
  async handleExerciseCompleted(event: ExerciseCompletedEvent): Promise<void> {
    if (!event.isCompleted) return;

    this.logger.debug(`Checking achievements for user ${event.userId}`);

    try {
      await Promise.all([
        this.checkFirstExercise(event.userId),
        this.checkExerciseMilestones(event.userId),
        this.checkStreakAchievements(event.userId),
        this.checkComebackAchievement(event.userId),
        this.checkScheduleAchievements(event.userId, event.completionDate),
        this.checkCategoryAchievements(event.userId),
        this.checkTimeMilestones(event.userId),
      ]);
    } catch (error) {
      this.logger.error(
        `Error checking achievements: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(ACHIEVEMENT_EVENTS.ROUTINE_PROGRESS_UPDATED, { async: true })
  async handleRoutineProgressUpdated(
    event: RoutineProgressUpdatedEvent,
  ): Promise<void> {
    if (event.completionPercentage < 100) return;

    try {
      await this.checkFirstRoutineCompleted(event.userId, event.routineName);
    } catch (error) {
      this.logger.error(
        `Error checking routine achievement: ${error.message}`,
        error.stack,
      );
    }
  }

  // ========== ACHIEVEMENT CHECKS ==========

  private async checkFirstExercise(userId: string): Promise<void> {
    await this.unlockIfNotExists(userId, AchievementType.FIRST_EXERCISE);
  }

  private async checkExerciseMilestones(userId: string): Promise<void> {
    const totalExercises = await this.completionRepo.count({
      where: {
        routineAssignment: { student: { id: userId } },
        isCompleted: true,
      },
    });

    const milestones: { count: number; type: AchievementType }[] = [
      { count: 10, type: AchievementType.EXERCISES_10 },
      { count: 50, type: AchievementType.EXERCISES_50 },
      { count: 100, type: AchievementType.EXERCISES_100 },
      { count: 500, type: AchievementType.EXERCISES_500 },
    ];

    for (const milestone of milestones) {
      if (totalExercises >= milestone.count) {
        await this.unlockIfNotExists(userId, milestone.type, {
          totalExercises,
        });
      }
    }
  }

  private async checkStreakAchievements(userId: string): Promise<void> {
    try {
      const stats = await this.statisticsService.getUserStatistics(userId);
      const currentStreak = stats.currentStreak;

      const streakMilestones: { days: number; type: AchievementType }[] = [
        { days: 3, type: AchievementType.STREAK_3_DAYS },
        { days: 7, type: AchievementType.STREAK_7_DAYS },
        { days: 14, type: AchievementType.STREAK_14_DAYS },
        { days: 30, type: AchievementType.STREAK_30_DAYS },
      ];

      for (const milestone of streakMilestones) {
        if (currentStreak >= milestone.days) {
          await this.unlockIfNotExists(userId, milestone.type, {
            streakDays: currentStreak,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error checking streak achievements: ${error.message}`);
    }
  }

  private async checkFirstRoutineCompleted(
    userId: string,
    routineName: string,
  ): Promise<void> {
    await this.unlockIfNotExists(
      userId,
      AchievementType.FIRST_ROUTINE_COMPLETED,
      { routineName },
    );
  }

  // ========== NEW ACHIEVEMENT CHECKS ==========

  private async checkComebackAchievement(userId: string): Promise<void> {
    try {
      // Get all completions ordered by date
      const completions = await this.completionRepo.find({
        where: {
          routineAssignment: { student: { id: userId } },
          isCompleted: true,
        },
        order: { completionDate: 'DESC' },
        take: 100,
      });

      if (completions.length < 2) return;

      // Check if there was a gap of 7+ days between completions
      for (let i = 0; i < completions.length - 1; i++) {
        const current = new Date(completions[i].completionDate);
        const previous = new Date(completions[i + 1].completionDate);
        const diffDays = Math.floor(
          (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays >= 7) {
          await this.unlockIfNotExists(userId, AchievementType.COMEBACK, {
            daysInactive: diffDays,
          });
          break;
        }
      }
    } catch (error) {
      this.logger.error(
        `Error checking comeback achievement: ${error.message}`,
      );
    }
  }

  private async checkScheduleAchievements(
    userId: string,
    completionDate: Date,
  ): Promise<void> {
    try {
      const completions = await this.completionRepo.find({
        where: {
          routineAssignment: { student: { id: userId } },
          isCompleted: true,
        },
        order: { completionDate: 'DESC' },
      });

      // Early Bird - Count completions before 7am
      const earlyBirdCount = completions.filter((c) => {
        const hour = new Date(c.completionDate).getHours();
        return hour < 7;
      }).length;

      if (earlyBirdCount >= 10) {
        await this.unlockIfNotExists(userId, AchievementType.EARLY_BIRD, {
          earlyWorkouts: earlyBirdCount,
        });
      }

      // Night Owl - Count completions after 10pm
      const nightOwlCount = completions.filter((c) => {
        const hour = new Date(c.completionDate).getHours();
        return hour >= 22;
      }).length;

      if (nightOwlCount >= 10) {
        await this.unlockIfNotExists(userId, AchievementType.NIGHT_OWL, {
          lateWorkouts: nightOwlCount,
        });
      }

      // Weekend Warrior - Check if trained on Saturday AND Sunday in same week
      const now = new Date(completionDate);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weekCompletions = completions.filter((c) => {
        const date = new Date(c.completionDate);
        return date >= startOfWeek && date < endOfWeek;
      });

      const daysInWeek = new Set(
        weekCompletions.map((c) => new Date(c.completionDate).getDay()),
      );

      // 0 = Sunday, 6 = Saturday
      if (daysInWeek.has(0) && daysInWeek.has(6)) {
        await this.unlockIfNotExists(userId, AchievementType.WEEKEND_WARRIOR);
      }
    } catch (error) {
      this.logger.error(
        `Error checking schedule achievements: ${error.message}`,
      );
    }
  }

  private async checkCategoryAchievements(userId: string): Promise<void> {
    try {
      const completions = await this.completionRepo.find({
        where: {
          routineAssignment: { student: { id: userId } },
          isCompleted: true,
        },
        relations: ['routineExercise', 'routineExercise.exercise'],
      });

      // Count by category
      const categoryCounts: Record<string, number> = {};
      completions.forEach((c) => {
        const category = c.routineExercise?.exercise?.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      // Cardio Master - 50 cardio exercises
      if ((categoryCounts[ExerciseCategory.CARDIO] || 0) >= 50) {
        await this.unlockIfNotExists(userId, AchievementType.CARDIO_MASTER, {
          cardioExercises: categoryCounts[ExerciseCategory.CARDIO],
        });
      }

      // Strength Master - 50 strength exercises (FUERZA)
      if ((categoryCounts[ExerciseCategory.FUERZA] || 0) >= 50) {
        await this.unlockIfNotExists(userId, AchievementType.STRENGTH_MASTER, {
          strengthExercises: categoryCounts[ExerciseCategory.FUERZA],
        });
      }

      // Flexibility Master - 30 flexibility exercises
      if ((categoryCounts[ExerciseCategory.FLEXIBILIDAD] || 0) >= 30) {
        await this.unlockIfNotExists(
          userId,
          AchievementType.FLEXIBILITY_MASTER,
          {
            flexibilityExercises: categoryCounts[ExerciseCategory.FLEXIBILIDAD],
          },
        );
      }

      // Balanced Athlete - All 3 main categories in one week
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);

      const weekCompletions = completions.filter((c) => {
        const date = new Date(c.completionDate);
        return date >= weekAgo && date <= now;
      });

      const weekCategories = new Set(
        weekCompletions
          .map((c) => c.routineExercise?.exercise?.category)
          .filter(Boolean),
      );

      if (
        weekCategories.has(ExerciseCategory.CARDIO) &&
        weekCategories.has(ExerciseCategory.FUERZA) &&
        weekCategories.has(ExerciseCategory.FLEXIBILIDAD)
      ) {
        await this.unlockIfNotExists(userId, AchievementType.BALANCED_ATHLETE);
      }
    } catch (error) {
      this.logger.error(
        `Error checking category achievements: ${error.message}`,
      );
    }
  }

  private async checkTimeMilestones(userId: string): Promise<void> {
    try {
      // Get first completion date
      const firstCompletion = await this.completionRepo.findOne({
        where: {
          routineAssignment: { student: { id: userId } },
          isCompleted: true,
        },
        order: { completionDate: 'ASC' },
      });

      if (!firstCompletion) return;

      const startDate = new Date(firstCompletion.completionDate);
      const now = new Date();
      const daysSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const timeMilestones: { days: number; type: AchievementType }[] = [
        { days: 30, type: AchievementType.FIRST_MONTH },
        { days: 90, type: AchievementType.QUARTER_YEAR },
        { days: 180, type: AchievementType.HALF_YEAR },
        { days: 365, type: AchievementType.ONE_YEAR },
      ];

      for (const milestone of timeMilestones) {
        if (daysSinceStart >= milestone.days) {
          await this.unlockIfNotExists(userId, milestone.type, {
            daysSinceStart,
            startDate: startDate.toISOString(),
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error checking time milestones: ${error.message}`);
    }
  }

  // ========== CORE METHODS ==========

  private async unlockIfNotExists(
    userId: string,
    achievementType: AchievementType,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    // Check if already unlocked
    const existing = await this.achievementRepo.findOne({
      where: { userId, achievementType },
    });

    if (existing) {
      return false;
    }

    // Create achievement record
    const achievement = this.achievementRepo.create({
      userId,
      achievementType,
      metadata,
    });

    await this.achievementRepo.save(achievement);

    // Send notification
    await this.sendAchievementNotification(userId, achievementType, metadata);

    // Emit achievement unlocked event
    this.eventEmitter.emit(ACHIEVEMENT_EVENTS.ACHIEVEMENT_UNLOCKED, {
      userId,
      achievementType,
      metadata,
    });

    this.logger.log(
      `Achievement ${achievementType} unlocked for user ${userId}`,
    );
    return true;
  }

  private async sendAchievementNotification(
    userId: string,
    achievementType: AchievementType,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const definition = ACHIEVEMENT_DEFINITIONS[achievementType];

    await this.notificationsService.createAndSend({
      userId,
      title: `${definition.title}`,
      body: definition.description,
      type: NotificationType.ACHIEVEMENT,
      data: {
        achievementType,
        icon: definition.icon,
        points: definition.points,
        category: definition.category,
        ...metadata,
      },
    });
  }

  // ========== PUBLIC API ==========

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.achievementRepo.find({
      where: { userId },
      order: { unlockedAt: 'DESC' },
    });
  }

  async getAllAchievementsWithStatus(userId: string): Promise<{
    unlocked: (UserAchievement & {
      definition: (typeof ACHIEVEMENT_DEFINITIONS)[AchievementType];
    })[];
    locked: (typeof ACHIEVEMENT_DEFINITIONS)[AchievementType][];
  }> {
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedTypes = new Set(
      userAchievements.map((a) => a.achievementType),
    );

    const unlocked = userAchievements.map((a) => ({
      ...a,
      definition: ACHIEVEMENT_DEFINITIONS[a.achievementType],
    }));

    const locked = Object.values(ACHIEVEMENT_DEFINITIONS).filter(
      (def) => !unlockedTypes.has(def.type),
    );

    return { unlocked, locked };
  }

  async getAchievementStats(userId: string): Promise<{
    totalUnlocked: number;
    totalAvailable: number;
    totalPoints: number;
    recentAchievement: UserAchievement | null;
  }> {
    const achievements = await this.getUserAchievements(userId);
    const totalPoints = achievements.reduce((sum, a) => {
      const def = ACHIEVEMENT_DEFINITIONS[a.achievementType];
      return sum + (def.points || 0);
    }, 0);

    return {
      totalUnlocked: achievements.length,
      totalAvailable: Object.keys(AchievementType).length,
      totalPoints,
      recentAchievement: achievements[0] || null,
    };
  }
}
