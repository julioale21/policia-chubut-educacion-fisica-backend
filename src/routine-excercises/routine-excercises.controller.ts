import { CreateRoutineExerciseDto } from './dto/create-routine-excercise.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';

import { UpdateRoutineExcerciseDto } from './dto/update-routine-excercise.dto';
import { RoutineExercisesService } from './routine-excercises.service';

@Controller('routine-excercises')
export class RoutineExcercisesController {
  constructor(
    private readonly routineExcercisesService: RoutineExercisesService,
  ) {}

  @Post(':routineId')
  create(
    @Param('routineId', ParseUUIDPipe) routineId: string,
    @Body(ValidationPipe) createRoutineExerciseDto: CreateRoutineExerciseDto,
  ) {
    return this.routineExcercisesService.create(
      routineId,
      createRoutineExerciseDto,
    );
  }

  @Get()
  findAll() {
    return this.routineExcercisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routineExcercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoutineExcerciseDto: UpdateRoutineExcerciseDto,
  ) {
    return this.routineExcercisesService.update(id, updateRoutineExcerciseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routineExcercisesService.remove(id);
  }
}
