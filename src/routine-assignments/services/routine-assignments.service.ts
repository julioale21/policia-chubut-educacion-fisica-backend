// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateRoutineAssignmentDto } from '../dto/create-routine-assignment.dto';
// import { UpdateRoutineAssignmentDto } from '../dto/update-routine-assignment.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { RoutineAssignment } from '../entities/routine-assignment.entity';
// import { DataSource, QueryFailedError, Repository } from 'typeorm';
// import { Routine } from 'src/routines/entities/routine.entity';
// import { User } from 'src/auth/entities/user.entity';

// import { ConflictException } from '@nestjs/common';

// export class DuplicateAssignmentException extends ConflictException {
//   constructor(
//     studentId: string,
//     routineId: string,
//     startDate: string,
//     endDate: string,
//   ) {
//     super(
//       `A routine assignment already exists for student ${studentId} with routine ${routineId} between ${startDate} and ${endDate}`,
//     );
//   }
// }

// @Injectable()
// export class RoutineAssignmentsService {
//   constructor(
//     @InjectRepository(RoutineAssignment)
//     private readonly routineAssignmentRepository: Repository<RoutineAssignment>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(Routine)
//     private readonly routineRepository: Repository<Routine>,
//     private dataSource: DataSource,
//   ) {}

//   async create(
//     createRoutineAssignmentDto: CreateRoutineAssignmentDto,
//   ): Promise<RoutineAssignment> {
//     const queryRunner = this.dataSource.createQueryRunner();

//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const { routineId, studentId, startDate, endDate } =
//         createRoutineAssignmentDto;

//       const student = await this.userRepository.findOne({
//         where: { id: studentId },
//       });
//       const routine = await this.routineRepository.findOne({
//         where: { id: routineId },
//       });

//       if (!student) {
//         throw new NotFoundException(`Student with ID "${studentId}" not found`);
//       }
//       if (!routine) {
//         throw new NotFoundException(`Routine with ID "${routineId}" not found`);
//       }

//       const routineAssignment = new RoutineAssignment();
//       routineAssignment.student = student;
//       routineAssignment.routine = routine;
//       routineAssignment.startDate = this.parseDate(startDate);
//       routineAssignment.endDate = this.parseDate(endDate);

//       const savedAssignment = await queryRunner.manager.save(routineAssignment);

//       await queryRunner.commitTransaction();

//       return savedAssignment;
//     } catch (err) {
//       await queryRunner.rollbackTransaction();

