// * Importing Native Node Modules
import path from "path";

// * Importing server modules
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// * Importing Electron Modules
import { app, globalShortcut, shell, ipcMain } from "electron";
import Store from "electron-store";
import clipboardListener from "clipboard-event";
import serve from "electron-serve";
import { createWindow } from "./helpers";

// * Importing Backend Modules
import * as SystemFileHandler from "../main/backend/fileHandler/systemFileHandler";
import routes from "./backend/routes/index.js";
import oauth2Client from "./backend/googleAuth/OAuth2Client";

import { initializeUser } from "./backend/middleware/CheckUser";

const appexpress = express();
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
const store = new Store();
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

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`);
});

initializeUser();

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
    socket.emit("token", userToken.email);
    startApp();
  });

  socket.on("fileUploaded", () => {
    // Broadcast to all connected clients
    io.emit("fileUploaded");
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
    mainWindow.removeMenu();
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

  // * Registering global shortcuts
  globalShortcut.register("CommandOrControl+U", () => {
    store.get("isListening") ? store.set("isListening", false) : store.set("isListening", true);
  });

  clipboardListener.on("change", () => {
    if (store.get("isListening")) {
      SystemFileHandler.uploadFile();
      store.set("isListening", false);
    }
  });

  globalShortcut.register("CommandOrControl+D", SystemFileHandler.downloadFile);
})();


// * Opens the link in the default browser and downloads the file for user
ipcMain.on("downloadLink", (event, args) => {
  shell.openExternal(args);
});

app.on("window-all-closed", () => {
  app.quit();
});
