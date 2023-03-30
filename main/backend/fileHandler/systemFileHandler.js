import { google } from "googleapis";

import oauth2Client from "../googleAuth/OAuth2Client.js";
import db from "../firebase/firebase.js";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exec } from "node:child_process";

import { io } from "socket.io-client";
const socketMain = io(`http://localhost:${process.env.PORT}`);
const socketRenderer = io(`http://localhost:${process.env.FRONTEND_PORT}`);
console.log(`http://localhost:${process.env.FRONTEND_PORT}`);

import { clipboard , ipcRenderer } from "electron";

import mime from "mime-types";

// * Getting the Email from the Socket.io Connection
let email = null;
socketMain.on("token", (token) => {
  email = token;
});

// * Downloading File from Google Drive
export async function downloadFile() {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  let maxTimeFile = null;
  // * Getting the file id from the database which was recently updated
  const data = await db.collection("user-data").doc(email).get();
  for (const key in data.data()) {
    const element = data.data()[key];
    if (element.id !== "" && element.time !== "") {
      let maxTime = Number.MIN_SAFE_INTEGER;

      // * Getting the File with the Maximum Time
      for (const key in data.data()) {
        if (data.data()[key].time && data.data()[key].time > maxTime) {
          maxTime = data.data()[key].time;
          maxTimeFile = key;
        }
      }
    }
  }

  const file = await drive.files.get(
    {
      fileId: data.data()[maxTimeFile].id,
      alt: "media",
      fields: "*",
    },
    { responseType: "arraybuffer" }
  );

  const fileMetaData = await drive.files.get(
    {
      fileId: data.data()[maxTimeFile].id,
      fields: "*",
    },
    { responseType: "json" }
  );

  // * Creating the File in the Temp Folder dynamically
  const normalFilePath = path.join(os.tmpdir(), fileMetaData.data.name).toString("ucs2");
  // TODO: Change the regex according to the OS
  const filePath = path.toNamespacedPath(normalFilePath).replace("\\\\?\\", "");
  // * Creating the File in the Temp Folder
  try {
    fs.writeFile(filePath, Buffer.from(file.data), (err) => {
      if (!err) {
        exec("powershell.exe (scb -LiteralPath " + "'" + filePath + "'" + ")", (err) => {
          if (!err) {
            console.log(filePath);
            // ? Can't delte file because pasting requires instance of the file
            // // * Deleting the File from the Temp Folder
            // fs.unlink(filePath, (err) => {
            //   if (err) {
            //     console.error(err);
            //     return;
            //   }
            //   console.log(`File ${filePath} deleted successfully!`);
            // });
          }
        });
      } else {
        console.error(err);
        return;
      }
    });
  } catch (err) {
    console.log(err);
  }
}

// * Uploading Data to Google Drive
export async function uploadFile() {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // TODO: Change the regex according to the OS
  const filePath = clipboard.readBuffer("FileNameW").toString("ucs2").replace(/\0/g, "");
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
    async function driveUpload(key) {
      // * Creating File in Google Drive
      const file = await drive.files.create({
        requestBody,
        media: media,
      });
      // * Updating the File Id in the Database
      await db
        .collection("user-data")
        .doc(email)
        .update({
          [key]: {
            id: await file.data.id,
            time: Date.now(),
          },
        });

      // Broadcast to all sockets
      socketMain.emit("fileUploaded", {
        ...file.data,
      });
    }

    // * Getting File Id and Updating it
    const data = await db.collection("user-data").doc(email).get();
    for (const fileObject in data.data()) {
      // * Checking if the key is not text and if the value is empty
      if (data.data().hasOwnProperty(fileObject) && fileObject !== "text") {
        // * Getting the value of the key
        const element = data.data()[fileObject];
        if (element.id === "" && element.time === "") {
          // * Uploading File to Google Drive
          await driveUpload(fileObject);
          console.log("Uploading File to Google Drive as the File Id is Empty");
          break;
        } else if (element.id !== "" && element.time !== "") {
          let minTimeFile = null;
          let minTime = Number.MAX_SAFE_INTEGER;

          // * Getting the File with the Minimum Time
          for (const key in data.data()) {
            if (data.data()[key].time && data.data()[key].time < minTime) {
              minTime = data.data()[key].time;
              minTimeFile = key;
            }
          }

          // * Deleting the Old File from Google Drive
          await drive.files.delete({
            fileId: data.data()[minTimeFile].id,
          });
          // * Updating the Old File to New File
          await driveUpload(minTimeFile);

          // * Updating the File Id in the Database and Setting the Text to Empty
          // await db
          //   .collection("user-data")
          //   .doc(email)
          //   .update({
          //     [key]: "",
          //   });
          break;
        }
      }

      // * This is for the Text File
      // * Checking if the Key is Text
      //   if (key === "text") {
      //     console.log("Uploading Text to Google Drive as the File Id is Empty");
      //     await db.collection("user-data").doc(email).update({
      // TODO: Change this to the Text from the File
      // [key]: await file.data.id,Z
      //     });
      //     break;
      //   }
    }
    console.log("Uploaded Successfully!");
  } catch (error) {
    throw Error(error);
  }
}
