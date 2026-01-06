# Firebase Setup Guide

This guide will help you configure Firebase for the journaling app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll set up rules later)
4. Select a location closest to your users
5. Click **Enable**

## Step 3: Set Up Firestore Security Rules

In the Firestore Database section, go to the **Rules** tab and update with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read, write: if true;  // For development only
      // For production, add proper authentication rules
    }
  }
}
```

**Note:** These rules allow public access for development. Update them for production!

## Step 4: Get Firebase Admin Credentials

### Option A: Service Account (Recommended)

1. Go to **Project Settings** (gear icon) > **Service Accounts**
2. Click **Generate new private key**
3. Save the downloaded JSON file as `firebase-service-account.json` in your project root
4. Create a `.env` file with:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

### Option B: Environment Variables

1. Go to **Project Settings** > **Service Accounts**
2. Note your **Project ID**
3. From the downloaded service account JSON, extract:
   - `project_id`
   - `client_email`
   - `private_key`
4. Create a `.env` file with:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
   ```

## Step 5: Create .env File

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials.

## Step 6: Start the Application

```bash
npm start
```

The app will now use Firebase Firestore instead of SQLite!

## Migrating Existing Data (Optional)

If you have existing entries in the SQLite database, you can create a migration script. The old database is located at:
- `~/.journaling-app/journal.db`

## Security Recommendations for Production

1. **Enable Authentication**: Use Firebase Auth to secure your entries
2. **Update Firestore Rules**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /entries/{entry} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. **Restrict API Access**: Add middleware to verify authenticated users
4. **Use Environment Variables**: Never commit `.env` or service account files to version control

## Troubleshooting

- **Error: "Could not load the default credentials"**: Make sure your `.env` file has the correct Firebase credentials
- **Error: "Missing or insufficient permissions"**: Check your Firestore security rules
- **Error: "Firebase Admin already initialized"**: The app tries to initialize only once; restart the server if you change credentials
