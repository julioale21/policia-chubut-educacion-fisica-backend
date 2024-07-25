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
import { ExcercisesService } from './excercises.service';
import { CreateExcerciseDto } from './dto/create-excercise.dto';
import { UpdateExcerciseDto } from './dto/update-excercise.dto';

@Controller('excercises')
export class ExcercisesController {
  constructor(private readonly excercisesService: ExcercisesService) {}

  @Post()
  create(@Body() createExcerciseDto: CreateExcerciseDto) {
    return this.excercisesService.create(createExcerciseDto);
  }

  @Get()
  findAll() {
    return this.excercisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.excercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExcerciseDto: UpdateExcerciseDto,
  ) {
    return this.excercisesService.update(id, updateExcerciseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.excercisesService.remove(id);
  }
}
