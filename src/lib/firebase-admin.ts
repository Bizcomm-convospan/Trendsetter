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
    console.error('Firebase admin initialization error. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON key.', error.stack);
  }
}

export const adminDb = admin.firestore();
export default admin;
