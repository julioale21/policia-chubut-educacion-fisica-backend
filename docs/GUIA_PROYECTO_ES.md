# Backend de Educación Física Policial

## Descripción General del Proyecto

Esta es una aplicación backend basada en NestJS diseñada para gestionar rutinas y ejercicios de educación física para personal policial. El sistema proporciona funcionalidad para crear, gestionar y realizar seguimiento de rutinas de ejercicios, ejercicios individuales y progreso del usuario.

## Stack Tecnológico

- **Framework**: NestJS v10
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT con Passport
- **Documentación API**: Swagger/OpenAPI integrado
- **Pruebas**: Jest

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación y autorización
├── common/         # Utilidades y constantes compartidas
├── exercises/      # Gestión de ejercicios
├── exercise-completions/  # Seguimiento de ejercicios completados
├── exercise-progress/     # Seguimiento de progreso
├── routine-assignments/   # Gestión de asignación de rutinas
├── routine-exercises/     # Ejercicios dentro de rutinas
├── routines/      # Gestión de rutinas de ejercicio
└── main.ts        # Punto de entrada de la aplicación
```

## Características Principales

1. **Sistema de Autenticación**

   - Autenticación basada en JWT
   - Control de acceso basado en roles
   - Encriptación segura de contraseñas con bcrypt

2. **Gestión de Ejercicios**

   - Crear, leer, actualizar y eliminar ejercicios
   - Categorización de ejercicios
   - Descripciones detalladas y requisitos de ejercicios

3. **Gestión de Rutinas**

   - Crear y gestionar rutinas de ejercicio
   - Asignar ejercicios a rutinas
   - Programar y realizar seguimiento de rutinas

4. **Seguimiento de Progreso**

   - Seguimiento de ejercicios completados
   - Monitoreo del progreso del usuario
   - Generación de informes de progreso

5. **Gestión de Usuarios**
   - Registro y gestión de perfiles de usuario
   - Asignación de roles
   - Control de acceso basado en roles

## Configuración e Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- Gestor de paquetes Yarn

### Configuración del Entorno

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombredb
   JWT_SECRET=tu-clave-secreta
   ```

### Pasos de Instalación

```bash
# Instalar dependencias
yarn install

# Ejecutar migraciones de base de datos
yarn typeorm migration:run

# Iniciar servidor de desarrollo
yarn start:dev

# Construir para producción
yarn build

# Iniciar servidor de producción
yarn start:prod
```

## Documentación de la API

### Endpoints de Autenticación

- POST `/auth/login` - Inicio de sesión
- POST `/auth/register` - Registro de usuario
- GET `/auth/profile` - Obtener perfil de usuario

### Endpoints de Ejercicios

- GET `/exercises` - Listar todos los ejercicios
- POST `/exercises` - Crear nuevo ejercicio
- GET `/exercises/:id` - Obtener detalles de ejercicio
- PATCH `/exercises/:id` - Actualizar ejercicio
- DELETE `/exercises/:id` - Eliminar ejercicio

### Endpoints de Rutinas

- GET `/routines` - Listar todas las rutinas
- POST `/routines` - Crear nueva rutina
- GET `/routines/:id` - Obtener detalles de rutina
- PATCH `/routines/:id` - Actualizar rutina
- DELETE `/routines/:id` - Eliminar rutina

### Endpoints de Seguimiento de Progreso

- GET `/exercise-progress` - Obtener historial de progreso
- POST `/exercise-completions` - Registrar ejercicio completado
- GET `/exercise-completions/:id` - Obtener detalles de completación

## Guías de Desarrollo

### Estilo de Código

- Seguir mejores prácticas de NestJS
- Usar modo estricto de TypeScript
- Implementar manejo adecuado de errores
- Escribir pruebas unitarias completas
- Usar inyección de dependencias

### Prácticas de Base de Datos

- Usar repositorios TypeORM
- Implementar migraciones de base de datos
- Seguir convenciones de nomenclatura
- Mantener integridad de datos

### Consideraciones de Seguridad

- Implementar validación de entrada
- Usar guardias de autenticación
- Sanitizar consultas de base de datos
- Manejar datos sensibles de forma segura

## Pruebas

```bash
# Pruebas unitarias
yarn test

# Pruebas e2e
yarn test:e2e

# Cobertura de pruebas
yarn test:cov
```

## Despliegue

### Configuración de Producción

1. Construir la aplicación
2. Configurar variables de entorno
3. Configurar conexión a base de datos
4. Configurar proxy inverso (nginx recomendado)
5. Configurar certificados SSL

### Despliegue con Docker

```bash
# Construir imagen Docker
docker build -t police-fitness-backend .

# Ejecutar contenedor
docker-compose up -d
```

## Mantenimiento y Soporte

### Registro de Logs

- Logs de aplicación almacenados en `/logs`
- Seguimiento de errores mediante logger integrado
- Monitoreo de rendimiento disponible

### Respaldo

- Respaldos regulares de base de datos recomendados
- Almacenar respaldos en ubicación segura
- Probar restauración de respaldos periódicamente

### Actualizaciones

- Actualizaciones regulares de dependencias
- Aplicación de parches de seguridad
- Actualizaciones de funcionalidades según necesidad

## Contribución

1. Hacer fork del repositorio
2. Crear rama de funcionalidad
3. Realizar cambios
4. Hacer push a la rama
5. Crear Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia UNLICENSED.
