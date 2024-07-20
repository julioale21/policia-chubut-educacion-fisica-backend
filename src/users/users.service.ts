import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const emailExists = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (emailExists) {
        throw new BadRequestException(
          `User with email "${createUserDto.email}" already exists`,
        );
      }

      const dniExists = await this.usersRepository.findOne({
        where: { dni: createUserDto.dni },
      });

      if (dniExists) {
        throw new BadRequestException(
          `User with DNI "${createUserDto.dni}" already exists`,
        );
      }

      const user = this.usersRepository.create(createUserDto);
      return this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(error.message);
      throw new UnprocessableEntityException(error.message);
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    const user = this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      Object.assign(user, updateUserDto);

      // Save the updated user
      const updatedUser = await this.usersRepository.save(user);

      // Return the updated user
      return updatedUser;
    } catch (error) {
      this.logger.error(error.message);
      throw new UnprocessableEntityException(error.message);
    }
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return this.usersRepository.remove(user);
  }
}
