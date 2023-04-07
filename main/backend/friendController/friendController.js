import db from "../firebase/firebase";

// * Adding Friend to the Friend List
export async function addFriend(req, res) {
  const doc = await db.collection("friends-list").doc(req.email).get();
  console.log(doc);
  const friends = doc.data().friends;
  const friendData = await db.collection("clients").doc(req.body.friendEmail).get();
  if (friendData.exists) {
    friends.push({
      email: friendData.data().email,
      name: friendData.data().name,
      photoURL: friendData.data().profileURL,
    });
    await db.collection("friends-list").doc(req.email).update({ friends: friends });
    res.status(200).send("Friend Added Successfully");
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
