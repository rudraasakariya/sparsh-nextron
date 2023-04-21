import { Router } from "express";
const routes = Router();

import * as GoogleAuth from "../googleAuthController/googleAuthController";
import * as AppFileController from "../fileController/appFileController";
import * as ShareableFileController from "../shareableFileController/shareableFileController";
import * as FriendController from "../friendController/friendController";
import * as UserController from "../userController/userController";
import * as AppTextController from "../appTextController/appTextController";
import CheckUser from "../middleware/CheckUser";

// * Routes to handle login and authentication
routes.get("/signup", GoogleAuth.authenticationUrl);
routes.get("/oauth2callback", GoogleAuth.oauth2Callback);

// * Routes to handle frontend file requests
routes.get("/get-files", CheckUser, AppFileController.getFiles);
routes.post("/drop-upload", CheckUser, AppFileController.uploadFile);

// * Routes to handle frontend text requests
routes.post("/text-upload", CheckUser, AppTextController.uploadText);
routes.get("/get-text", CheckUser, AppTextController.getText);

// * Routes to handle Shareable File requests
routes.post("/shareable-file", CheckUser, ShareableFileController.uploadFile);
routes.get("/get-shareable-files", CheckUser, ShareableFileController.getFiles);

// * Routes to handle Frineds
routes.post("/add-friend", CheckUser, FriendController.addFriend);
routes.get("/get-friends", CheckUser, FriendController.getFriends);

routes.get("/me", CheckUser, UserController.getUserInfo);

export default routes;
