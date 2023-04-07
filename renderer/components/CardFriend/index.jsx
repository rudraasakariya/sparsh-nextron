import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import axios from "axios";

function CardFriend() {
  const [files, setFiles] = useState([]);

  // * Use effect to get files from server
  useEffect(() => {
    axios
      .get(`http://localhost:${process.env.PORT || 8080}/shared-file-history`, {
        headers: {
          "Content-Type": "application/json",
          // *CORS
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        },
      })
      .then((res) => {
        setFiles(res.data);
      })
      .catch(() => {
        console.error("Error getting files from server");
      });

    return () => {};
  }, []);


  // ipcMain.on("fileUploaded", (x) => {
  //   console.log(x, 2);
  // });

  // useEffect(() => {
  // axios
  //   .get(`http://localhost:${process.env.NEXT_PUBLIC_PORT || 8080}/get-files`, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       // *CORS
  //       "Access-Control-Allow-Origin": "*",
  //       "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  //     },
  //   })
  //   .then((res) => {
  //     setFiles(res.data);
  //   })
  //   .catch(() => {
  //     console.error("Error getting files from server");
  //   });

  // });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {files.map((file, index) => (
        <div
          className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card"
          key={index}
          onClick={() => {
            ipcRenderer.send("downloadLink", file.webContentLink);
            // window.open(file.webContentLink);
          }}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}

export default CardFriend;
