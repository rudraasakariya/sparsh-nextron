// * Importing and Initializing Socket.io
import { io } from "socket.io-client";
const socketInstance = io(`http://localhost:${process.env.PORT}`);

// * Importing Backend Modules
import db from "../firebase/firebase";

// * Getting the Email from the Socket.io Connection
let email = null;

export function initializeUser() {
  socketInstance.on("token", (token) => {
    email = token;
  });

  return null;
}

export const CheckUser = async (req, res, next) => {
  const user = await db.collection("clients").doc(email).get();
  if (user.exists) {
    req.email = email;
    return next();
  } else {
    console.log("Hehe");
  }
}

export default CheckUser;
