import { google } from "googleapis";

import db from "../firebase/firebase.js";

import oauth2Client from "../googleAuthController/OAuth2Client.js";

import fs from "fs";

import mime from "mime-types";

export async function uploadFile(req, res) {
  const receiverEmail = await req.body.email;
  const senderEmail = await req.email;
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // TODO: Change the regex according to the OS
  const filePath = req.body.filePath;
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
      drive.permissions.create(
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
            console.log("Permission ID:", permission.data.id);
          }
        }
      );

      // * Updating the Database for the Sender
      const updatedSenderEmailData = senderEmailData.map((obj) =>
        obj.id === senderObject.id
          ? {
              to: receiverEmail,
              id: file.data.id,
              name: fileMetaData.data.name,
              webViewLink: fileMetaData.data.webViewLink,
              webContentLink: fileMetaData.data.webContentLink,
              time: Date.now(),
            }
          : obj
      );
      await db
        .collection("shared-data")
        .doc(senderEmail)
        .update({
          send: [...updatedSenderEmailData],
        });

      // * Broadcast to all sockets
      socketMain.emit("fileSent", receiverEmail);
    }

    // * Getting File Id and Updating it
    const senderEmailData = (await db.collection("shared-data").doc(senderEmail).get()).data().send;
    const receiverEmailData = (await db.collection("shared-data").doc(receiverEmail).get()).data().receive;

    // * Updating the File Id in the Database for the sender
    for (const senderObject of senderEmailData) {
      if (senderObject.id === "") {
        driveUpload(senderObject);
      } else if (senderObject.id !== "") {
        // * Deleting the file from the sender's drive
        await drive.files.delete({
          fileId: senderObject.id,
        });

        // * Uploading the file to the sender's drive and updating the file id
        driveUpload(senderObject);
      }
    }

    // // * Updating the File Id in the Database for the receiver
    // for (const receiverObject of receiverEmailData) {
    //   if (receiverObject.id === "") {
    //     receiverEmailData.push({

    //     })
    //     await db
    //       .collection("shared-data")
    //       .doc(receiverEmail)
    //       .update({
    //         receive: [{}],
    //       });
    //   } else if (receiverObject.id !== "") {
    //     // * Uploading the file to the sender's drive and updating the file id
    //     driveUpload(receiverObject);
    //   }
    // }
  } catch (error) {
    throw Error(error);
  }
}
