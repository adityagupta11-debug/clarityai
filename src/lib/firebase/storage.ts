import { getStorage } from "firebase/storage";
import { getFirebaseApp } from "./config";

// Lazily obtain the Storage instance — implemented in Phase 2
export function storage() {
  return getStorage(getFirebaseApp());
}
