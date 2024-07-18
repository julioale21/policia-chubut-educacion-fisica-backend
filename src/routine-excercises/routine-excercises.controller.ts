import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoutineExcercisesService } from './routine-excercises.service';
import { CreateRoutineExcerciseDto } from './dto/create-routine-excercise.dto';
import { UpdateRoutineExcerciseDto } from './dto/update-routine-excercise.dto';

@Controller('routine-excercises')
export class RoutineExcercisesController {
  constructor(private readonly routineExcercisesService: RoutineExcercisesService) {}

  @Post()
  create(@Body() createRoutineExcerciseDto: CreateRoutineExcerciseDto) {
    return this.routineExcercisesService.create(createRoutineExcerciseDto);
  }

  @Get()
  findAll() {
    return this.routineExcercisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routineExcercisesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoutineExcerciseDto: UpdateRoutineExcerciseDto) {
    return this.routineExcercisesService.update(+id, updateRoutineExcerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routineExcercisesService.remove(+id);
  }
}
