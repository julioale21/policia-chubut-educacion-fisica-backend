import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ArrayContains, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { Routine } from 'src/routines/entities/routine.entity';

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
    const trainers = await this.userRepository.query(`
      SELECT id, email, name, surname, dni, "isActive"
      FROM "users"
      WHERE roles && ARRAY['super-user', 'admin', 'trainer']::text[]
    `);

    const trainerIds = trainers.map((trainer) => trainer.id);

    const routineCounts = await this.routineRepository
      .createQueryBuilder('routine')
      .select('routine.trainerId', 'trainerId')
      .addSelect('COUNT(routine.id)', 'count')
      .where('routine.trainerId IN (:...trainerIds)', { trainerIds })
      .groupBy('routine.trainerId')
      .getRawMany();

    const routineCountMap = new Map(
      routineCounts.map((item) => [item.trainerId, parseInt(item.count, 10)]),
    );

    return trainers.map((trainer) => ({
      ...trainer,
      isActive: trainer.isActive === 'true', // Convert string to boolean
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

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        id: true,
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

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new Error(error.detail);
    }
    console.log(error);
    throw new Error('Check server logs');
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async createSuperAdmin() {
    const superAdminEmail = this.configService.get<string>('SUPER_USER_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPER_USER_PASSWORD',
    );
    const superAdminRole =
      this.configService.get<string>('SUPER_USER_ROLE') || 'super-user';

    if (await this.userRepository.findOneBy({ email: superAdminEmail })) {
      return;
    }

    const user = this.userRepository.create({
      email: superAdminEmail,
      password: bcrypt.hashSync(superAdminPassword, 10),
      roles: [superAdminRole],
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
