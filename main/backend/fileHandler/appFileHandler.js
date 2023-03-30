import { google } from "googleapis";
import oauth2Client from "../googleAuth/OAuth2Client.js";
import db from "../firebase/firebase.js";



// * Getting Files from Google Drive and Sending to the Frontend
export async function getFiles(req, res) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  // * Fetching ID from Database
  const file_ID = await db.collection("user-data").doc(req.email).get();

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

        // files.push({
        //   id: element.id,
        //   name: "",
        //   webContentLink: "",
        //   webViewLink: "",
        //   time: element.time,
        // });
      } else if (element.id === "" && element.time === "") {
        break;
      }
    }
  }

  // * Get File name from Google Drive using File ID and Sending to the Frontend
  // files.map(async (file) => {
  //   // console.log(driveFileData);
  //   for (const driveKey in driveFileData) {
  //     if (file.hasOwnProperty(driveKey)) {
  //       console.log(driveFileData.data[driveKey]);
  //     }
  //   }
  //   // file.name = driveFileData.data.name;
  //   // file.webContentLink = driveFileData.data.webContentLink;
  //   // file.webViewLink = driveFileData.data.webViewLink;
  //   // console.log(file);
  // });

  res.send(files);
}
