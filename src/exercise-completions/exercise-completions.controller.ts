import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { UpdateExerciseCompletionDto } from './dto/update-exercise-completion.dto';

@Controller('exercise-completions')
export class ExerciseCompletionsController {
  constructor(
    private readonly exerciseCompletionsService: ExerciseCompletionsService,
  ) {}

  @Post()
  create(@Body() createExerciseCompletionDto: CreateExerciseCompletionDto) {
    return this.exerciseCompletionsService.create(createExerciseCompletionDto);
  }

  @Get()
  findAll() {
    return this.exerciseCompletionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.exerciseCompletionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExerciseCompletionDto: UpdateExerciseCompletionDto,
  ) {
    return this.exerciseCompletionsService.update(
      id,
      updateExerciseCompletionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.exerciseCompletionsService.remove(id);
  }
}
