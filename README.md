# Fitness Routine Management System

<p align="center">
  <a href="" target="blank"><img src="https://cicech.org/wp-content/uploads/2023/12/231207Policia.jpg" width="200" alt="" /></a>
</p>

![CircleCI](https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456)

## Project Overview

This project is a Fitness Routine Management System designed by the Police of the Chubut State, to help trainers assign workout routines to users. It's built using NestJS.

## Key Features

1. User Management
2. Routine Creation and Management
3. Routine Assignment to Users
4. Exercise Management within Routines
5. Date-based Scheduling for Routines

## Core Modules

### User Module

Handles user registration, authentication, and profile management.

### Routine Module

Manages the creation, updating, and deletion of workout routines.

### Exercise Module

Deals with individual exercises that can be added to routines.

### Routine Assignment Module

Handles the assignment of routines to users, including start and end dates.

## Data Models

- **User**: Represents registered users (trainers and trainees)
- **Routine**: Represents a collection of exercises
- **Exercise**: Individual workout activities
- **RoutineAssignment**: Links users to routines with specific date ranges

## Key Technical Aspects

1. **Transactional Operations**: Create and update operations use database transactions to ensure data integrity.
2. **Custom Date Validation**: Implements custom validators to handle date inputs in the format 'dd/mm/yyyy'.
3. **Relation Management**: Utilizes TypeORM's relationship features to manage connections between entities.
4. **Data Transfer Objects (DTOs)**: Uses DTOs for input validation and data shaping.
5. **Error Handling**: Implements custom error handling to provide meaningful error messages.

## API Endpoints

- `/users`: User management endpoints
- `/routines`: Routine CRUD operations
- `/exercises`: Exercise management
- `/routine-assignments`: Endpoints for assigning routines to users

## Date Handling

The system expects dates in the format 'dd/mm/yyyy'. These are validated and then converted to appropriate Date objects for database storage.

## Security

- Implements authentication and authorization
- Uses environment variables for sensitive data
- Input validation on all endpoints

## Database

Uses PostgreSQL as the primary database, managed through TypeORM.

## Testing

Includes unit tests for services and integration tests for API endpoints.

## Deployment

Configured for easy deployment to cloud platforms like Heroku or AWS.

## Future Enhancements

1. Implement real-time notifications for new routine assignments
2. Add progress tracking features for users
3. Integrate with wearable devices for automatic exercise logging

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example` for required variables)
4. Start the server: `npm run start:dev`

For detailed setup instructions and contribution guidelines, see CONTRIBUTING.md.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root directory and add the following variables:

```
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_PORT=
DB_USER=

JWT_SECRET=
SUPER_USER_EMAIL=
SUPER_USER_PASSWORD=
```

**Note**: Do not commit your `.env` file to version control. Add it to your `.gitignore` file.
