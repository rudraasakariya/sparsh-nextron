import { google } from "googleapis";

import db from "../firebase/firebase.js";

import oauth2Client from "../googleAuth/OAuth2Client.js";

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

      // * Broadcast to all sockets
      socketMain.emit("fileSent", receiverEmail);
    }

    // * Getting File Id and Updating it
    let senderData = await db.collection("shared-data").doc(senderEmail).get();
    let receiverData = await db.collection("shared-data").doc(receiverEmail).get();

    senderData = await senderData.data().send;
    receiverData = await receiverData.data().receive;

    for (const key in senderData) {
      const element = senderData[key];
      if (element.id === "") {
        // * Updating the Old File to New File
        await driveUpload();
        senderData[key] = {
          id: file.data.id,
          name: fileMetaData.data.name,
          webContenLink: fileMetaData.data.webContentLink,
          webViewLink: fileMetaData.data.webViewLink,
          time: Date.now(),
          to: receiverEmail,
        };
      } else if (element.id !== "") {
        await driveUpload();
        let minTimeFile = null;
        let minTime = Number.MAX_SAFE_INTEGER;

        // * Getting the File with the Minimum Time
        for (const key in senderData) {
          if (senderData[key].time && senderData[key].time < minTime) {
            minTime = senderData[key].time;
            minTimeFile = key;
          }
        }

        // * Deleting the Old File from Google Drive
        await drive.files.delete({
          fileId: senderData[minTimeFile].id,
        });
      }
      break;
    }

    // // * Checking if the File Id is Empty
    // for (let i = 0; i < 3; i++) {
    //   if (senderData.data()[i].send.id === "" && senderData.data()[i].send.time === "") {
    //     // * Updating the File Id in the Database of sender
    //     await db
    //       .collection("shared-data")
    //       .doc(senderEmail)
    //       .update({
    //         [i]: {
    //           send: {
    //             to: receiverEmail,
    //             id: file.data.id,
    //             name: fileMetaData.data.name,
    //             webContenLink: fileMetaData.data.webContentLink,
    //             webViewLink: fileMetaData.data.webViewLink,
    //             time: date,
    //           },
    //         },
    //       });
    //     break;
    //   } else if (senderData.data()[i].send.id !== "" && senderData.data()[i].send.time !== "") {
    //     let minTimeFile = null;
    //     let minTime = Number.MAX_SAFE_INTEGER;

    //     // * Getting the File with the Minimum Time
    //     for (const key in senderData.data()) {
    //       if (senderData.data()[key].time && senderData.data()[key].time < minTime) {
    //         minTime = senderData.data()[key].time;
    //         minTimeFile = key;
    //       }
    //     }

    //     // * Deleting the Old File from Google Drive
    //     await drive.files.delete({
    //       fileId: senderData.data()[minTimeFile].id,
    //     });
    //     // * Updating the Old File to New File
    //     await driveUpload(minTimeFile);
    //   }
    // }

    // if (senderData.data()[0].send.id === "" && senderData.data()[0].send.time === "") {
    //   // * Updating the File Id in the Database of sender
    //   await db
    //     .collection("shared-data")
    //     .doc(senderEmail)
    //     .update({
    //       send: {
    //         to: receiverEmail,
    //         id: file.data.id,
    //         name: fileMetaData.data.name,
    //         webContenLink: fileMetaData.data.webContentLink,
    //         webViewLink: fileMetaData.data.webViewLink,
    //         time: date,
    //       },
    //     });
    // } else if (senderData.data().send.id !== "" && senderData.data().send.time !== "") {
    //   let minTimeFile = null;
    //   let minTime = Number.MAX_SAFE_INTEGER;

    //   // * Getting the File with the Minimum Time
    //   for (const key in senderData.data()) {
    //     if (senderData.data()[key].time && senderData.data()[key].time < minTime) {
    //       minTime = senderData.data()[key].time;
    //       minTimeFile = key;
    //     }
    //   }

    //   // * Deleting the Old File from Google Drive
    //   await drive.files.delete({
    //     fileId: senderData.data()[minTimeFile].id,
    //   });
    //   // * Updating the Old File to New File
    //   await driveUpload(minTimeFile);
    // }

    // if (receiverData.data().receive.id === "" && receiverData.data().receive.time === "") {
    //   // * Updating the File Id in the Database of receiver
    //   await db
    //     .collection("shared-data")
    //     .doc(receiverEmail)
    //     .update({
    //       receive: {
    //         from: senderEmail,
    //         id: file.data.id,
    //         name: fileMetaData.data.name,
    //         webContenLink: fileMetaData.data.webContentLink,
    //         webViewLink: fileMetaData.data.webViewLink,
    //         time: date,
    //       },
    //     });
    // } else if (receiverData.data().receive.id !== "" && receiverData.data().receive.time !== "") {
    //   let minTimeFile = null;
    //   let minTime = Number.MAX_SAFE_INTEGER;

    //   // * Getting the File with the Minimum Time
    //   for (const key in receiverData.data()) {
    //     if (receiverData.data()[key].time && receiverData.data()[key].time < minTime) {
    //       minTime = receiverData.data()[key].time;
    //       minTimeFile = key;
    //     }
    //   }
    //   await db
    //     .collection("shared-data")
    //     .doc(receiverEmail)
    //     .update({
    //       receive: {
    //         from: senderEmail,
    //         id: file.data.id,
    //         name: fileMetaData.data.name,
    //         webContenLink: fileMetaData.data.webContentLink,
    //         webViewLink: fileMetaData.data.webViewLink,
    //         time: date,
    //       },
    //     });
    // }

    //   for (const fileObject in data.data()) {
    //     // * Checking if the key is not text and if the value is empty
    //     if (fileObject !== "text") {
    //       // * Getting the value of the key
    //       const element = data.data()[fileObject];
    //       if (element.id === "" && element.time === "") {
    //         // * Uploading File to Google Drive
    //         await driveUpload(fileObject);
    //         console.log("Uploading File to Google Drive as the File Id is Empty");
    //         break;
    //       } else if (element.id !== "" && element.time !== "") {
    //         let minTimeFile = null;
    //         let minTime = Number.MAX_SAFE_INTEGER;

    //         // * Getting the File with the Minimum Time
    //         for (const key in data.data()) {
    //           if (data.data()[key].time && data.data()[key].time < minTime) {
    //             minTime = data.data()[key].time;
    //             minTimeFile = key;
    //           }
    //         }

    //         // * Deleting the Old File from Google Drive
    //         await drive.files.delete({
    //           fileId: data.data()[minTimeFile].id,
    //         });
    //         // * Updating the Old File to New File
    //         await driveUpload(minTimeFile);

    //         break;
    //       }
    //     }

    //     // * This is for the Text File
    //     // * Checking if the Key is Text
    //     //   if (key === "text") {
    //     //     console.log("Uploading Text to Google Drive as the File Id is Empty");
    //     //     await db.collection("shared-data").doc(email).update({
    //     // TODO: Change this to the Text from the File
    //     // [key]: await file.data.id,Z
    //     //     });
    //     //     break;
    //     //   }
    //   }
    //   console.log("Uploaded Successfully!");
  } catch (error) {
    throw Error(error);
  }
}
