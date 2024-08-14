import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ParseUuidPipe } from 'src/common/pipes/parse-uuid/parse-uuid.pipe';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(createRoutineDto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.test)
  findAll() {
    return this.routinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.routinesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(id, updateRoutineDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.routinesService.remove(id);
  }
}
