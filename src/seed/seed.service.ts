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
        difficulty: 'Principiante',
        muscleGroups: ['Pecho', 'Tríceps', 'Hombros', 'Core'],
        instructions: [
          'Colócate boca abajo con las manos separadas al ancho de los hombros',
          'Mantén el cuerpo recto desde la cabeza hasta los talones',
          'Baja el cuerpo flexionando los codos hasta que el pecho casi toque el suelo',
          'Mantén los codos en un ángulo de 45 grados respecto al cuerpo',
          'Empuja hacia arriba extendiendo los brazos completamente',
          'Exhala al subir e inhala al bajar',
        ],
      },
      {
        name: 'Sentadillas',
        description:
          'Ejercicio compuesto para piernas y glúteos. Baja manteniendo la espalda recta hasta que los muslos queden paralelos al suelo.',
        category: ExerciseCategory.FUERZA,
        difficulty: 'Principiante',
        muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales', 'Core'],
        instructions: [
          'Párate con los pies separados al ancho de los hombros',
          'Mantén los pies ligeramente apuntando hacia afuera',
          'Baja las caderas hacia atrás y abajo como si fueras a sentarte',
          'Mantén la espalda recta y el pecho elevado',
          'Baja hasta que los muslos queden paralelos al suelo',
          'Empuja a través de los talones para volver a la posición inicial',
          'Mantén las rodillas alineadas con los dedos de los pies',
        ],
      },
      {
        name: 'Plancha Abdominal',
        description:
          'Ejercicio isométrico para fortalecer el core. Mantén el cuerpo en línea recta apoyado en antebrazos y puntas de los pies.',
        category: ExerciseCategory.FUERZA,
        difficulty: 'Principiante',
        muscleGroups: ['Core', 'Hombros', 'Espalda'],
        instructions: [
          'Colócate boca abajo apoyándote en los antebrazos y las puntas de los pies',
          'Mantén los codos directamente debajo de los hombros',
          'Forma una línea recta desde la cabeza hasta los talones',
          'Contrae el abdomen y los glúteos',
          'Mantén la posición sin dejar caer las caderas',
          'Respira de manera constante durante el ejercicio',
          'Evita arquear la espalda o levantar los glúteos',
        ],
      },
      {
        name: 'Dominadas',
        description:
          'Ejercicio para espalda y bíceps. Cuelga de una barra y sube hasta que la barbilla supere la barra.',
        category: ExerciseCategory.FUERZA,
        difficulty: 'Avanzado',
        muscleGroups: ['Espalda', 'Bíceps', 'Antebrazos', 'Core'],
        instructions: [
          'Agarra la barra con las palmas mirando hacia adelante, manos al ancho de los hombros',
          'Cuelga con los brazos completamente extendidos',
          'Contrae los omóplatos hacia atrás y abajo',
          'Tira de tu cuerpo hacia arriba llevando el pecho hacia la barra',
          'Sube hasta que la barbilla supere la barra',
          'Baja de manera controlada hasta la posición inicial',
          'Evita balancearte o usar impulso',
        ],
      },
      {
        name: 'Fondos en Paralelas',
        description:
          'Ejercicio para tríceps y pecho. Baja controladamente flexionando los codos y sube extendiendo los brazos.',
        category: ExerciseCategory.FUERZA,
        difficulty: 'Intermedio',
        muscleGroups: ['Tríceps', 'Pecho', 'Hombros'],
        instructions: [
          'Sujeta las barras paralelas con los brazos extendidos',
          'Mantén el cuerpo recto con ligera inclinación hacia adelante',
          'Baja el cuerpo flexionando los codos hasta formar un ángulo de 90 grados',
          'Mantén los codos cerca del cuerpo',
          'Empuja hacia arriba extendiendo los brazos completamente',
          'Controla el movimiento tanto al bajar como al subir',
          'Evita encoger los hombros',
        ],
      },
      // Cardio
      {
        name: 'Burpees',
        description:
          'Ejercicio de alta intensidad que combina sentadilla, plancha, flexión y salto. Excelente para quemar calorías.',
        category: ExerciseCategory.CARDIO,
        difficulty: 'Intermedio',
        muscleGroups: ['Cuerpo completo', 'Core', 'Piernas', 'Pecho'],
        instructions: [
          'Comienza de pie con los pies al ancho de los hombros',
          'Baja a posición de sentadilla y coloca las manos en el suelo',
          'Salta con los pies hacia atrás para quedar en posición de plancha',
          'Realiza una flexión de pecho (opcional)',
          'Salta con los pies hacia las manos volviendo a sentadilla',
          'Salta explosivamente hacia arriba con los brazos extendidos',
          'Aterriza suavemente y repite el movimiento',
        ],
      },
      {
        name: 'Jumping Jacks',
        description:
          'Ejercicio cardiovascular que involucra saltos con apertura de brazos y piernas.',
        category: ExerciseCategory.CARDIO,
        difficulty: 'Principiante',
        muscleGroups: ['Piernas', 'Hombros', 'Core'],
        instructions: [
          'Comienza de pie con los pies juntos y brazos a los lados',
          'Salta separando las piernas más allá del ancho de los hombros',
          'Simultáneamente levanta los brazos por encima de la cabeza',
          'Salta de nuevo juntando los pies y bajando los brazos',
          'Mantén un ritmo constante durante todo el ejercicio',
          'Aterriza suavemente con las rodillas ligeramente flexionadas',
        ],
      },
      {
        name: 'Mountain Climbers',
        description:
          'Ejercicio de alta intensidad en posición de plancha llevando las rodillas al pecho alternadamente.',
        category: ExerciseCategory.CARDIO,
        difficulty: 'Intermedio',
        muscleGroups: ['Core', 'Hombros', 'Piernas', 'Cadera'],
        instructions: [
          'Comienza en posición de plancha alta con brazos extendidos',
          'Mantén las manos directamente debajo de los hombros',
          'Lleva la rodilla derecha hacia el pecho',
          'Vuelve la pierna derecha a la posición inicial',
          'Inmediatamente lleva la rodilla izquierda hacia el pecho',
          'Alterna las piernas a un ritmo rápido',
          'Mantén las caderas bajas y el core contraído',
        ],
      },
      {
        name: 'Carrera en el Lugar',
        description:
          'Ejercicio cardiovascular simple de correr sin desplazamiento, ideal para calentamiento.',
        category: ExerciseCategory.CARDIO,
        difficulty: 'Principiante',
        muscleGroups: ['Piernas', 'Core', 'Cardiovascular'],
        instructions: [
          'Párate con los pies al ancho de las caderas',
          'Comienza a correr levantando las rodillas alternadamente',
          'Balancea los brazos de forma natural como al correr',
          'Mantén el torso erguido y el core activado',
          'Aterriza suavemente en la parte media del pie',
          'Aumenta gradualmente la velocidad según tu nivel',
          'Respira de forma rítmica durante el ejercicio',
        ],
      },
      // Resistencia
      {
        name: 'Circuito de Resistencia',
        description:
          'Serie de ejercicios realizados con poco descanso para mejorar la resistencia muscular.',
        category: ExerciseCategory.RESISTENCIA,
        difficulty: 'Intermedio',
        muscleGroups: ['Cuerpo completo'],
        instructions: [
          'Selecciona 4-6 ejercicios que trabajen diferentes grupos musculares',
          'Realiza cada ejercicio durante 30-45 segundos',
          'Descansa solo 15-20 segundos entre ejercicios',
          'Completa el circuito completo sin pausas largas',
          'Descansa 1-2 minutos al finalizar el circuito',
          'Repite el circuito 2-4 veces según tu nivel',
          'Mantén una intensidad moderada-alta durante todo el circuito',
        ],
      },
      {
        name: 'Sentadillas con Salto',
        description:
          'Variante explosiva de la sentadilla que mejora potencia y resistencia.',
        category: ExerciseCategory.RESISTENCIA,
        difficulty: 'Intermedio',
        muscleGroups: ['Cuádriceps', 'Glúteos', 'Pantorrillas', 'Core'],
        instructions: [
          'Comienza de pie con los pies al ancho de los hombros',
          'Baja a una sentadilla profunda manteniendo la espalda recta',
          'Explota hacia arriba saltando lo más alto posible',
          'Extiende completamente las caderas y rodillas en el aire',
          'Balancea los brazos para ganar impulso',
          'Aterriza suavemente volviendo directamente a la sentadilla',
          'Mantén las rodillas alineadas con los dedos de los pies',
        ],
      },
      // Flexibilidad
      {
        name: 'Estiramiento de Isquiotibiales',
        description:
          'Estiramiento para la parte posterior de las piernas. Mantén la posición 30 segundos.',
        category: ExerciseCategory.FLEXIBILIDAD,
        difficulty: 'Principiante',
        muscleGroups: ['Isquiotibiales', 'Espalda baja'],
        instructions: [
          'Siéntate en el suelo con las piernas extendidas',
          'Mantén la espalda recta y los pies flexionados',
          'Inclínate hacia adelante desde las caderas',
          'Intenta alcanzar los dedos de los pies con las manos',
          'Mantén las rodillas ligeramente flexionadas si es necesario',
          'Sostén la posición durante 30-60 segundos',
          'Respira profundamente y relaja los músculos',
        ],
      },
      {
        name: 'Estiramiento de Cuádriceps',
        description:
          'Estiramiento para la parte frontal de las piernas. Lleva el talón hacia el glúteo.',
        category: ExerciseCategory.FLEXIBILIDAD,
        difficulty: 'Principiante',
        muscleGroups: ['Cuádriceps', 'Cadera'],
        instructions: [
          'Párate sobre una pierna (puedes apoyarte en una pared)',
          'Flexiona la otra rodilla llevando el talón hacia el glúteo',
          'Sujeta el tobillo con la mano del mismo lado',
          'Mantén las rodillas juntas y alineadas',
          'Empuja suavemente la cadera hacia adelante',
          'Sostén la posición durante 30 segundos',
          'Cambia de pierna y repite',
        ],
      },
      {
        name: 'Estiramiento de Espalda',
        description:
          'Estiramiento para aliviar tensión en la espalda. Realiza movimientos de gato-vaca.',
        category: ExerciseCategory.FLEXIBILIDAD,
        difficulty: 'Principiante',
        muscleGroups: ['Espalda', 'Core', 'Cuello'],
        instructions: [
          'Colócate en posición de cuadrupedia (manos y rodillas)',
          'Mantén las manos bajo los hombros y rodillas bajo las caderas',
          'Posición de gato: arquea la espalda hacia arriba y mete la barbilla',
          'Mantén la posición de gato 5-10 segundos',
          'Posición de vaca: hunde la espalda y levanta la cabeza',
          'Mantén la posición de vaca 5-10 segundos',
          'Alterna entre ambas posiciones de forma fluida',
        ],
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
