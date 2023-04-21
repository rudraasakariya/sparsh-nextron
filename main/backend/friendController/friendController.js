import db from "../firebase/firebase";

// * Adding Friend to the Friend List
export async function addFriend(email, friendEmail) {
  const doc = (await db.collection("friends-list").doc(email).get()).data().friends;
  const friendDoc = (await db.collection("friends-list").doc(friendEmail).get()).data().friends;

  const data = await db.collection("clients").doc(email).get();
  const friendData = await db.collection("clients").doc(friendEmail).get();
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
    await db.collection("friends-list").doc(email).update({ friends: doc });
    await db.collection("friends-list").doc(friendEmail).update({ friends: friendDoc });
    res.status(200).send({
      message: "Friend Added Successfully",
      friends: doc,
    });
  } else {
    res.status(404).send("Ask your frined to join this app");
  }
}

// * Getting Friend List
export async function getFriends(email) {
  try {
    const doc = await db.collection("friends-list").doc(email).get();
    if (doc.exists) {
      const frineds = doc.data().friends;
      return frineds;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}
