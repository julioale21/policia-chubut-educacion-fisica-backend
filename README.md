# Fitness Routine Management System

<p align="center">
  <a href="" target="blank"><img src="https://cicech.org/wp-content/uploads/2023/12/231207Policia.jpg" width="200" alt="" /></a>
</p>

# Police Physical Education Backend

## Project Overview

This is a NestJS-based backend application designed to manage physical education routines and exercises for police personnel. The system provides functionality for creating, managing, and tracking exercise routines, individual exercises, and user progress.

## Technical Stack

- **Framework**: NestJS v10
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Built-in Swagger/OpenAPI
- **Testing**: Jest

## Project Structure

```
src/
├── auth/           # Authentication and authorization
├── common/         # Shared utilities and constants
├── exercises/      # Exercise management
├── exercise-completions/  # Exercise completion tracking
├── exercise-progress/     # Progress tracking
├── routine-assignments/   # Routine assignment management
├── routine-exercises/     # Exercises within routines
├── routines/      # Workout routine management
└── main.ts        # Application entry point
```

## Key Features

1. **Authentication System**

   - JWT-based authentication
   - Role-based access control
   - Secure password hashing with bcrypt

2. **Exercise Management**

   - Create, read, update, and delete exercises
   - Exercise categorization
   - Detailed exercise descriptions and requirements

3. **Routine Management**

   - Create and manage workout routines
   - Assign exercises to routines
   - Schedule and track routine completion

4. **Progress Tracking**

   - Track individual exercise completion
   - Monitor user progress over time
   - Generate progress reports

5. **User Management**
   - User registration and profile management
   - Role assignment
   - Access control based on user roles

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Yarn package manager

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your-secret-key
   ```

### Installation Steps

```bash
# Install dependencies
yarn install

# Run database migrations
yarn typeorm migration:run

# Start development server
yarn start:dev

# Build for production
yarn build

# Start production server
yarn start:prod
```

## Test Data Seed

To populate the database with test data, run:

```bash
POST http://localhost:3000/api/v1/seed
```

### Created Users

| Role | Email | Password |
|------|-------|----------|
| Trainer | `trainer@policia.gov.ar` | `trainer123` |
| Student 1 | `estudiante1@policia.gov.ar` | `student123` |
| Student 2 | `estudiante2@policia.gov.ar` | `student123` |
| Student 3 | `estudiante3@policia.gov.ar` | `student123` |

### Generated Data

- **14 exercises** with detailed instructions, muscle groups, and difficulty levels
- **2 routines** with multiple days and assigned exercises
- **Assignments** of routines to students
- **Completions** examples (student1 has partial progress)

### Exercise Categories

- FUERZA (Strength): Push-ups, Squats, Plank, Pull-ups, Dips
- CARDIO: Burpees, Jumping Jacks, Mountain Climbers, Running in Place
- RESISTENCIA (Endurance): Resistance Circuit, Jump Squats
- FLEXIBILIDAD (Flexibility): Hamstring, Quadriceps, Back Stretches

## API Documentation

### Authentication Endpoints

- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- GET `/auth/profile` - Get user profile

### Exercise Endpoints

- GET `/exercises` - List all exercises
- POST `/exercises` - Create new exercise
- GET `/exercises/:id` - Get exercise details
- PATCH `/exercises/:id` - Update exercise
- DELETE `/exercises/:id` - Delete exercise

### Routine Endpoints

- GET `/routines` - List all routines
- POST `/routines` - Create new routine
- GET `/routines/:id` - Get routine details
- PATCH `/routines/:id` - Update routine
- DELETE `/routines/:id` - Delete routine
- GET `/routines/user/assignments` - Get my assigned routines with progress
- GET `/routines/:routineId/assignments/:assignmentId` - Get routine detail with days and exercises

### Progress Tracking Endpoints

- GET `/exercise-progress` - Get progress history
- POST `/exercise-completions` - Record exercise completion
- GET `/exercise-completions/:id` - Get completion details

### Seed Endpoint

- POST `/seed` - Populate database with test data

## Development Guidelines

### Code Style

- Follow NestJS best practices
- Use TypeScript strict mode
- Implement proper error handling
- Write comprehensive unit tests
- Use dependency injection

### Database Practices

- Use TypeORM repositories
- Implement database migrations
- Follow naming conventions
- Maintain data integrity

### Security Considerations

- Implement input validation
- Use proper authentication guards
- Sanitize database queries
- Handle sensitive data securely

## Testing

```bash
# Unit tests
yarn test

# e2e tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Deployment

### Production Setup

1. Build the application
2. Set up environment variables
3. Configure database connection
4. Set up reverse proxy (nginx recommended)
5. Configure SSL certificates

### Docker Deployment

```bash
# Build Docker image
docker build -t police-fitness-backend .

# Run container
docker-compose up -d
```

## Maintenance and Support

### Logging

- Application logs stored in `/logs`
- Error tracking through built-in logger
- Performance monitoring available

### Backup

- Regular database backups recommended
- Store backups in secure location
- Test backup restoration periodically

### Updates

- Regular dependency updates
- Security patch application
- Feature updates as needed

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the UNLICENSED license.
