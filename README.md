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
├── auth/                  # Authentication and authorization
├── common/                # Shared utilities and constants
├── exercises/             # Exercise management
├── exercise-completions/  # Exercise completion tracking
├── exercise-progress/     # Progress tracking
├── notifications/         # Push notifications module
├── routine-assignments/   # Routine assignment management
├── routine-exercises/     # Exercises within routines
├── routines/              # Workout routine management
├── statistics/            # User statistics and analytics
└── main.ts                # Application entry point
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

6. **Push Notifications**
   - Firebase Cloud Messaging (FCM) integration
   - Store notifications in database
   - Mark as read/unread functionality
   - Send to individual users or broadcast to all
   - FCM token management per device

7. **Statistics & Analytics**
   - Overall progress tracking
   - Category-based progress (Strength, Cardio, Flexibility)
   - Weekly activity data
   - Streak tracking (current and longest)
   - Routine completion statistics

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Yarn package manager

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```env
   # Database
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   POSTGRES_SSL="false"

   # Authentication
   JWT_SECRET=your_very_long_and_secure_random_string
   SUPER_USER_EMAIL=admin@example.com
   SUPER_USER_PASSWORD=your_secure_password

   # Firebase Admin SDK (for push notifications)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

#### Firebase Setup for Push Notifications

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Copy the values from the downloaded JSON to your `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

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

### Notifications Endpoints

- GET `/notifications` - Get user notifications (paginated)
- GET `/notifications/unread-count` - Get unread notification count
- POST `/notifications` - Create and send notification (Admin/Trainer only)
- POST `/notifications/token` - Register/update FCM token
- PATCH `/notifications/:id/read` - Mark notification as read
- PATCH `/notifications/read-all` - Mark all notifications as read
- DELETE `/notifications/:id` - Delete a notification

### Statistics Endpoints

- GET `/statistics/user` - Get user statistics and progress data

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

## Notifications Module - Usage Guide

### Overview

The Notifications module enables push notifications via Firebase Cloud Messaging (FCM). Notifications are stored in the database and can be sent to individual users or broadcast to all users.

### Step 1: Configure Firebase (Backend)

1. Add Firebase credentials to `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. Restart the server. You should see:
   ```
   Firebase Admin initialized successfully
   ```

### Step 2: Register FCM Token (Mobile App)

When a user logs in, the mobile app should send its FCM token:

```bash
POST /notifications/token
Authorization: Bearer <user_jwt_token>
Content-Type: application/json

{
  "token": "fcm_device_token_from_firebase",
  "deviceType": "android"
}
```

**Response:**
```json
{
  "id": "uuid",
  "token": "fcm_device_token",
  "deviceType": "android",
  "isActive": true,
  "userId": "user-uuid"
}
```

### Step 3: Get User Notifications

Fetch notifications for the authenticated user (paginated):

```bash
GET /notifications?limit=20&offset=0
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New Routine Assigned",
      "body": "Your trainer assigned you a new workout routine",
      "type": "routine_assigned",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 5,
  "totalCount": 25
}
```

### Step 4: Send Notifications (Admin/Trainer Only)

**Send to a single user:**
```bash
POST /notifications
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Workout Reminder",
  "body": "Don't forget to complete today's exercises!",
  "type": "routine_reminder",
  "userId": "target-user-uuid",
  "data": {
    "routineId": "routine-uuid",
    "action": "open_routine"
  }
}
```

**Send to multiple users:**
```bash
{
  "title": "Group Reminder",
  "body": "Training session tomorrow at 9 AM",
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Broadcast to ALL users:**
```bash
{
  "title": "System Announcement",
  "body": "New features are now available!"
}
```

**Response:**
```json
{
  "notification": { ... },
  "sentCount": 15,
  "failedCount": 2
}
```

### Step 5: Mark Notifications as Read

**Mark single notification:**
```bash
PATCH /notifications/<notification-id>/read
Authorization: Bearer <user_jwt_token>
```

**Mark all notifications:**
```bash
PATCH /notifications/read-all
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "count": 5
}
```

### Step 6: Delete Notification

```bash
DELETE /notifications/<notification-id>
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "message": "Notification deleted"
}
```

### Step 7: Get Unread Count

Useful for displaying badge count in the app:

```bash
GET /notifications/unread-count
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "unreadCount": 5
}
```

### Notification Types

| Type | Description |
|------|-------------|
| `general` | General announcements |
| `routine_reminder` | Workout reminders |
| `exercise_completed` | Exercise completion acknowledgment |
| `routine_assigned` | New routine assignment |
| `achievement` | Achievement unlocked |
| `exam_date` | New exam date scheduled |
| `exam_period` | Exam period announcement |
| `event` | New event scheduled |
| `announcement` | Official announcements |

### Notifications with Images

Notifications support images for richer content. The `imageUrl` field must be a valid public URL:

**Example: Exam Date Notification**
```bash
POST /notifications
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "New Physical Exam Date",
  "body": "The physical fitness exam is scheduled for March 15, 2024 at 8:00 AM at the main training facility.",
  "imageUrl": "https://your-storage.com/images/exam-announcement.jpg",
  "type": "exam_date",
  "data": {
    "examDate": "2024-03-15",
    "examTime": "08:00",
    "location": "Main Training Facility"
  }
}
```

**Example: Exam Period Start**
```bash
{
  "title": "Exam Period Begins",
  "body": "The physical fitness evaluation period starts next Monday. Review your training routines and prepare accordingly.",
  "imageUrl": "https://your-storage.com/images/exam-period-banner.png",
  "type": "exam_period",
  "data": {
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
  }
}
```

**Example: New Event**
```bash
{
  "title": "Training Workshop",
  "body": "Join us for a special cardio training workshop this Saturday. All personnel welcome!",
  "imageUrl": "https://your-storage.com/images/workshop-event.jpg",
  "type": "event",
  "data": {
    "eventDate": "2024-02-24",
    "eventTime": "10:00",
    "location": "Sports Complex",
    "registrationRequired": true
  }
}
```

**Example: Official Announcement**
```bash
{
  "title": "New Training Guidelines",
  "body": "Updated training guidelines have been published. Please review the new requirements before your next evaluation.",
  "imageUrl": "https://your-storage.com/images/guidelines-update.png",
  "type": "announcement",
  "data": {
    "documentUrl": "https://example.com/guidelines-2024.pdf"
  }
}
```

### Error Handling

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Trying to access another user's notification
- **404 Not Found**: Notification doesn't exist

### Using from Other Services

```typescript
// Inject NotificationsService
constructor(private readonly notificationsService: NotificationsService) {}

// Send notification when assigning routine
await this.notificationsService.createAndSend({
  title: 'New Routine Assigned',
  body: `Your trainer assigned "${routineName}"`,
  type: NotificationType.ROUTINE_ASSIGNED,
  data: { routineId },
  userId: studentId,
});
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the UNLICENSED license.
