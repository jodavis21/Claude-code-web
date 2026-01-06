# Journal App

A simple journaling application with Express backend and Firebase Firestore database.

## Features

- Create, read, update, and delete journal entries
- Search through entries by title or content
- Clean and responsive UI
- Cloud-based storage with Firebase Firestore

## Setup

### Prerequisites

- Node.js (v14 or higher)
- A Firebase account

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Firebase:
   - Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
   - Create a `.env` file with your Firebase credentials

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
.
├── db/
│   ├── database.js          # Original SQLite database (deprecated)
│   └── firebase-database.js # Firebase Firestore database
├── public/
│   ├── app.js              # Frontend JavaScript
│   ├── index.html          # Main HTML
│   └── style.css           # Styles
├── routes/
│   └── entries.js          # API routes
├── server.js               # Express server
├── .env.example            # Environment variables template
├── FIREBASE_SETUP.md       # Firebase setup instructions
└── package.json
```

## API Endpoints

- `GET /api/entries` - Get all entries (with optional ?search= query)
- `GET /api/entries/:id` - Get a single entry
- `POST /api/entries` - Create a new entry
- `PUT /api/entries/:id` - Update an entry
- `DELETE /api/entries/:id` - Delete an entry

## Environment Variables

See `.env.example` for required environment variables.

## Development

The application uses Firebase Firestore for data persistence. All entries are stored in the `entries` collection.

## License

MIT
