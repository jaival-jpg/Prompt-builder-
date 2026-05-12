import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4AKsijpryp9eF8f5QoOrNHErazs8hdmE",
  authDomain: "prompt-builder-cb5b2.firebaseapp.com",
  projectId: "prompt-builder-cb5b2",
  storageBucket: "prompt-builder-cb5b2.firebasestorage.app",
  messagingSenderId: "945280088251",
  appId: "1:945280088251:web:83d207dcafb8c18cdd119e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test Firestore connection gracefully
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('Cloud Firestore backend')) {
      console.warn('⚠️ FIRESTORE NOT REACHABLE: Please make sure you have enabled "Firestore Database" in your Firebase console for project "prompt-builder-cb5b2".');
    }
  }
};
testConnection();

