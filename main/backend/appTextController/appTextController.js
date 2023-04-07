import db from "../firebase/firebase";

export async function uploadText(req, res) {
  const email = await req.email;
  const text = await req.body.text;
  await db.collection("user-data").doc(email).update({
    text: text,
  });
  res.status(200).send({
    message: "Text Uploaded",
    text: text,
  });
}

export async function getText(req, res) {
  const email = await req.email;
  const text = (await db.collection("user-data").doc(email).get()).data().text;
  res.status(200).send({ text: text });
}
