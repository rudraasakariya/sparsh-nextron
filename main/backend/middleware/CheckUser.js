// * Importing Backend Modules
import db from "../backend/firebase/firebase";

const CheckUser = async (token) => {
  if(!token) return "error";
  const user = await db.collection("clients").doc(token.email).get();
  if (user.exists) {
    return "success";
  } else {
    return "error";
  }
};

export default CheckUser;
