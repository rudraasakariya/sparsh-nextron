import admin from "firebase-admin";

// * Importing Firebase Credentials (Must mention the type as json)
import serviceAccount from "./firebase_creds.js";

// * Initializing Firebase App and Cloud Firestore
const db = admin
  .initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  .firestore();

export default db;
