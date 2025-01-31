import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ArrayContains, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, ValidRoles } from './interfaces';
import { Routine } from 'src/routines/entities/routine.entity';
import { UpdateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getStudents() {
    return await this.userRepository.find({
      where: {
        roles: ArrayContains(['user']),
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        dni: true,
        isActive: true,
        routineAssignments: {
          id: true,
          startDate: true,
          endDate: true,
          routine: {
            id: true,
            name: true,
          },
        },
      },
      relations: ['routineAssignments', 'routineAssignments.routine'],
    });
  }

  async getTrainers() {
    const trainers = await this.userRepository.find({
      where: [
        { roles: ArrayContains([ValidRoles.trainer]) },
        { roles: ArrayContains([ValidRoles.admin]) },
        { roles: ArrayContains([ValidRoles.supeUser]) },
      ],
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        dni: true,
        isActive: true,
      },
    });

    if (!trainers.length) return [];

    const routineCounts = await this.routineRepository
      .createQueryBuilder('routine')
      .select('routine.trainerId', 'trainerId')
      .addSelect('COUNT(routine.id)', 'count')
      .where('routine.trainerId IN (:...trainerIds)', {
        trainerIds: trainers.map((t) => t.id),
      })
      .groupBy('routine.trainerId')
      .getRawMany();

    const routineCountMap = new Map(
      routineCounts.map((item) => [item.trainerId, Number(item.count)]),
    );

    return trainers.map((trainer) => ({
      ...trainer,
      routineCount: routineCountMap.get(trainer.id) || 0,
    }));
  }

  async getUsers() {
    return await this.userRepository.find();
  }
  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    await this.userRepository.save(user);
    delete user.password;
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.password;
    return user;
  }

  // async update(id: string, updateUserDto: UpdateUserDto) {
  //   const user = await this.userRepository.preload({
  //     id,
  //     ...updateUserDto,
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   return this.userRepository.save(user);
  // }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id },
        relations: ['routineAssignments'],
      });

      if (!existingUser) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (updateUserDto.email) {
        const userWithEmail = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (userWithEmail && userWithEmail.id !== id) {
          throw new ConflictException(
            `El email ${updateUserDto.email} ya está en uso`,
          );
        }
      }

      if (updateUserDto.dni) {
        const userWithDni = await this.userRepository.findOne({
          where: { dni: updateUserDto.dni },
        });
        if (userWithDni && userWithDni.id !== id) {
          throw new ConflictException(
            `El DNI ${updateUserDto.dni} ya está en uso`,
          );
        }
      }

      const user = await this.userRepository.preload({
        id,
        ...updateUserDto,
        createdAt: existingUser.createdAt,
        routineAssignments: existingUser.routineAssignments,
      });

      if (updateUserDto.medicalInfo) {
        user.medicalInfo = {
          ...existingUser.medicalInfo,
          ...updateUserDto.medicalInfo,
        };
      }

      const updatedUser = await this.userRepository.save(user);

      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Error updating user:', error);

      throw new InternalServerErrorException(
        'Error al actualizar el usuario. Por favor, intente nuevamente.',
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        id: true,
        name: true,
        password: true,
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid password');
    }

    delete user.password;

    return {
      user,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async createSuperAdmin() {
    const superAdminEmail = this.configService.get<string>('SUPER_USER_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPER_USER_PASSWORD',
    );
    if (await this.userRepository.findOneBy({ email: superAdminEmail })) {
      return;
    }

    const user = this.userRepository.create({
      email: superAdminEmail,
      password: bcrypt.hashSync(superAdminPassword, 10),
      roles: [ValidRoles.supeUser],
      name: 'Super Admin',
      isActive: true,
    });
    await this.userRepository.save(user);
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
