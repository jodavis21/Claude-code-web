# Firestore Security Rules

## Important: Update Your Firestore Security Rules

Now that the backend supports multi-user authentication, you **MUST** update your Firestore security rules to enforce user-based access control.

## How to Update

1. Go to [Firebase Console](https://console.firebase.google.com/project/journal-2fbb8/firestore/rules)
2. Click on the **"Rules"** tab
3. Replace the existing rules with the rules below
4. Click **"Publish"**

## Required Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Entries collection - users can only access their own entries
    match /entries/{entryId} {
      // Allow read if user is authenticated and owns the entry
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Allow create if user is authenticated and sets their own userId
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      // Allow update if user owns the entry and doesn't change userId
      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      // Allow delete if user owns the entry
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

## What These Rules Do

- **Require Authentication**: All operations require a valid Firebase Auth token
- **Enforce Ownership**: Users can only read, update, and delete their own entries
- **Prevent Tampering**: Users cannot change the `userId` field when updating
- **Secure Creation**: New entries must have the `userId` set to the authenticated user's UID

## Testing the Rules

After publishing, you can test the rules in the Firebase Console:
1. Go to the **"Rules Playground"** tab
2. Select an operation (read/write)
3. Enter a document path: `entries/test-entry-id`
4. Add authentication (simulate signed-in user)
5. Click **"Run"** to test

## Important Notes

⚠️ **Breaking Change**: These rules will prevent access to entries that don't have a `userId` field. If you have existing test entries without a `userId`, you'll need to either:
1. Delete them from the Firestore console, or
2. Manually add a `userId` field to each entry

## Migration Script (Optional)

If you have existing entries, you can add a `userId` to them by running this in the Firebase Console:

```javascript
// In Firestore Console, select entries collection
// For each entry, click "Add field"
// Field name: userId
// Field value: <your-firebase-auth-uid>
```

Or delete all test entries and start fresh with the new authenticated system.
