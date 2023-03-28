import { contextBridge, shell } from "electron";

contextBridge.exposeInMainWorld("shell", {
  openDownloadLink: (webContenLink) => {
    shell.openExternal(webContenLink);
  },
});
