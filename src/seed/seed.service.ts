import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';
import { Exercise } from 'src/excercises/entities/excercise.entity';
import { ExerciseCategory } from 'src/common/enums/excersises-category.enum';
import { Routine } from 'src/routines/entities/routine.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(RoutineAssignment)
    private readonly routineAssignmentRepository: Repository<RoutineAssignment>,
    @InjectRepository(ExerciseCompletion)
    private readonly exerciseCompletionRepository: Repository<ExerciseCompletion>,
  ) {}

  async runSeed() {
    this.logger.log('Starting seed...');

    // Create users
    const { trainer, students } = await this.createUsers();
    this.logger.log(`Created trainer: ${trainer.email}`);
    this.logger.log(`Created ${students.length} students`);

    // Create exercises
    const exercises = await this.createExercises();
    this.logger.log(`Created ${exercises.length} exercises`);

    // Create routines with exercises
    const routines = await this.createRoutines(trainer, exercises);
    this.logger.log(`Created ${routines.length} routines`);

    // Create assignments for students
    const assignments = await this.createAssignments(routines, students);
    this.logger.log(`Created ${assignments.length} assignments`);

    // Create some exercise completions
    await this.createCompletions(assignments);
    this.logger.log('Created exercise completions');

    this.logger.log('Seed completed successfully!');

    return {
      trainer: { id: trainer.id, email: trainer.email },
      students: students.map((s) => ({ id: s.id, email: s.email })),
      exercises: exercises.length,
      routines: routines.length,
      assignments: assignments.length,
    };
  }

  private async createUsers() {
    // Check if trainer already exists
    let trainer = await this.userRepository.findOne({
      where: { email: 'trainer@policia.gov.ar' },
    });

    if (!trainer) {
      trainer = this.userRepository.create({
        email: 'trainer@policia.gov.ar',
        password: bcrypt.hashSync('trainer123', 10),
        name: 'Carlos',
        surname: 'Martinez',
        dni: '30123456',
        roles: [ValidRoles.trainer],
        isActive: true,
        force: 'Policia del Chubut',
        rank: 'Instructor',
      });
      await this.userRepository.save(trainer);
    }

    // Create students
    const studentData = [
      {
        email: 'estudiante1@policia.gov.ar',
        name: 'Juan',
        surname: 'Perez',
        dni: '35123456',
      },
      {
        email: 'estudiante2@policia.gov.ar',
        name: 'Maria',
        surname: 'Garcia',
        dni: '36123456',
      },
      {
        email: 'estudiante3@policia.gov.ar',
        name: 'Pedro',
        surname: 'Lopez',
        dni: '37123456',
      },
    ];

    const students: User[] = [];

    for (const data of studentData) {
      let student = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (!student) {
        student = this.userRepository.create({
          ...data,
          password: bcrypt.hashSync('student123', 10),
          roles: [ValidRoles.user],
          isActive: true,
          force: 'Policia del Chubut',
          rank: 'Cadete',
        });
        await this.userRepository.save(student);
      }
      students.push(student);
    }

    return { trainer, students };
  }

  private async createExercises() {
    const exerciseData = [
      // Fuerza
      {
        name: 'Flexiones de Pecho',
        description:
          'Ejercicio fundamental para fortalecer pectorales, hombros y tríceps. Mantén el cuerpo recto y baja hasta que el pecho casi toque el suelo.',
        category: ExerciseCategory.FUERZA,
      },
      {
        name: 'Sentadillas',
        description:
          'Ejercicio compuesto para piernas y glúteos. Baja manteniendo la espalda recta hasta que los muslos queden paralelos al suelo.',
        category: ExerciseCategory.FUERZA,
      },
      {
        name: 'Plancha Abdominal',
        description:
          'Ejercicio isométrico para fortalecer el core. Mantén el cuerpo en línea recta apoyado en antebrazos y puntas de los pies.',
        category: ExerciseCategory.FUERZA,
      },
      {
        name: 'Dominadas',
        description:
          'Ejercicio para espalda y bíceps. Cuelga de una barra y sube hasta que la barbilla supere la barra.',
        category: ExerciseCategory.FUERZA,
      },
      {
        name: 'Fondos en Paralelas',
        description:
          'Ejercicio para tríceps y pecho. Baja controladamente flexionando los codos y sube extendiendo los brazos.',
        category: ExerciseCategory.FUERZA,
      },
      // Cardio
      {
        name: 'Burpees',
        description:
          'Ejercicio de alta intensidad que combina sentadilla, plancha, flexión y salto. Excelente para quemar calorías.',
        category: ExerciseCategory.CARDIO,
      },
      {
        name: 'Jumping Jacks',
        description:
          'Ejercicio cardiovascular que involucra saltos con apertura de brazos y piernas.',
        category: ExerciseCategory.CARDIO,
      },
      {
        name: 'Mountain Climbers',
        description:
          'Ejercicio de alta intensidad en posición de plancha llevando las rodillas al pecho alternadamente.',
        category: ExerciseCategory.CARDIO,
      },
      {
        name: 'Carrera en el Lugar',
        description:
          'Ejercicio cardiovascular simple de correr sin desplazamiento, ideal para calentamiento.',
        category: ExerciseCategory.CARDIO,
      },
      // Resistencia
      {
        name: 'Circuito de Resistencia',
        description:
          'Serie de ejercicios realizados con poco descanso para mejorar la resistencia muscular.',
        category: ExerciseCategory.RESISTENCIA,
      },
      {
        name: 'Sentadillas con Salto',
        description:
          'Variante explosiva de la sentadilla que mejora potencia y resistencia.',
        category: ExerciseCategory.RESISTENCIA,
      },
      // Flexibilidad
      {
        name: 'Estiramiento de Isquiotibiales',
        description:
          'Estiramiento para la parte posterior de las piernas. Mantén la posición 30 segundos.',
        category: ExerciseCategory.FLEXIBILIDAD,
      },
      {
        name: 'Estiramiento de Cuádriceps',
        description:
          'Estiramiento para la parte frontal de las piernas. Lleva el talón hacia el glúteo.',
        category: ExerciseCategory.FLEXIBILIDAD,
      },
      {
        name: 'Estiramiento de Espalda',
        description:
          'Estiramiento para aliviar tensión en la espalda. Realiza movimientos de gato-vaca.',
        category: ExerciseCategory.FLEXIBILIDAD,
      },
    ];

    const exercises: Exercise[] = [];

    for (const data of exerciseData) {
      let exercise = await this.exerciseRepository.findOne({
        where: { name: data.name },
      });

      if (!exercise) {
        exercise = this.exerciseRepository.create(data);
        await this.exerciseRepository.save(exercise);
      }
      exercises.push(exercise);
    }

    return exercises;
  }

  private async createRoutines(trainer: User, exercises: Exercise[]) {
    const routineData = [
      {
        name: 'Preparación Física Básica',
        description:
          'Rutina de 7 días para mejorar la condición física general. Ideal para principiantes.',
        durationInDays: 7,
        days: [
          {
            day: 1,
            exercises: [
              { name: 'Flexiones de Pecho', sets: 3, reps: 10, rest: 60 },
              { name: 'Sentadillas', sets: 3, reps: 15, rest: 60 },
              { name: 'Plancha Abdominal', duration: 30, rest: 30 },
            ],
          },
          {
            day: 2,
            exercises: [
              { name: 'Jumping Jacks', sets: 3, reps: 20, rest: 30 },
              { name: 'Burpees', sets: 3, reps: 8, rest: 60 },
              { name: 'Mountain Climbers', sets: 3, reps: 20, rest: 45 },
            ],
          },
          {
            day: 3,
            exercises: [
              { name: 'Estiramiento de Isquiotibiales', duration: 60, rest: 15 },
              { name: 'Estiramiento de Cuádriceps', duration: 60, rest: 15 },
              { name: 'Estiramiento de Espalda', duration: 60, rest: 15 },
            ],
          },
          {
            day: 4,
            exercises: [
              { name: 'Flexiones de Pecho', sets: 4, reps: 12, rest: 60 },
              { name: 'Sentadillas con Salto', sets: 3, reps: 10, rest: 60 },
              { name: 'Plancha Abdominal', duration: 45, rest: 30 },
            ],
          },
          {
            day: 5,
            exercises: [
              { name: 'Carrera en el Lugar', duration: 120, rest: 60 },
              { name: 'Burpees', sets: 4, reps: 10, rest: 60 },
              { name: 'Jumping Jacks', sets: 3, reps: 25, rest: 30 },
            ],
          },
          {
            day: 6,
            exercises: [
              { name: 'Circuito de Resistencia', sets: 2, reps: 1, rest: 120 },
              { name: 'Sentadillas', sets: 4, reps: 20, rest: 60 },
            ],
          },
          {
            day: 7,
            exercises: [
              { name: 'Estiramiento de Isquiotibiales', duration: 90, rest: 15 },
              { name: 'Estiramiento de Cuádriceps', duration: 90, rest: 15 },
              { name: 'Estiramiento de Espalda', duration: 90, rest: 15 },
            ],
          },
        ],
      },
      {
        name: 'Entrenamiento Táctico Policial',
        description:
          'Rutina de 14 días diseñada para mejorar la condición física requerida en operaciones policiales.',
        durationInDays: 14,
        days: [
          {
            day: 1,
            exercises: [
              { name: 'Flexiones de Pecho', sets: 4, reps: 15, rest: 45 },
              { name: 'Dominadas', sets: 3, reps: 8, rest: 60 },
              { name: 'Fondos en Paralelas', sets: 3, reps: 10, rest: 60 },
            ],
          },
          {
            day: 2,
            exercises: [
              { name: 'Sentadillas', sets: 4, reps: 20, rest: 60 },
              { name: 'Sentadillas con Salto', sets: 3, reps: 12, rest: 60 },
              { name: 'Plancha Abdominal', duration: 60, rest: 30 },
            ],
          },
          {
            day: 3,
            exercises: [
              { name: 'Burpees', sets: 5, reps: 12, rest: 45 },
              { name: 'Mountain Climbers', sets: 4, reps: 30, rest: 30 },
              { name: 'Carrera en el Lugar', duration: 180, rest: 60 },
            ],
          },
          {
            day: 4,
            exercises: [
              { name: 'Estiramiento de Isquiotibiales', duration: 60, rest: 15 },
              { name: 'Estiramiento de Cuádriceps', duration: 60, rest: 15 },
              { name: 'Estiramiento de Espalda', duration: 60, rest: 15 },
            ],
          },
          {
            day: 5,
            exercises: [
              { name: 'Flexiones de Pecho', sets: 5, reps: 15, rest: 45 },
              { name: 'Plancha Abdominal', duration: 90, rest: 30 },
            ],
          },
        ],
      },
    ];

    const routines: Routine[] = [];
    const exerciseMap = new Map(exercises.map((e) => [e.name, e]));

    for (const data of routineData) {
      let routine = await this.routineRepository.findOne({
        where: { name: data.name },
      });

      if (!routine) {
        routine = this.routineRepository.create({
          name: data.name,
          description: data.description,
          durationInDays: data.durationInDays,
          isActive: true,
          trainer: { id: trainer.id },
        });
        await this.routineRepository.save(routine);

        // Create routine exercises for each day
        let order = 1;
        for (const day of data.days) {
          for (const ex of day.exercises) {
            const exercise = exerciseMap.get(ex.name);
            if (exercise) {
              const routineExercise = this.routineExerciseRepository.create({
                routine: { id: routine.id },
                exercise: { id: exercise.id },
                dayOfRoutine: day.day,
                order: order++,
                sets: ex.sets,
                repetitions: ex.reps,
                duration: ex.duration,
                restTimeBetweenSets: ex.rest,
              });
              await this.routineExerciseRepository.save(routineExercise);
            }
          }
        }
      }
      routines.push(routine);
    }

    return routines;
  }

  private async createAssignments(routines: Routine[], students: User[]) {
    const assignments: RoutineAssignment[] = [];
    const today = new Date();

    // Assign first routine to first two students
    for (let i = 0; i < 2; i++) {
      const student = students[i];
      const routine = routines[0];

      let assignment = await this.routineAssignmentRepository.findOne({
        where: {
          student: { id: student.id },
          routine: { id: routine.id },
        },
      });

      if (!assignment) {
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 3); // Started 3 days ago

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + routine.durationInDays);

        assignment = this.routineAssignmentRepository.create({
          student: { id: student.id },
          routine: { id: routine.id },
          startDate,
          endDate,
        });
        await this.routineAssignmentRepository.save(assignment);
      }
      assignments.push(assignment);
    }

    // Assign second routine to all students
    for (const student of students) {
      const routine = routines[1];

      let assignment = await this.routineAssignmentRepository.findOne({
        where: {
          student: { id: student.id },
          routine: { id: routine.id },
        },
      });

      if (!assignment) {
        const startDate = new Date(today);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + routine.durationInDays);

        assignment = this.routineAssignmentRepository.create({
          student: { id: student.id },
          routine: { id: routine.id },
          startDate,
          endDate,
        });
        await this.routineAssignmentRepository.save(assignment);
      }
      assignments.push(assignment);
    }

    return assignments;
  }

  private async createCompletions(assignments: RoutineAssignment[]) {
    // Get the first assignment and mark some exercises as completed
    const assignment = assignments[0];

    // Get routine exercises for days 1 and 2
    const routineExercises = await this.routineExerciseRepository.find({
      where: {
        routine: { id: assignment.routine.id },
      },
      order: { dayOfRoutine: 'ASC', order: 'ASC' },
    });

    // Complete all exercises from day 1 and first exercise from day 2
    for (const re of routineExercises) {
      if (re.dayOfRoutine <= 2) {
        const existingCompletion =
          await this.exerciseCompletionRepository.findOne({
            where: {
              routineAssignment: { id: assignment.id },
              routineExercise: { id: re.id },
            },
          });

        if (!existingCompletion) {
          const completion = this.exerciseCompletionRepository.create({
            routineAssignment: { id: assignment.id },
            routineExercise: { id: re.id },
            isCompleted: re.dayOfRoutine === 1, // Day 1 fully completed, day 2 partial
            completionDate:
              re.dayOfRoutine === 1 ? new Date() : null,
            actualRepetitions: re.repetitions,
            actualDuration: re.duration,
          });
          await this.exerciseCompletionRepository.save(completion);
        }
      }
    }
  }
}
