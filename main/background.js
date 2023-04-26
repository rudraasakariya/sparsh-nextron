// * Importing Native Node Modules
import path from "path";

// * Importing server modules
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// * Importing Electron Modules
import { app, globalShortcut, shell, ipcMain, Notification } from "electron";
import Store from "electron-store";
import clipboardListener from "clipboard-event";
import extendedClipboard from "electron-clipboard-extended";
import serve from "electron-serve";
import { createWindow } from "./helpers";

// * Importing Backend Modules
import * as GoogleAuth from "./backend/googleAuthController/googleAuthController";
import * as AppFileController from "./backend/fileController/appFileController";
import * as ShareableFileController from "./backend/shareableFileController/shareableFileController";
import * as FriendController from "./backend/friendController/friendController";
import * as AppTextController from "./backend/appTextController/appTextController";
import * as SystemFileHandler from "./backend/fileController/systemFileController";
import * as SystemTextController from "./backend/appTextController/systemTextController";
import * as UserController from "./backend/userController/userController";
import oauth2Client from "./backend/googleAuthController/OAuth2Client";
import CheckUser from "./backend/middleware/CheckUser";

const appexpress = express();
appexpress.use(express.json());

appexpress.get("/signup", GoogleAuth.authenticationUrl);

appexpress.get("/oauth2callback", GoogleAuth.oauth2Callback);

appexpress.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`);
});

// * Creating a Store
const store = new Store({
  name: "sparsh-user-data",
});
// * Checking if the token exists and setting credentials
let token = store.get("user-token");

if (token) {
  oauth2Client.setCredentials(token);
}

// * Listening for the `authenticated` event
ipcMain.on("authenticated", (userToken) => {
  store.set("user-token", userToken);
  token = userToken;
  oauth2Client.setCredentials(userToken);
  startApp();
});

ipcMain.on("file-downloaded", (data) => {
  const downloadNotification = Notification({
    title: "File Synced",
    body: `${data} has been synced`,
    icon: "./resources/icon.png",
    silent: true,
    subtitle: "SPARSH",
    urgency: "normal",
  });
  // * Showing the download notification
  downloadNotification.show();
});

ipcMain.on("file-uploaded", (data) => {
  const downloadNotification = Notification({
    title: "File Synced",
    body: `${data} has been synced`,
    icon: "./resources/icon.png",
    silent: true,
    subtitle: "SPARSH",
    urgency: "normal",
  });
  // * Showing the download notification
  downloadNotification.show();
});

ipcMain.on("fileSent", (data) => {
  const sendNotification = Notification({
    title: "File Sent Successfuly",
    body: `${data.name} has been sent to ${data.email}`,
    icon: "./resources/icon.png",
    silent: true,
    urgency: "normal",
    timeoutType: "default",
  });
  // * Showing the send notification
  sendNotification.show();
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

  ipcMain.on("file-uploaded", () => {
    mainWindow.webContents.send("file-uploaded");
  });
}

async function startAuth() {
  shell.openExternal(`http://localhost:${process.env.PORT || 5000}/signup`);
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
      SystemFileHandler.uploadFile(token);
      store.set("isListening", false);
    }
  });

  globalShortcut.register("CommandOrControl+D", () => {
    console.log("e");
    SystemFileHandler.downloadFile(token.email);
  });

  globalShortcut.register("CommandOrControl+T", () => {
    console.log("h");
    SystemTextController.getText(token.email);
  });

  // * Detects changes when a text is copied
  extendedClipboard.on("text-changed", () => {
    const clipboardText = extendedClipboard.readText();
    SystemTextController.updateText(clipboardText, token.email);
  });
})();

// * Opens the link in the default browser and downloads the file for user
ipcMain.on("downloadLink", (event, args) => {
  shell.openExternal(args);
});

ipcMain.handle("get-user-details", async (event) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const user = await UserController.getUserInfo(token.email);
  return user;
});

ipcMain.handle("add-friend", async (event, email) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  // * Passing user email ID and friend email ID
  await FriendController.addFriend(token.email, email);
});

ipcMain.handle("get-files", async (event) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const files = await AppFileController.getFiles(token.email);
  return files;
});

ipcMain.handle("get-friends", async (event) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const friends = await FriendController.getFriends(token.email);
  return friends;
});

ipcMain.handle("get-shareable-files", async (event) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const files = await ShareableFileController.getFiles(token.email);
  return files;
});

ipcMain.handle("drop-upload", async (event, path) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const files = await AppFileController.uploadFile(path, token.email);
  return files;
});

ipcMain.handle("share-file", async (event, ...args) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const files = await ShareableFileController.uploadFile(args[0], args[1], token.email);
  return files;
});

ipcMain.handle("get-text", async (event) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const text = await AppTextController.getText(token.email);
  return text;
});

ipcMain.handle("upload-text", async (event, updateText) => {
  const checkUser = await CheckUser(token);
  if (checkUser === "error") {
    return "error";
  }
  const text = await AppTextController.uploadText(updateText, token.email);
  return text;
});

app.on("window-all-closed", () => {
  app.quit();
});
