import { google } from "googleapis";
import oauth2Client from "../googleAuthController/OAuth2Client.js";
import db from "../firebase/firebase.js";
import mime from "mime-types";
import fs from "node:fs";
import { ipcMain } from "electron";

// * Getting Files from Google Drive and Sending to the Frontend
export async function getFiles(email) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // * Fetching ID from Database
  const file_ID = await db
    .collection("user-data")
    .doc(email)
    .get();

  const files = [];

  for (const fileObject in file_ID.data()) {
    // * Checking if the key is not text and if the value is empty
    if (file_ID.data().hasOwnProperty(fileObject) && fileObject !== "text") {
      // * Getting the value of the key
      const element = file_ID.data()[fileObject];
      if (element.id !== "" && element.time !== "") {
        // * Setting All File Attributes in `files` Array

        const driveFileData = await drive.files.get(
          {
            fileId: element.id,
            fields: "name,webContentLink,webViewLink",
          },
          { responseType: "json" }
        );

        files.push({
          id: element.id,
          name: driveFileData.data.name,
          webContentLink: driveFileData.data.webContentLink,
          webViewLink: driveFileData.data.webViewLink,
          time: element.time,
        });
      } else if (element.id === "" && element.time === "") {
        continue;
      }
    }
  }
  return files;
}

// * Uploading Files to Google Drive and Saving File ID to Database
export async function uploadFile(filePath, email) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // TODO: Change the regex according to the OS
  // * String Manipulation to get the File Name and File Type
  let fileName = filePath.split("\\").pop();
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
    // * Uploading File to Google Drive
    async function driveUpload(key) {
      // * Creating File in Google Drive
      const file = await drive.files.create({
        requestBody,
        media: media,
      });

      const fileMetaData = await drive.files.get(
        {
          fileId: await file.data.id,
          fields: "*",
        },
        { responseType: "json" }
      );

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
    }

    // * Getting File Id and Updating it
    const data = await db.collection("user-data").doc(email).get();
    // * Checking if the User Exists in the Database
    if (data.exists) {
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
    } else {
      return "User Does Not Exist";
    }

    ipcMain.emit("file-uploaded");
    return "File Uploaded Successfully";
  } catch (error) {
    return error;
  }
}
