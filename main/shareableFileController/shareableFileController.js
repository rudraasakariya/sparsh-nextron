import { google } from "googleapis";
import db from "../firebase/firebase";
import oauth2Client from "../googleAuthController/OAuth2Client";
import fs from "fs";
import mime from "mime-types";
import { io } from "socket.io-client";
import { ipcMain } from "electron";

export async function uploadFile(filePath, friendEmail, email) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // TODO: Change the regex according to the OS
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
    async function driveUpload() {
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
        drive.permissions.create(
        {
          fileId: file.data.id, // * Replace with the ID of the file you just uploaded
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: friendEmail, // * Replace with the email address of the person you want to share the file with
          },
        },
        (err, permission) => {
          if (err) {
            // Handle error
            console.error(err);
          }
        }
      );

      const sender = (await db.collection("clients").doc(email).get()).data();
      const receiver = (await db.collection("clients").doc(friendEmail).get()).data();

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
        .doc(email)
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
        .doc(friendEmail)
        .update({
          receive: [...receiverEmailData],
        });

      // * Broadcast to all sockets
      ipcMain.emit("fileSent", {
        email: friendEmail,
        name: fileMetaData.data.name,
      });

      return "File Uploaded Successfully";
    }

    // * Getting File Id and Updating it
    const senderEmailData = (await db.collection("shared-data").doc(email).get()).data().send;
    const receiverEmailData = (await db.collection("shared-data").doc(friendEmail).get()).data().receive;

    //  * Uploading the file to the sender's drive and updating the file id in both Sender and Receiver's Database
    await driveUpload();
  } catch (error) {
    return error;
  }
}

export async function getFiles(email) {
  const sharedData = (await db.collection("shared-data").doc(email).get()).data();
  const data = {
    sent: sharedData.send,
    received: sharedData.receive,
  };

  const dataToReturn = {
    sent: [],
    received: [],
  };

  // * Removing all empty json objects from the data.
  for (let i = 0; i < data.sent.length; i++) {
    if (Object.values(data.sent[i]).every((x) => x !== "")) {
      dataToReturn.sent.push(data.sent[i]);
    }
  }

  for (let i = 0; i < data.received.length; i++) {
    if (Object.values(data.received[i]).every((x) => x !== "")) {
      dataToReturn.received.push(data.received[i]);
    }
  }

  return dataToReturn;
}
