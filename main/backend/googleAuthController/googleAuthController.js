import oauth2Client from "./OAuth2Client.js";
import db from "../firebase/firebase.js";
import * as UserSchema from "../firebase/user-data.js";
import axios from "axios";
import dotenv from "dotenv";
import { io } from "socket.io-client";
dotenv.config();

const socketInstance = io(`http://localhost:${process.env.PORT}`);

// * Authentication URL for handling Sign In with Google
export async function authenticationUrl(req, res) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  try {
    res.redirect(authUrl);
  } catch (error) {
    res.status(400).send(error);
  }
}

// * Handling OAuthCallback to create a new user
export async function oauth2Callback(req, res) {
  const code = req.query.code;
  try {
    oauth2Client.getToken(code, async (err, token) => {
      if (err) res.send(err);

      // * Response Token
      if (token) {
        const userinfo = await axios.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token.id_token);

        // * Checking if user already exists
        const user = await db.collection("clients").doc(userinfo.data.email).get();
        if (user.exists) {
          // * Creating a User Token and sending it to the `Main Process`
          const userToken = {
            name: userinfo.data.name,
            email: userinfo.data.email,
            profileURL: userinfo.data.picture,
            ...user.data(),
          };
          socketInstance.emit("authenticated", userToken);
          res.send(`<script>alert("Close the tab you're already logged in");</script>`);
        } else {
          // * Creating New User
          await db
            .collection("clients")
            .doc(userinfo.data.email)
            .create({
              name: userinfo.data.name,
              email: userinfo.data.email,
              profileURL: userinfo.data.picture,
              //  * Adding the Token to the Database using the `Spread Operator`
              ...token,
            });
          await db
            .collection("user-data")
            .doc(userinfo.data.email)
            .create({
              ...UserSchema.userData,
              // ? Maybe we can use this to store the folder id
              // folder_id:f_id
            });
          await db
            .collection("shared-data")
            .doc(userinfo.data.email)
            .create({
              ...UserSchema.sharedData,
            });
          await db.collection("friends-list").doc(userinfo.data.email).create({
            friends: UserSchema.friendList,
          });

          // * Setting Credentials
          oauth2Client.setCredentials(token);

          const userToken = {
            name: userinfo.data.name,
            email: userinfo.data.email,
            profileURL: userinfo.data.picture,
            //  * Adding the Token to the Database using the `Spread Operator`
            ...token,
          };

          // * Sending the `authenticated` event to the `Main Process`
          socketInstance.emit("authenticated", userToken);

          res.send(`<script>alert("Close the window you're logged in");</script>`);
        }
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
}
