import db from "../firebase/firebase.js";
import { clipboard } from "electron";

// * Updating the Text in the Database
export async function updateText(text , email) {
  await db.collection("user-data").doc(email).update({
    text: text,
  });
}

//* Retrieving the Text in the Database
export async function getText(email) {
  const snapshot = await db.collection("user-data").doc(email).get();
  if (snapshot.exists && snapshot.data().text) {
    const textValue = snapshot.data().text;
    clipboard.writeText(textValue);
  } else {
    console.log(`Text field does not exist`);
  }
}
