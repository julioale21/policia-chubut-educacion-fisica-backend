import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesModule } from './routines/routines.module';
import { UsersModule } from './users/users.module';
import { RoutineAssignmentsModule } from './routine-assignments/routine-assignments.module';
import { RoutineExcercisesModule } from './routine-excercises/routine-excercises.module';
import { ExcercisesModule } from './excercises/excercises.module';
import { ExerciseCompletionsModule } from './exercise-completions/exercise-completions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      // entities: [],
      synchronize: true,
    }),
    RoutinesModule,
    UsersModule,
    RoutineAssignmentsModule,
    RoutineExcercisesModule,
    ExcercisesModule,
    ExerciseCompletionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
