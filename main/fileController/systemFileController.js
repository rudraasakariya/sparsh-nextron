import { google } from "googleapis";

import oauth2Client from "../googleAuthController/OAuth2Client.js";
import db from "../firebase/firebase.js";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exec } from "node:child_process";

import { io } from "socket.io-client";
const socketMain = io(`http://localhost:${process.env.PORT}`);

import { clipboard, ipcMain } from "electron";

import mime from "mime-types";

// * Getting the Email from the Socket.io Connection
let email = null;
socketMain.on("token", (token) => {
  email = token;
});

// * Downloading File from Google Drive
export async function downloadFile(email) {
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

  // * Regex for macOS and Linux
  // const filePath = path.join(os.tmpdir(), fileMetaData.data.name);
  // const normalizedFilePath = path.normalize(filePath);
  // const cleanedFilePath = normalizedFilePath.replace(/^(\.\.[\/\\])+/, '');

  // * Creating the File in the Temp Folder
  try {
    fs.writeFile(filePath, Buffer.from(file.data), (err) => {
      if (!err) {
        exec("powershell.exe (scb -LiteralPath " + "'" + filePath + "'" + ")", (err) => {
          if (!err) {
            socketMain.emit("fileDownloaded", fileMetaData.data.name);
          }
        });
      } else {
        
        return err;
      }
    });
  } catch (err) {
    return err;
  }
}

// * Uploading Data to Google Drive
export async function uploadFile(token) {
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
        .doc(token.email)
        .update({
          [key]: {
            id: await file.data.id,
            time: Date.now(),
          },
        });

      // Broadcast to all sockets
      ipcMain.emit("file-uploaded", {
        ...file.data,
      });
    }

    // * Getting File Id and Updating it
    const data = await db.collection("user-data").doc(token.email).get();
    for (const fileObject in data.data()) {
      // * Checking if the key is not text and if the value is empty
      if (fileObject !== "text") {
        // * Getting the value of the key
        const element = data.data()[fileObject];
        if (element.id === "" && element.time === "") {
          // * Uploading File to Google Drive
          await driveUpload(fileObject);
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
          break;
        }
      }
    }
    return "File Uploaded Successfully!"
  } catch (error) {
    throw Error(error);
  }
}
