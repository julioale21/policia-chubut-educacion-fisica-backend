import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExerciseProgressService } from './exercise-progress.service';
import { ToggleExerciseDto } from './dto/toggle-exercise.dto';
import { Auth } from 'src/auth/decorators';

@Auth()
@Controller('exercise-progress')
export class ExerciseProgressController {
  constructor(private readonly progressService: ExerciseProgressService) {}

  @Post('toggle')
  toggleExercise(@Body() toggleExerciseDto: ToggleExerciseDto) {
    return this.progressService.toggleExercise(toggleExerciseDto);
  }

  @Get(':assignmentId')
  getProgress(@Param('assignmentId') assignmentId: string) {
    return this.progressService.getRoutineProgress(assignmentId);
  }
}