//       if (err instanceof QueryFailedError) {
//         const pgError = err as any;
//         if (
//           pgError.code === '23505' &&
//           pgError.constraint === 'unique_student_routine_dates'
//         ) {
//           const { routineId, studentId, startDate, endDate } =
//             createRoutineAssignmentDto;
//           throw new DuplicateAssignmentException(
//             studentId,
//             routineId,
//             startDate,
//             endDate,
//           );
//         }
//       }
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async findAll() {
//     return this.routineAssignmentRepository.find({
//       relations: ['student', 'routine'],
//     });
//   }

//   async findOne(id: string) {
//     const routineAssignment = await this.routineAssignmentRepository.findOne({
//       where: { id },
//       relations: ['student', 'routine'],
//     });

//     if (!routineAssignment) {
//       throw new NotFoundException(
//         `Routine Assignment with ID "${id}" not found`,
//       );
//     }

//     return routineAssignment;
//   }

//   async update(
//     id: string,
//     updateRoutineAssignmentDto: UpdateRoutineAssignmentDto,
//   ): Promise<RoutineAssignment> {
//     const queryRunner = this.dataSource.createQueryRunner();

//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const { studentId, routineId, startDate, endDate } =
//         updateRoutineAssignmentDto;

//       const existingAssignment = await queryRunner.manager.findOne(
//         RoutineAssignment,
//         {
//           where: { id },
//           relations: ['student', 'routine'],
//         },
//       );

//       if (!existingAssignment) {
//         throw new NotFoundException(
//           `Routine Assignment with ID "${id}" not found`,
//         );
//       }

//       if (studentId) {
//         const student = await this.userRepository.findOne({
//           where: { id: studentId },
//         });
//         if (!student) {
//           throw new NotFoundException(
//             `Student with ID "${studentId}" not found`,
//           );
//         }
//         existingAssignment.student = student;
//       }

//       if (routineId) {
//         const routine = await this.routineRepository.findOne({
//           where: { id: routineId },
//         });
//         if (!routine) {
//           throw new NotFoundException(
//             `Routine with ID "${routineId}" not found`,
//           );
//         }
//         existingAssignment.routine = routine;
//       }

//       if (startDate) {
//         existingAssignment.startDate = this.parseDate(startDate);
//       }
//       if (endDate) {
//         existingAssignment.endDate = this.parseDate(endDate);
//       }

//       const updatedAssignment =
//         await queryRunner.manager.save(existingAssignment);

//       await queryRunner.commitTransaction();

//       return updatedAssignment;
//     } catch (err) {
//       await queryRunner.rollbackTransaction();

//       // Handle unique constraint violation
//       if (err instanceof QueryFailedError) {
//         const pgError = err as any;
//         if (
//           pgError.code === '23505' &&
//           pgError.constraint === 'unique_student_routine_dates'
//         ) {
//           const { routineId, studentId, startDate, endDate } =
//             updateRoutineAssignmentDto;
//           throw new DuplicateAssignmentException(
//             studentId,
//             routineId,
//             startDate,
//             endDate,
//           );
//         }
//       }
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async remove(id: string) {
//     const routineAssignment = await this.routineAssignmentRepository.findOne({
//       where: { id },
//     });

//     if (!routineAssignment) {
//       throw new NotFoundException(
//         `Routine Assignment with ID "${id}" not found`,
//       );
//     }

//     return this.routineAssignmentRepository.remove(routineAssignment);
//   }

//   private parseDate(dateString: string): Date {
//     const [day, month, year] = dateString.split('/').map(Number);
//     return new Date(year, month - 1, day);
//   }
// }
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RoutineAssignment } from '../entities/routine-assignment.entity';
import { RoutineAssignmentValidatorService } from './routine-assignments-validator.service';
import { RoutineAssignmentErrorHandler } from './routine-assignment-error-handler.service';
import { CreateRoutineAssignmentDto } from '../dto/create-routine-assignment.dto';
import { DateUtil } from 'src/common/utils/date.utils';
import { UpdateRoutineAssignmentDto } from '../dto/update-routine-assignment.dto';

@Injectable()
export class RoutineAssignmentsService {
  constructor(
    @InjectRepository(RoutineAssignment)
    private readonly routineAssignmentRepository: Repository<RoutineAssignment>,
    private readonly validatorService: RoutineAssignmentValidatorService,
    private readonly errorHandler: RoutineAssignmentErrorHandler,
    private dataSource: DataSource,
  ) {}

  async create(
    createRoutineAssignmentDto: CreateRoutineAssignmentDto,
  ): Promise<RoutineAssignment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assignment = await this.createAssignment(
        createRoutineAssignmentDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return assignment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.errorHandler.handleError(err, createRoutineAssignmentDto);
    } finally {
      await queryRunner.release();
    }
  }

  private async createAssignment(
    dto: CreateRoutineAssignmentDto,
    queryRunner: any,
  ) {
    const { student, routine } = await this.validatorService.validateEntities(
      dto.studentId,
      dto.routineId,
    );

    const routineAssignment = new RoutineAssignment();
    routineAssignment.student = student;
    routineAssignment.routine = routine;
    routineAssignment.startDate = DateUtil.parseDate(dto.startDate);
    routineAssignment.endDate = DateUtil.parseDate(dto.endDate);

    return queryRunner.manager.save(routineAssignment);
  }

  async findAll(): Promise<RoutineAssignment[]> {
    return this.routineAssignmentRepository.find({
      relations: ['student', 'routine'],
    });
  }

  async findOne(id: string): Promise<RoutineAssignment> {
    const routineAssignment = await this.routineAssignmentRepository.findOne({
      where: { id },
      relations: ['student', 'routine'],
    });

    if (!routineAssignment) {
      throw new NotFoundException(
        `Routine Assignment with ID "${id}" not found`,
      );
    }

    return routineAssignment;
  }

  async update(
    id: string,
    updateRoutineAssignmentDto: UpdateRoutineAssignmentDto,
  ): Promise<RoutineAssignment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAssignment = await this.findAssignmentWithRelations(
        id,
        queryRunner,
      );
      const assignment = await this.updateAssignment(
        existingAssignment,
        updateRoutineAssignmentDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return assignment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Pass both the DTO and existing assignment for error handling
      const existingAssignment = await this.findAssignmentWithRelations(
        id,
        queryRunner,
      );
      this.errorHandler.handleError(
        err,
        {
          studentId: updateRoutineAssignmentDto.studentId,
          routineId: updateRoutineAssignmentDto.routineId,
          startDate: updateRoutineAssignmentDto.startDate,
          endDate: updateRoutineAssignmentDto.endDate,
        },
        existingAssignment,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async updateAssignment(
    id: string,
    dto: UpdateRoutineAssignmentDto,
    queryRunner: any,
  ) {
    const existingAssignment = await this.findAssignmentWithRelations(
      id,
      queryRunner,
    );

    if (dto.studentId || dto.routineId) {
      const { student, routine } = await this.validatorService.validateEntities(
        dto.studentId || existingAssignment.student.id,
        dto.routineId || existingAssignment.routine.id,
      );
      existingAssignment.student = student;
      existingAssignment.routine = routine;
    }

    if (dto.startDate) {
      existingAssignment.startDate = DateUtil.parseDate(dto.startDate);
    }
    if (dto.endDate) {
      existingAssignment.endDate = DateUtil.parseDate(dto.endDate);
    }

    return queryRunner.manager.save(existingAssignment);
  }

  private async findAssignmentWithRelations(id: string, queryRunner: any) {
    const assignment = await queryRunner.manager.findOne(RoutineAssignment, {
      where: { id },
      relations: ['student', 'routine'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Routine Assignment with ID "${id}" not found`,
      );
    }

    return assignment;
  }

  async remove(id: string): Promise<RoutineAssignment> {
    const routineAssignment = await this.findOne(id);
    return this.routineAssignmentRepository.remove(routineAssignment);
  }
}
