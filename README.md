# Sparsh

Sparsh is a desktop application built with [Nextron](https://github.com/saltyshiomix/nextron) that combines Electron and Next.js. The app focuses on quick file and text sharing using Google Drive. Authentication uses Google OAuth, and a clipboard watcher keeps files in sync.

## Features

- **Google OAuth sign‑in** – authenticate with your Google account to connect to Drive and store user data.
- **File sharing** – upload files to Google Drive, generate shareable links and send files to friends in real‑time.
- **Clipboard monitoring** – watch the system clipboard for copied files or text and automatically sync them through the app.

## Workflow

1. Launch the app and sign in using your Google account.
2. Copy a file or text to the clipboard. The watcher uploads the file to Google Drive and updates your account.
3. View recently uploaded files in the app and share them with friends.

## Environment Variables

Create a `.env` file in the project root and set the following variables:

| Variable | Description |
|----------|-------------|
| `CLIENT_ID` | Google OAuth client ID. |
| `CLIENT_SECRET` | Google OAuth client secret. |
| `REDIRECT_URI` | OAuth callback URL configured in Google Cloud. |
| `PORT` | Port for the Express/Socket.IO backend. Defaults to `8080`. |
| `NEXT_PUBLIC_PORT` | Port for the Next.js renderer (used by Axios). |

## Development

Install dependencies and start the app in development mode:

```bash
yarn
yarn dev
```

## Production Build

Build executables for the current platform:

```bash
yarn build
```

Additional targets are available:

```bash
yarn build:win32   # 32‑bit Windows
yarn build:win64   # 64‑bit Windows
yarn build:mac     # macOS
yarn build:linux   # Linux
```

## Screenshots

Screenshots illustrating authentication and file sharing workflows can be added here when available.

