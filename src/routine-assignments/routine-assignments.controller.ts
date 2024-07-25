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
import { RoutineAssignmentsService } from './routine-assignments.service';
import { CreateRoutineAssignmentDto } from './dto/create-routine-assignment.dto';
import { UpdateRoutineAssignmentDto } from './dto/update-routine-assignment.dto';

@Controller('routine-assignments')
export class RoutineAssignmentsController {
  constructor(
    private readonly routineAssignmentsService: RoutineAssignmentsService,
  ) {}

  @Post()
  create(@Body() createRoutineAssignmentDto: CreateRoutineAssignmentDto) {
    return this.routineAssignmentsService.create(createRoutineAssignmentDto);
  }

  @Get()
  findAll() {
    return this.routineAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routineAssignmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoutineAssignmentDto: UpdateRoutineAssignmentDto,
  ) {
    return this.routineAssignmentsService.update(
      id,
      updateRoutineAssignmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routineAssignmentsService.remove(+id);
  }
}
