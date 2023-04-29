import { google } from "googleapis";
const { OAuth2 } = google.auth;

import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = "39362890659-k634d32h3mbk92koekgkb9cg65qt6j5s.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:8080/oauth2callback";

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export default oauth2Client;
