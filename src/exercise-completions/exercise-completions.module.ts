import { Module } from '@nestjs/common';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { ExerciseCompletionsController } from './exercise-completions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseCompletion } from './entities/exercise-completion.entity';

@Module({
  controllers: [ExerciseCompletionsController],
  providers: [ExerciseCompletionsService],
  imports: [TypeOrmModule.forFeature([ExerciseCompletion])],
})
export class ExerciseCompletionsModule {}
