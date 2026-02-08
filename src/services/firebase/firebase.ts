import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { ENV, hasFirebaseConfig } from "../../config/env";

const firebaseConfig = {
  apiKey: ENV.firebaseApiKey,
  authDomain: ENV.firebaseAuthDomain,
  projectId: ENV.firebaseProjectId,
  storageBucket: ENV.firebaseStorageBucket,
  messagingSenderId: ENV.firebaseMessagingSenderId,
  appId: ENV.firebaseAppId,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Persist auth session in AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

if (!hasFirebaseConfig()) {
  console.log("⚠️ Firebase config missing. Check .env + app.config.ts");
} else {
  console.log("✅ Firebase config loaded for project:", ENV.firebaseProjectId);
}
