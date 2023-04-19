// * Importing Native Node Modules
import path from "path";

// * Importing server modules
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// * Importing Electron Modules
import { app, globalShortcut, shell, ipcMain, Notification } from "electron";
import Store from "electron-store";
import clipboardListener from "clipboard-event";
import extendedClipboard from "electron-clipboard-extended";
import serve from "electron-serve";
import { createWindow } from "./helpers";

// * Importing Backend Modules
import * as SystemFileHandler from "./fileController/systemFileController";
import * as SystemTextController from "./appTextController/systemTextController";
import routes from "./routes/index.js";
import oauth2Client from "./googleAuthController/OAuth2Client";

import { initializeUser } from "./middleware/CheckUser";

// // Temp
// import { google } from "googleapis";

// import db from "./firebase/firebase.js";

// import fs from "node:fs";
// import path from "node:path";

// import { io } from "socket.io-client";
// const socketMain = io(`http://localhost:${process.env.PORT}`);

// import { clipboard, Notification } from "electron";

// import mime from "mime-types";

const appexpress = express();
appexpress.use(express.json());
// * Configuring CORS (so annoying fr)
appexpress.use(
  cors({
    origin: `http://localhost:${process.argv[2] || 8888}`,
    methods: ["GET", "POST"],
  })
);
// * Configuring Express to use the Routes Module
appexpress.use(routes);

// * Creating a Store
const store = new Store({
  name: "sparsh-user-data"
});
// * Checking if the token exists and setting credentials
const token = store.get("user-token");

// * Configuring Socket.io
const server = http.createServer(appexpress);
const io = new Server(server, {
  cors: {
    origin: `http://localhost:${process.argv[2] || 8888}`,
    methods: ["GET", "POST"],
  },
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`);
});

initializeUser();
SystemTextController.initializeSocket();

// * Listening for the connection event
io.on("connection", (socket) => {
  // * Listening for the `token` event
  if (token) {
    oauth2Client.setCredentials(token);
    socket.emit("token", token.email);
  }

  // * Listening for the `authenticated` event
  socket.on("authenticated", (userToken) => {
    store.set("user-token", userToken);
    oauth2Client.setCredentials(userToken);
    io.emit("token", userToken.email);
    startApp();
  });

  socket.on("fileUploaded", (data) => {
    // Broadcast to all connected clients
    io.emit("fileUploaded", data);
  });
  socket.on("fileDownloaded", (data) => {
    const downloadNotification = new Notification({
      title: "File Synced",
      body: `${data} has been synced`,
      icon: path.join(__dirname, "resources", "icon.png"),
      silent: true,
      urgency: "normal",
    });
    // * Showing the download notification
    downloadNotification.show();
  });
  socket.on("fileSent", (data) => {
    const sendNotification = new Notification({
      title: "File Shared Successfuly",
      body: `${data.name} has been sent to ${data.email}`,
      icon: "../resources/icon.png",
      silent: true,
      urgency: "normal",
    });
    // * Showing the send notification
    sendNotification.show();
  });
});

// * Configuring Electron Window
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

async function startApp() {
  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // Remove the top menu bar
    // mainWindow.removeMenu();
    // mainWindow.webContents.openDevTools();
  }
}

async function startAuth() {
  shell.openExternal(`http://localhost:${process.env.PORT}/signup`);
}

(async function () {
  await app.whenReady();

  // * Checking if the user has an existing token
  token ? startApp() : startAuth();

  // * Start listening for Clipboard changes
  clipboardListener.startListening();
  // * Start watching for Clipboard Text changes
  extendedClipboard.startWatching();

  // * Registering global shortcuts
  globalShortcut.register("CommandOrControl+U", () => {
    store.get("isListening") ? store.set("isListening", false) : store.set("isListening", true);
  });

  clipboardListener.on("change", async () => {
    if (store.get("isListening")) {
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
          if (fileObject !== "text") {
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
              break;
            }
          }
        }
        console.log("Uploaded Successfully!");
      } catch (error) {
        throw Error(error);
      }
      store.set("isListening", false);
    }
  });

  globalShortcut.register("CommandOrControl+D", SystemFileHandler.downloadFile);
  globalShortcut.register("CommandOrControl+T", SystemTextController.getText);

  // * Detects changes when a text is copied
  extendedClipboard.on("text-changed", () => {
    const clipboardText = extendedClipboard.readText();
    SystemTextController.updateText(clipboardText);
  });
})();

// * Opens the link in the default browser and downloads the file for user
ipcMain.on("downloadLink", (event, args) => {
  shell.openExternal(args);
});

app.on("window-all-closed", () => {
  app.quit();
});
