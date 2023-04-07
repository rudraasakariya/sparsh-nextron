import { google } from "googleapis";
import db from "../firebase/firebase.js";
import oauth2Client from "../googleAuthController/OAuth2Client.js";
import fs from "fs";
import mime from "mime-types";
import { io } from "socket.io-client";
const socketMain = io(`http://localhost:${process.env.PORT}`);

export async function uploadFile(req, res) {
  const receiverEmail = await req.body.friendEmail;
  const senderEmail = await req.email;
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // TODO: Change the regex according to the OS
  const filePath = await req.body.filePath;
  // * String Manipulation to get the File Name and File Type
  const fileName = filePath.split("\\").pop();
  const fileType = fileName.split(".").pop();

  const requestBody = {
    name: fileName,
    fields: "id",
  };

  const media = {
    mimeType: mime.lookup(fileType),
    body: fs.createReadStream(filePath),
  };

  try {
    async function driveUpload(senderObject) {
      // * Creating File in Google Drive
      const file = await drive.files.create({
        requestBody,
        media: media,
      });

      // * Getting the file metadata
      const fileMetaData = await drive.files.get(
        {
          fileId: file.data.id,
          fields: "*",
        },
        { responseType: "json" }
      );

      // * Creating shareable link for the file and saving it to the database
      const permission = await drive.permissions.create(
        {
          fileId: file.data.id, // * Replace with the ID of the file you just uploaded
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: receiverEmail, // * Replace with the email address of the person you want to share the file with
          },
        },
        (err, permission) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            console.log("Permission ID: ", permission.data.id);
          }
        }
      );

      const sender = (await db.collection("clients").doc(senderEmail).get()).data();
      const receiver = (await db.collection("clients").doc(receiverEmail).get()).data();

      // * Updating the Database for the Sender
      for (let i = 0; i < senderEmailData.length; i++) {
        senderEmailData.pop();
        senderEmailData.unshift({
          to: {
            name: receiver.name,
            email: receiver.email,
            profileURL: receiver.profileURL,
          },
          id: file.data.id,
          name: fileMetaData.data.name,
          webViewLink: fileMetaData.data.webViewLink,
          webContentLink: fileMetaData.data.webContentLink,
          time: Date.now(),
          // permission: permission,
        });
        break;
      }
      await db
        .collection("shared-data")
        .doc(senderEmail)
        .update({
          send: [...senderEmailData],
        });

      // * Updating the Databse for the Receiver
      for (let i = 0; i < receiverEmailData.length; i++) {
        receiverEmailData.pop();
        receiverEmailData.unshift({
          from: {
            name: sender.name,
            email: sender.email,
            profileURL: sender.profileURL,
          },
          id: file.data.id,
          name: fileMetaData.data.name,
          webViewLink: fileMetaData.data.webViewLink,
          webContentLink: fileMetaData.data.webContentLink,
          time: Date.now(),
          // permission: permission.data.id,
        });
        break;
      }

      await db
        .collection("shared-data")
        .doc(receiverEmail)
        .update({
          receive: [...receiverEmailData],
        });

      // * Broadcast to all sockets
      socketMain.emit("fileSent", {
        email: receiverEmail,
        name: fileMetaData.data.name,
      });
    }

    // * Getting File Id and Updating it
    const senderEmailData = (await db.collection("shared-data").doc(senderEmail).get()).data().send;
    const receiverEmailData = (await db.collection("shared-data").doc(receiverEmail).get()).data().receive;

    //  * Uploading the file to the sender's drive and updating the file id in both Sender and Receiver's Database
    await driveUpload();
    res.status(200).send({ message: "File Shared Successfully" });
  } catch (error) {
    throw Error(error);
  }
}

export async function getFiles(req, res) {
  const email = req.email;
  const sharedData = (await db.collection("shared-data").doc(email).get()).data();
  res.status(200).send({ sent: sharedData.send, received: sharedData.receive });
}
