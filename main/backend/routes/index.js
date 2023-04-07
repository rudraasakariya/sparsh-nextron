import { Router } from "express";
const routes = Router();

import * as GoogleAuth from "../googleAuthController/googleAuthController";
import * as SystemFileController from "../fileController/systemFileController"
import * as AppFileController from "../fileController/appFileController";
import * as ShareableFileController from "../shareableFileController/shareableFileController";
import * as FriendController from "../friendController/friendController";
import * as UserController from "../userController/userController";
import CheckUser from "../middleware/CheckUser";

// * Routes to handle login and authentication
routes.get("/signup", GoogleAuth.authenticationUrl);
routes.get("/oauth2callback", GoogleAuth.oauth2Callback);

// * Routes to handle file upload
routes.get("/upload", CheckUser, SystemFileController.uploadFile);
routes.get("/download", CheckUser, SystemFileController.downloadFile);

// * Routes to handle frontend requests
routes.get("/get-files", CheckUser, AppFileController.getFiles);
routes.post("/drop-upload", CheckUser, AppFileController.uploadFile);

// * Routes to handle Shareable File requests
routes.post("/shareable-file", CheckUser, ShareableFileController.uploadFile);

// * Routes to handle Frineds
routes.post("/add-friend", CheckUser, FriendController.addFriend);
routes.get("/get-friends", CheckUser, FriendController.getFriends);

routes.get("/me", CheckUser, UserController.getUserInfo);

export default routes;
