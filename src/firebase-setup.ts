import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const googleProvider = new GoogleAuthProvider();
