import db from "../firebase/firebase";

// * Adding Friend to the Friend List
export async function addFriend(user, friend) {
  const doc = (await db.collection("friends-list").doc(user).get()).data().friends;
  const friendDoc = (await db.collection("friends-list").doc(friend).get()).data().friends;

  const data = await db.collection("clients").doc(user).get();
  const friendData = await db.collection("clients").doc(friend).get();
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
    await db.collection("friends-list").doc(user).update({ friends: doc });
    await db.collection("friends-list").doc(friend).update({ friends: friendDoc });

    return doc;
    // res.status(200).send({
    //   message: "Friend Added Successfully",
    //   friends: doc,
    // });
  } else {
    return "User Does Not Exist";
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
      return "No Friends";
    }
  } catch (error) {
    throw error;
  }
}
