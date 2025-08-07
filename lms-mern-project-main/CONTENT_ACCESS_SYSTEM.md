# Content Access System

## Overview
This is a simple content access control system where every lesson and unit has a unique ID, and you can grant access to specific content by adding those IDs to a user's record.

## How It Works

### 1. Content Structure
- Every **unit** has a unique `_id`
- Every **lesson** has a unique `_id` 
- You can set individual `price` for each lesson/unit
- Content can be marked as `isPaid: true/false`

### 2. User Access Control
Users have two arrays in their record:
- `hasPurchasedCourse`: Array of course IDs (grants access to entire course)
- `purchasedContentIds`: Array of lesson/unit IDs (grants access to specific content)

### 3. Access Logic
When a user tries to access content:
1. Check if user has purchased the entire course (`hasPurchasedCourse`)
2. If not, check if user has purchased this specific content (`purchasedContentIds`)
3. If neither, access is denied

## Usage

### Admin Dashboard
Go to `/admin/dashboard` and use the "منح الوصول للمحتوى" section:
1. Enter the user ID
2. Enter content IDs (separated by commas)
3. Click "منح الوصول"

### API Endpoint
```
POST /api/v1/courses/grant-access
{
  "userId": "user_id_here",
  "contentIds": ["lesson_id_1", "lesson_id_2", "unit_id_1"]
}
```

### Script Usage
Run the helper script to manage content access:

```bash
cd backend
node scripts/grant-content-access.js
```

## Example Workflow

1. **Create a course** with lessons and units (each gets a unique ID)
2. **Set prices** for individual lessons/units
3. **Grant access** to specific users by adding content IDs to their `purchasedContentIds` array
4. **Users can access** only the content they have IDs for

## Database Structure

### User Model
```javascript
{
  hasPurchasedCourse: [ObjectId], // Course IDs
  purchasedContentIds: [ObjectId]  // Lesson/Unit IDs
}
```

### Course Model
```javascript
{
  units: [{
    _id: ObjectId,
    title: String,
    lessons: [{
      _id: ObjectId,
      title: String,
      price: Number,
      isPaid: Boolean
    }]
  }],
  directLessons: [{
    _id: ObjectId,
    title: String,
    price: Number,
    isPaid: Boolean
  }]
}
```

## Benefits
- ✅ Simple and easy to understand
- ✅ Granular control over content access
- ✅ No complex purchase flows
- ✅ Easy to manage via admin interface
- ✅ Flexible pricing per lesson/unit 