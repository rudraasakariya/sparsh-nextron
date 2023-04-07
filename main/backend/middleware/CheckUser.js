// * Importing and Initializing Socket.io
import { io } from "socket.io-client";

// * Importing Backend Modules
import db from "../firebase/firebase";

// * Getting the Email from the Socket.io Connection
let email = null;

export function initializeUser() {
const socketInstance = io(`http://localhost:${process.env.PORT}`);

  socketInstance.on("token", (token) => {
    email = token;
  });
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
