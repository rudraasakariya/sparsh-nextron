import db from "../firebase/firebase";

export async function getUserInfo(req, res) {
  const user = await db.collection("clients").doc(await req.email).get();
  res.status(200).send({
    email: user.data().email,
    name: user.data().name,
    profileURL: user.data().profileURL,
  });
}
