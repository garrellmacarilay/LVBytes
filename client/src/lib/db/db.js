import { getDatabase, ref, set, push, onValue } from "firebase/database";
import {app} from "../firebase"; // your firebase.js export

const db = getDatabase(app);

// Write data
export function writeData(path, value) {
  return set(ref(db, path), value);
}

// Add new item (like auto-id)
export function addData(path, value) {
  const newRef = push(ref(db, path));
  return set(newRef, value);
}

// Read data in real time
export function listenData(path, callback) {
  const dbRef = ref(db, path);
  onValue(dbRef, (snapshot) => {
    callback(snapshot.val());
  });
}
