import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExerciseProgressService } from './exercise-progress.service';
import { ToggleExerciseDto } from './dto/toggle-exercise.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Auth()
@Controller('exercise-progress')
export class ExerciseProgressController {
  constructor(private readonly progressService: ExerciseProgressService) {}

  @Post('toggle')
  toggleExercise(
    @Body() toggleExerciseDto: ToggleExerciseDto,
    @GetUser() user: User,
  ) {
    return this.progressService.toggleExercise(toggleExerciseDto, user.id);
  }

  @Get(':assignmentId')
  getProgress(@Param('assignmentId') assignmentId: string) {
    return this.progressService.getRoutineProgress(assignmentId);
  }
}
