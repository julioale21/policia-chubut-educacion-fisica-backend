# Notifications Module Documentation

## Overview

The Notifications module provides push notification functionality using Firebase Cloud Messaging (FCM). It allows sending notifications to users, storing them in the database, and managing FCM tokens for multiple devices per user.

## Architecture

### Entities

#### Notification Entity
Stores all notifications sent to users.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | string | Notification title |
| body | string | Notification body text |
| imageUrl | string (nullable) | Optional image URL |
| type | enum | Type of notification (general, routine_reminder, etc.) |
| data | jsonb (nullable) | Additional payload data |
| isRead | boolean | Whether the user has read the notification |
| isSent | boolean | Whether the push was successfully sent |
| userId | UUID | Foreign key to User |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

#### UserFcmToken Entity
Stores FCM tokens for each user's devices.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| token | string | FCM device token |
| deviceType | string (nullable) | Device type (android/ios) |
| isActive | boolean | Whether the token is still valid |
| userId | UUID | Foreign key to User |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

### Notification Types

```typescript
enum NotificationType {
  GENERAL = 'general',
  ROUTINE_REMINDER = 'routine_reminder',
  EXERCISE_COMPLETED = 'exercise_completed',
  ROUTINE_ASSIGNED = 'routine_assigned',
  ACHIEVEMENT = 'achievement',
  EXAM_DATE = 'exam_date',
  EXAM_PERIOD = 'exam_period',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
}
```

| Type | Use Case |
|------|----------|
| `general` | General messages |
| `routine_reminder` | Workout reminders |
| `exercise_completed` | Exercise completion acknowledgment |
| `routine_assigned` | New routine assigned by trainer |
| `achievement` | Achievements and badges |
| `exam_date` | Physical exam date announcements |
| `exam_period` | Exam period start/end |
| `event` | Scheduled events (workshops, training) |
| `announcement` | Official announcements |

## API Endpoints

### GET /notifications
Get paginated notifications for the authenticated user.

**Auth:** User role required

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New Routine Assigned",
      "body": "You have been assigned a new workout routine",
      "imageUrl": null,
      "type": "routine_assigned",
      "data": { "routineId": "uuid" },
      "isRead": false,
      "isSent": true,
      "userId": "uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 5,
  "totalCount": 25
}
```

---

### GET /notifications/unread-count
Get the count of unread notifications.

**Auth:** User role required

**Response:**
```json
{
  "unreadCount": 5
}
```

---

### POST /notifications
Create and send a notification to one or more users.

**Auth:** Admin, Trainer, or SuperUser role required

**Request Body:**
```json
{
  "title": "Workout Reminder",
  "body": "Don't forget to complete today's exercises!",
  "imageUrl": "https://example.com/image.png",
  "type": "routine_reminder",
  "data": {
    "routineId": "uuid",
    "action": "open_routine"
  },
  "userId": "uuid",        // Send to single user
  "userIds": ["uuid1", "uuid2"]  // Send to multiple users
}
```

**Note:** If neither `userId` nor `userIds` is provided, the notification will be sent to ALL users with active FCM tokens.

**Response:**
```json
{
  "notification": { ... },
  "sentCount": 3,
  "failedCount": 1
}
```

---

### POST /notifications/token
Register or update an FCM token for the authenticated user.

**Auth:** User role required

**Request Body:**
```json
{
  "token": "fcm_device_token_string",
  "deviceType": "android"  // or "ios" (optional)
}
```

**Response:**
```json
{
  "id": "uuid",
  "token": "fcm_device_token_string",
  "deviceType": "android",
  "isActive": true,
  "userId": "uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### PATCH /notifications/:id/read
Mark a specific notification as read.

**Auth:** User role required (can only mark own notifications)

**Response:**
```json
{
  "id": "uuid",
  "title": "Notification Title",
  "isRead": true,
  ...
}
```

---

### PATCH /notifications/read-all
Mark all notifications as read for the authenticated user.

**Auth:** User role required

**Response:**
```json
{
  "count": 5
}
```

---

### DELETE /notifications/:id
Delete a notification.

**Auth:** User role required (can only delete own notifications)

**Response:**
```json
{
  "message": "Notification deleted"
}
```

## Usage Examples

### Sending a Notification from Another Service

```typescript
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoutineAssignmentsService {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  async assignRoutine(userId: string, routineId: string) {
    // ... assignment logic

    // Send notification
    await this.notificationsService.createAndSend({
      title: 'New Routine Assigned',
      body: 'Your trainer has assigned you a new workout routine',
      type: NotificationType.ROUTINE_ASSIGNED,
      data: { routineId },
      userId,
    });
  }
}
```

### Sending Push to User Without Creating Database Record

```typescript
await this.notificationsService.sendPushToUser(userId, {
  title: 'Quick Reminder',
  body: 'Time for your workout!',
  data: { screen: 'home' },
});
```

## Firebase Configuration

### Required Environment Variables

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Extract the values and add them to your `.env` file

## Error Handling

### Invalid FCM Tokens

When a push notification fails due to an invalid or expired token, the module automatically marks the token as inactive (`isActive: false`). This prevents repeated failures and optimizes delivery.

### Firebase Not Initialized

If Firebase credentials are not provided or are invalid, the module will:
1. Log a warning message
2. Continue operating without push notifications
3. Still save notifications to the database

## Database Migrations

The module uses TypeORM's auto-synchronize feature in development. For production, create migrations:

```bash
yarn typeorm migration:generate -n CreateNotificationsTables
yarn typeorm migration:run
```

## Testing

### Unit Tests
```bash
yarn test src/notifications
```

### Manual Testing with cURL

```bash
# Get notifications
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send notification (Admin)
curl -X POST http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test",
    "userId": "target-user-uuid"
  }'

# Register FCM token
curl -X POST http://localhost:3000/notifications/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token",
    "deviceType": "android"
  }'
```
