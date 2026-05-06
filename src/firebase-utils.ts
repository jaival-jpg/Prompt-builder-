import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase-setup';

// Admin / App Update
export const monitorAppUpdate = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'admin', 'update'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};

export const updateAppUpdate = async (data: any) => {
  await setDoc(doc(db, 'admin', 'update'), data);
};

export const clearAppUpdate = async () => {
  await updateDoc(doc(db, 'admin', 'update'), { active: false });
};

// Admin / Ad Views
export const incrementAdViews = async () => {
  const ref = doc(db, 'admin', 'activity');
  try {
    await updateDoc(ref, { adViews: increment(1) });
  } catch (e) {
    // If doc doesn't exist
    await setDoc(ref, { adViews: 1 });
  }
};

export const monitorAdViews = (callback: (views: number) => void) => {
  return onSnapshot(doc(db, 'admin', 'activity'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().adViews || 0);
    } else {
      callback(0);
    }
  });
};

// Admin / User Stats
export const incrementUserOpen = async (userName: string, dateStr: string) => {
  const ref = doc(db, 'userStats', userName);
  try {
    await setDoc(ref, {
      opens: {
        [dateStr]: increment(1)
      }
    }, { merge: true });
  } catch (e) {
    console.error('Error incrementing user open:', e);
  }
};

export const fetchAllUserStats = async () => {
  const snapshot = await getDocs(collection(db, 'userStats'));
  const stats: Record<string, any> = {};
  snapshot.forEach(doc => {
    stats[doc.id] = doc.data();
  });
  return stats;
};

export const monitorUserStats = (callback: (stats: Record<string, any>) => void) => {
  return onSnapshot(collection(db, 'userStats'), (snapshot) => {
    const stats: Record<string, any> = {};
    snapshot.forEach(doc => {
      stats[doc.id] = doc.data();
    });
    callback(stats);
  });
};
