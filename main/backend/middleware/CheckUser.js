// TODO: Make this middleware function when `electron-store` is ready

// * Importing and Initializing Socket.io
import { io } from "socket.io-client";
const socketInstance = io(`http://localhost:${process.env.PORT}`);

// * Importing Backend Modules
import db from "../firebase/firebase";

// * Getting the Email from the Socket.io Connection
let email = null;
socketInstance.on("token", (token) => {
  email = token;
});

async function CheckUser(req, res, next) {
  const user = await db.collection("clients").doc(email).get();
  if (user.exists) {
    next();
  } else {
    res.send("Hehe");
  }
}

export default CheckUser;
