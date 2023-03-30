import oauth2Client from "../googleAuth/OAuth2Client";
import db from "../firebase/firebase";

// * Adding Friend to the Friend List
export async function addFriend(req, res) {
  const doc = await db.collection("friend-list").doc(req.email).get();
  const friends = doc.data().friends;
  const friendData = await db.collection("clients").doc(req.body.friendEmail).get();
  console.log(friendData.data());
  if (friendData.exists) {
    friends.push({
      email: friendData.data().email,
      name: friendData.data().name,
      photoURL: friendData.data().profileURL,
    });
    console.log(friends);
    await db.collection("friend-list").doc(req.email).update({ friends: friends });
    res.status(200).send("Friend Added Successfully");
  } else {
    res.status(404).send("Ask your frined to join this app");
  }
}

// * Getting Friend List
export async function getFriends(req, res) {
  const doc = await db.collection("friend-list").doc(req.email).get();
  const frineds = doc.data().friends;
  res.send(frineds);
}
