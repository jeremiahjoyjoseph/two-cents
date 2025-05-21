import { firestore } from '@/config/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export const generatePairCode = async (uid: string, groupId: string) => {
  console.log('code', uid, groupId);
  const fullUUID = crypto.randomUUID(); // e.g., 'de305d54-75b4-431b-adb2-eb6b9e546013'
  const code = fullUUID.slice(0, 6).toUpperCase(); // e.g., 'DE305D'
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 10 * 60 * 1000));

  console.log('code', code);

  await setDoc(doc(firestore, 'pairCodes', code), {
    generatedBy: uid,
    groupId,
    createdAt: now,
    expiresAt,
    used: false,
  });

  return code;
};
