import { AchievementType } from '../enums/achievement-type.enum';
import { AchievementDefinition } from '../config/achievement-definitions';

export class AchievementResponseDto {
  id: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  unlockedAt: Date;
  metadata?: Record<string, any>;
}

export class AchievementStatsResponseDto {
  totalUnlocked: number;
  totalAvailable: number;
  totalPoints: number;
  recentAchievement: AchievementResponseDto | null;
}

export class AllAchievementsResponseDto {
  unlocked: AchievementResponseDto[];
  locked: Omit<AchievementDefinition, 'type'>[];
}
