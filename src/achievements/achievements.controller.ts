import { Controller, Get } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@Auth()
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async getUserAchievements(@GetUser() user: User) {
    return this.achievementsService.getAllAchievementsWithStatus(user.id);
  }

  @Get('stats')
  async getAchievementStats(@GetUser() user: User) {
    return this.achievementsService.getAchievementStats(user.id);
  }
}
