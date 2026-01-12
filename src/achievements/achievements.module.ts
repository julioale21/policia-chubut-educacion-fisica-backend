import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAchievement } from './entities/user-achievement.entity';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { ExerciseCompletion } from '../exercise-completions/entities/exercise-completion.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAchievement, ExerciseCompletion]),
    NotificationsModule,
    StatisticsModule,
    AuthModule,
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
