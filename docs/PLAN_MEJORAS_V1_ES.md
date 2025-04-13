# Plan de Mejoras V1 - Integridad de Datos y Rendimiento

## 1. Estructura del Proyecto

```typescript
src/
├── modules/
│   ├── database/
│   │   ├── migrations/
│   │   ├── entities/
│   │   └── repositories/
│   ├── common/
│   │   ├── interfaces/
│   │   ├── decorators/
│   │   └── constants/
│   └── features/
       ├── ejercicios/
       ├── rutinas/
       └── progreso/
```

## 2. Mejoras de Integridad de Datos

### 2.1 Implementación de TypeORM Entities

```typescript
// src/modules/database/entities/base.entity.ts
@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;
}

// src/modules/database/entities/usuario.entity.ts
@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol: RolUsuario;

  @ManyToOne(() => Departamento, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;
}

// src/modules/database/entities/ejercicio.entity.ts
@Entity('ejercicios')
export class Ejercicio extends BaseEntity {
  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @OneToMany(() => EjercicioMusculo, (musculo) => musculo.ejercicio)
  musculosObjetivo: EjercicioMusculo[];

  @Column({
    type: 'enum',
    enum: NivelDificultad,
  })
  dificultad: NivelDificultad;

  @OneToMany(() => EjercicioEquipamiento, (equipo) => equipo.ejercicio)
  equipamientoNecesario: EjercicioEquipamiento[];
}
```

### 2.2 Migración para Relaciones y Restricciones

```typescript
// src/modules/database/migrations/1234567890-AddForeignKeyConstraints.ts
export class AddForeignKeyConstraints1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Relaciones de Usuario
    await queryRunner.query(`
      ALTER TABLE "usuarios"
      ADD CONSTRAINT "fk_usuario_departamento"
      FOREIGN KEY ("departamento_id")
      REFERENCES "departamentos"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    // Relaciones de Rutina
    await queryRunner.query(`
      ALTER TABLE "rutinas"
      ADD CONSTRAINT "fk_rutina_entrenador"
      FOREIGN KEY ("entrenador_id")
      REFERENCES "usuarios"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }
}
```

## 3. Optimización de Rendimiento

### 3.1 Repositorios Personalizados

```typescript
// src/modules/features/ejercicios/repositories/ejercicio.repository.ts
@EntityRepository(Ejercicio)
export class EjercicioRepository extends Repository<Ejercicio> {
  async findWithRelations(options: FindEjercicioOptions): Promise<Ejercicio[]> {
    const queryBuilder = this.createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.musculosObjetivo', 'musculos')
      .leftJoinAndSelect('ejercicio.equipamientoNecesario', 'equipamiento');

    if (options.dificultad) {
      queryBuilder.andWhere('ejercicio.dificultad = :dificultad', {
        dificultad: options.dificultad,
      });
    }

    return queryBuilder
      .take(options.limit)
      .skip(options.offset)
      .cache(true)
      .getMany();
  }
}
```

### 3.2 Implementación de Caché

```typescript
// src/modules/common/config/cache.config.ts
import { CacheModule, CacheModuleOptions } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

export const cacheConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 300, // 5 minutos
};
```

### 3.3 Servicio de Particionamiento

```typescript
// src/modules/database/services/partition.service.ts
@Injectable()
export class PartitionService {
  async createMonthlyPartitions(): Promise<void> {
    const tables = ['progreso_ejercicio', 'asignacion_rutinas'];

    for (const table of tables) {
      await this.createPartitionForTable(table);
    }
  }

  private async createPartitionForTable(tableName: string): Promise<void> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "${tableName}_${format(nextMonth, 'yyyy_MM')}"
      PARTITION OF "${tableName}"
      FOR VALUES FROM ('${format(nextMonth, 'yyyy-MM-01')}')
      TO ('${format(addMonths(nextMonth, 1), 'yyyy-MM-01')}');
    `);
  }
}
```

## 4. Implementación de Servicios SOLID

### 4.1 Servicios Base

```typescript
// src/modules/common/services/base.service.ts
export abstract class BaseService<T extends BaseEntity> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<T> {
    const cacheKey = `${this.constructor.name}_${id}`;
    const cached = await this.cacheManager.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const entity = await this.repository.findOne({ where: { id } });
    await this.cacheManager.set(cacheKey, entity);
    return entity;
  }
}
```

### 4.2 Servicios Específicos

```typescript
// src/modules/features/ejercicios/services/ejercicio.service.ts
@Injectable()
export class EjercicioService extends BaseService<Ejercicio> {
  constructor(
    @InjectRepository(EjercicioRepository)
    private ejercicioRepository: EjercicioRepository,
    @Inject(CACHE_MANAGER)
    protected readonly cacheManager: Cache,
  ) {
    super(ejercicioRepository, cacheManager);
  }

  async findWithRelations(options: FindEjercicioOptions): Promise<Ejercicio[]> {
    const cacheKey = `ejercicios_${JSON.stringify(options)}`;
    const cached = await this.cacheManager.get<Ejercicio[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const ejercicios =
      await this.ejercicioRepository.findWithRelations(options);
    await this.cacheManager.set(cacheKey, ejercicios);
    return ejercicios;
  }
}
```

## 5. Plan de Implementación

### Fase 1: Preparación (1 semana)

1. Configurar TypeORM con soft delete
2. Implementar entidades base
3. Crear migraciones iniciales
4. Configurar Redis para caché

### Fase 2: Migración de Datos (2 semanas)

1. Implementar nuevas entidades
2. Migrar datos existentes
3. Validar integridad de datos
4. Implementar índices

### Fase 3: Optimización (1 semana)

1. Implementar particionamiento
2. Configurar caché
3. Optimizar consultas
4. Implementar monitoreo

### Fase 4: Testing y Validación (1 semana)

1. Pruebas de rendimiento
2. Validación de integridad
3. Pruebas de carga
4. Documentación

## 6. Monitoreo y Métricas

```typescript
// src/modules/common/interceptors/metrics.interceptor.ts
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.metricsService.recordMetric(context.getHandler().name, duration);
      }),
    );
  }
}
```

## 7. Consideraciones de Seguridad

1. Implementar rate limiting
2. Validación de entrada
3. Sanitización de salida
4. Logging de auditoría
5. Encriptación de datos sensibles

## 8. Documentación

1. Swagger/OpenAPI
2. Documentación de código
3. Guías de migración
4. Procedimientos de mantenimiento

Este plan proporciona una ruta clara para mejorar la integridad de datos y el rendimiento mientras mantiene los principios SOLID y las mejores prácticas de desarrollo. La implementación incremental permite mantener la funcionalidad existente mientras se realizan las mejoras.
