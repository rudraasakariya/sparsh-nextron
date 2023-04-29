import db from "../firebase/firebase";

export async function getUserInfo(email) {
  const user = await db.collection("clients").doc(email).get();

  return {
    email: user.data().email,
    name: user.data().name,
    profileURL: user.data().profileURL,
  };
}
