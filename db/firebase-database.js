require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } = require('firebase/firestore');

// Initialize Firebase with client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database operations
const entries = {
  // Get all entries for a user, optionally filtered by search term
  getAll: async (userId, search = '') => {
    try {
      const entriesCol = collection(db, 'entries');
      const q = query(
        entriesCol,
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);

      let allEntries = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        // Convert Firestore Timestamps to ISO strings
        created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || docSnap.data().created_at,
        updated_at: docSnap.data().updated_at?.toDate?.()?.toISOString() || docSnap.data().updated_at
      }));

      // Filter by search term if provided (client-side filtering)
      if (search) {
        const searchLower = search.toLowerCase();
        allEntries = allEntries.filter(entry =>
          (entry.title?.toLowerCase().includes(searchLower)) ||
          (entry.content?.toLowerCase().includes(searchLower))
        );
      }

      return allEntries;
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  },

  // Get a single entry by ID (with optional userId validation)
  getById: async (id, userId = null) => {
    try {
      const docRef = doc(db, 'entries', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const entry = {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || docSnap.data().created_at,
        updated_at: docSnap.data().updated_at?.toDate?.()?.toISOString() || docSnap.data().updated_at
      };

      // Validate ownership if userId provided
      if (userId && entry.userId !== userId) {
        return null;
      }

      return entry;
    } catch (error) {
      console.error('Error getting entry:', error);
      throw error;
    }
  },

  // Create a new entry for a user
  create: async (userId, title, content) => {
    try {
      const now = Timestamp.now();
      const entriesCol = collection(db, 'entries');
      const docRef = await addDoc(entriesCol, {
        userId,
        title: title || '',
        content,
        created_at: now,
        updated_at: now
      });
      return entries.getById(docRef.id);
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  },

  // Update an existing entry (with ownership validation)
  update: async (id, userId, title, content) => {
    try {
      // Verify ownership before updating
      const existing = await entries.getById(id, userId);
      if (!existing) {
        throw new Error('Entry not found or unauthorized');
      }

      const now = Timestamp.now();
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, {
        title: title || '',
        content,
        updated_at: now
      });
      return entries.getById(id);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Delete an entry (with ownership validation)
  delete: async (id, userId) => {
    try {
      // Verify ownership before deleting
      const entry = await entries.getById(id, userId);
      if (entry) {
        const docRef = doc(db, 'entries', id);
        await deleteDoc(docRef);
      }
      return entry;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
};

module.exports = { db, entries };
