import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user-decorator';
import { User } from 'src/auth/entities/user.entity';
import { UserStatisticsDto } from './dto/user-statistics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user')
  @Auth()
  async getUserStatistics(@GetUser() user: User): Promise<UserStatisticsDto> {
    return this.statisticsService.getUserStatistics(user.id);
  }
}
