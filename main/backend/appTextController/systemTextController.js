import db from "../firebase/firebase.js";
import { io } from "socket.io-client";
import { clipboard } from "electron";

// * Initializing the Socket.io Connection
const socketInstance = io(`http://localhost:${process.env.PORT}`);
// * Getting the Email from the Socket.io Connection
let email = null;

export function initializeSocket() {
  socketInstance.on("token", (token) => {
    email = token;
    console.log(email);
  });

  return null;
}

// * Updating the Text in the Database
export async function updateText(text) {
  await db.collection("user-data").doc(email).update({
    text: text,
  });
}

//* Retrieving the Text in the Database
export async function getText() {
  const snapshot = await db.collection("user-data").doc(email).get();
  if (snapshot.exists && snapshot.data().text) {
    const textValue = snapshot.data().text;
    clipboard.writeText(textValue);
  } else {
    console.log(`Text field does not exist`);
  }
}
