import db from "../firebase/firebase";

// * Adding Friend to the Friend List
export async function addFriend(req, res) {
  const doc = (await db.collection("friends-list").doc(req.email).get()).data().friends;
  const friendDoc = (await db.collection("friends-list").doc(req.body.friendEmail).get()).data().friends;

  const data = await db.collection("clients").doc(req.email).get();
  const friendData = await db.collection("clients").doc(req.body.friendEmail).get();
  if (data.exists && friendData.exists) {
    doc.push({
      email: friendData.data().email,
      name: friendData.data().name,
      profileURL: friendData.data().profileURL,
    });

    friendDoc.push({
      email: data.data().email,
      name: data.data().name,
      profileURL: data.data().profileURL,
    });
    await db.collection("friends-list").doc(req.email).update({ friends: doc });
    await db.collection("friends-list").doc(req.body.friendEmail).update({ friends: friendDoc });
    res.status(200).send({
      message: "Friend Added Successfully",
      friends: doc,
    });
  } else {
    res.status(404).send("Ask your frined to join this app");
  }
}

// * Getting Friend List
export async function getFriends(req, res) {
  try {
    const doc = await db.collection("friends-list").doc(req.email).get();
    if (doc.exists) {
      const frineds = doc.data().friends;
      res.send(frineds);
    } else {
      res.status(404).send("No Friends Found");
    }
  } catch (error) {
    throw error;
  }
}
