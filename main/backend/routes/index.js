import { Router } from "express";
const routes = Router();

import * as GoogleAuth from "../googleAuth/googleAuth.js";
import * as SystemFileHandler from "../fileHandler/systemFileHandler.js";
import * as AppFileHandler from "../fileHandler/appFileHandler.js";
import * as ShareableFileHandler from "../shareableFileController/shareableFileController.js";
import * as FriendController from "../shareableFileController/friendController.js";
import CheckUser from "../middleware/CheckUser.js";

// * Routes to handle login and authentication
routes.get("/signup", GoogleAuth.authenticationUrl);
routes.get("/oauth2callback", GoogleAuth.oauth2Callback);

// * Routes to handle file upload
routes.get("/upload", CheckUser, SystemFileHandler.uploadFile);
routes.get("/download", CheckUser, SystemFileHandler.downloadFile);

// * Routes to handle frontend requests
routes.get("/get-files", CheckUser, AppFileHandler.getFiles);
routes.post("/drop-upload", CheckUser, AppFileHandler.uploadFile);

// * Routes to handle Shareable File requests
routes.get("/shareable-file", CheckUser, ShareableFileHandler.uploadFile);

// * Routes to handle Frineds
routes.post("/add-friend", CheckUser, FriendController.addFriend);
routes.get("/get-friends", CheckUser, FriendController.getFriends);

export default routes;
