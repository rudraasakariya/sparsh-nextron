import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import axios from "axios";

function Card() {
  const [files, setFiles] = useState([]);
  // * Use effect to get files from server
  useEffect(() => {
    ipcRenderer.invoke("get-files").then((res) => {
      setFiles(res);
    }).catch((err) => {
      console.log(err);
    });

    return () => {
      ipcRenderer.removeAllListeners("get-files");
    };
  }, []);

  // * Use socket to get files from server
  useEffect(() => {
    ipcRenderer.on("file-uploaded", (data) => {
      ipcRenderer.invoke("get-files").then((res) => {
        setFiles(res);
      });
    });

    return () => {
      ipcRenderer.removeAllListeners("file-uploaded");
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {files.map((file, index) => (
        <div
          className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card"
          key={index}
          onClick={() => {
            ipcRenderer.send("downloadLink", file.webContentLink);
          }}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}

export default Card;
