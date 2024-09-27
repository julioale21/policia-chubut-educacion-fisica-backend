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
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  @Auth(ValidRoles.trainer, ValidRoles.admin, ValidRoles.supeUser)
  @Auth()
  create(@GetUser() user: User, @Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(createRoutineDto, user);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.trainer, ValidRoles.admin)
  findAll() {
    return this.routinesService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.trainer, ValidRoles.admin)
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.routinesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.trainer, ValidRoles.admin, ValidRoles.supeUser)
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
    @GetUser() user: User,
  ) {
    return this.routinesService.update(id, updateRoutineDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.trainer, ValidRoles.admin, ValidRoles.supeUser)
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.routinesService.remove(id);
  }

  @Get(':id/with-students')
  @Auth(ValidRoles.trainer, ValidRoles.admin, ValidRoles.supeUser)
  getRoutineWithStudents(@Param('id', ParseUuidPipe) id: string) {
    return this.routinesService.getRoutineWithStudents(id);
  }
}
