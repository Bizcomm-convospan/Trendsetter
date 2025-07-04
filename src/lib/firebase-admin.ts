
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please provide the service account JSON key.');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('CRITICAL: Firebase admin initialization failed.', error.stack);
    // Re-throw the error to prevent the app from starting in a broken state.
    // This makes configuration errors obvious immediately during startup.
    throw new Error('Firebase Admin SDK could not be initialized. Check the server logs for more details.');
  }
}

export const adminDb = admin.firestore();
export default admin;
