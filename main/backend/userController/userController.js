import db from "../backend/firebase/firebase";

export async function getUserInfo(token) {
  const user = await db.collection("clients").doc(await token.email).get();
  
  return {
    email: user.data().email,
    name: user.data().name,
    profileURL: user.data().profileURL,
  };
}
