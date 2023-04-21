import db from "../firebase/firebase";

export async function uploadText(text , email) {
  await db.collection("user-data").doc(email).update({
    text: text,
  });
  return text;
}

export async function getText(email) {
  const text = (await db.collection("user-data").doc(email).get()).data().text;
  return text;
}
