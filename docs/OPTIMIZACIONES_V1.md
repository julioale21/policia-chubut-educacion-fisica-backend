# Optimizaciones y Mejoras - V1

## 1. Schemas Optimizados

### Base Schema

```typescript
const BaseSchema = {
  id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
};

// Usuario Schema
const UsuarioSchema = {
  ...BaseSchema,
  nombre: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true },
  rol: {
    type: String,
    enum: ['ADMIN', 'TRAINER', 'OFFICER'],
    required: true,
    index: true,
  },
  departamentoId: {
    type: String,
    required: true,
    ref: 'Departamento',
    index: true,
  },
};

// Ejercicio Schema
const EjercicioSchema = {
  ...BaseSchema,
  nombre: { type: String, required: true, index: true },
  descripcion: { type: String, required: true },
  musculosObjetivo: [
    {
      type: String,
      required: true,
      index: true,
    },
  ],
  dificultad: {
    type: String,
    enum: ['FACIL', 'MEDIO', 'DIFICIL'],
    required: true,
    index: true,
  },
  equipamiento: [
    {
      equipamientoId: {
        type: String,
        ref: 'Equipamiento',
        index: true,
      },
      cantidad: { type: Number, default: 1 },
    },
  ],
};

// Rutina Schema
const RutinaSchema = {
  ...BaseSchema,
  nombre: { type: String, required: true, index: true },
  descripcion: { type: String, required: true },
  trainerId: {
    type: String,
    required: true,
    ref: 'Usuario',
    index: true,
  },
  ejercicios: [
    {
      ejercicioId: {
        type: String,
        ref: 'Ejercicio',
        index: true,
      },
      series: { type: Number, required: true },
      repeticiones: { type: Number, required: true },
      orden: { type: Number, required: true },
    },
  ],
  duracion: { type: Number, required: true },
  nivelDificultad: {
    type: String,
    enum: ['FACIL', 'MEDIO', 'DIFICIL'],
    required: true,
    index: true,
  },
};

// Asignación Schema
const AsignacionSchema = {
  ...BaseSchema,
  rutinaId: {
    type: String,
    required: true,
    ref: 'Rutina',
    index: true,
  },
  oficialId: {
    type: String,
    required: true,
    ref: 'Usuario',
    index: true,
  },
  trainerId: {
    type: String,
    required: true,
    ref: 'Usuario',
    index: true,
  },
  fechaInicio: { type: Date, required: true, index: true },
  fechaFin: { type: Date, required: true },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'],
    default: 'PENDIENTE',
    index: true,
  },
};

// Progreso Schema
const ProgresoSchema = {
  ...BaseSchema,
  asignacionId: {
    type: String,
    required: true,
    ref: 'Asignacion',
    index: true,
  },
  ejercicioId: {
    type: String,
    required: true,
    ref: 'Ejercicio',
    index: true,
  },
  oficialId: {
    type: String,
    required: true,
    ref: 'Usuario',
    index: true,
  },
  seriesCompletadas: { type: Number, required: true },
  repeticionesCompletadas: { type: Number, required: true },
  peso: { type: Number },
  notas: { type: String },
  fecha: { type: Date, required: true, index: true },
};
```

## 2. Servicios Base Optimizados

```typescript
// src/common/services/base.service.ts
export abstract class BaseService<T> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly cacheManager: Cache,
  ) {}

  async findWithPagination(
    filter: FilterQuery<T> = {},
    options: PaginationOptions,
  ): Promise<PaginatedResponse<T>> {
    const cacheKey = `${this.model.modelName}_${JSON.stringify(filter)}_${JSON.stringify(options)}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, sort = {} } = options;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model
        .find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ ...filter, isDeleted: false }),
    ]);

    const result = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheManager.set(cacheKey, result, { ttl: 300 });
    return result;
  }

  async findById(id: string): Promise<T> {
    const cacheKey = `${this.model.modelName}_${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const item = await this.model.findOne({ _id: id, isDeleted: false }).lean();
    if (!item) {
      throw new NotFoundException(`${this.model.modelName} no encontrado`);
    }

    await this.cacheManager.set(cacheKey, item, { ttl: 300 });
    return item;
  }

  async create(data: Partial<T>): Promise<T> {
    const item = await this.model.create(data);
    return item.toObject();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`${this.model.modelName} no encontrado`);
    }

    const cacheKey = `${this.model.modelName}_${id}`;
    await this.cacheManager.del(cacheKey);

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const deleted = await this.model.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        updatedAt: new Date(),
      },
    );

    if (!deleted) {
      throw new NotFoundException(`${this.model.modelName} no encontrado`);
    }

    const cacheKey = `${this.model.modelName}_${id}`;
    await this.cacheManager.del(cacheKey);

    return true;
  }
}
```

## 3. Interceptores y Filtros

```typescript
// src/common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    this.logger.log(`${method} ${url} ${userAgent} ${ip}`);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${Date.now() - now}ms`,
        );
      }),
    );
  }
}

// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      error: exception.name,
    });
  }
}
```

## 4. Configuración de Caché

```typescript
// src/config/cache.config.ts
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

export const cacheConfig = CacheModule.register({
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 300, // 5 minutos por defecto
});
```

## 5. Validadores

```typescript
// src/common/validators/base.validator.ts
export class BaseValidator {
  static validateId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static validatePagination(page: number, limit: number): boolean {
    return page > 0 && limit > 0 && limit <= 100;
  }
}

// src/common/validators/ejercicio.validator.ts
export class EjercicioValidator {
  static validateCreate(data: any): boolean {
    const requiredFields = [
      'nombre',
      'descripcion',
      'musculosObjetivo',
      'dificultad',
    ];
    return requiredFields.every((field) => !!data[field]);
  }

  static validateUpdate(data: any): boolean {
    const validFields = [
      'nombre',
      'descripcion',
      'musculosObjetivo',
      'dificultad',
      'equipamiento',
    ];
    return Object.keys(data).every((key) => validFields.includes(key));
  }
}
```

## 6. Pasos de Implementación

1. Actualizar Schemas (1 día)

   - Implementar nuevos schemas con índices
   - Verificar referencias y relaciones
   - Actualizar validaciones

2. Implementar Servicios Base (1 día)

   - Configurar BaseService
   - Implementar caché
   - Agregar manejo de errores

3. Configurar Monitoreo (1 día)

   - Implementar interceptores
   - Configurar logging
   - Agregar filtros de excepciones

4. Testing (1 día)
   - Probar optimizaciones
   - Verificar caché
   - Validar índices

## 7. Métricas de Éxito

- Tiempo de respuesta < 200ms
- Cache hit ratio > 80%
- Uso de memoria estable
- Queries optimizadas usando índices > 95%
- Cero N+1 queries

## 8. Mantenimiento

- Monitoreo diario de métricas
- Limpieza de caché programada
- Revisión semanal de logs
- Actualización mensual de índices según uso
- Backup diario de datos
