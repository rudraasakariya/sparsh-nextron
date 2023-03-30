import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { io } from "socket.io-client";
import axios from "axios";

function Card() {
  const [files, setFiles] = useState([]);
  const socket = io(`http://localhost:${process.env.PORT || 8080}`);

  // * Use effect to get files from server
  useEffect(() => {
    axios
      .get(`http://localhost:${process.env.PORT || 8080}/get-files`, {
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

  // * Use socket to get files from server
  useEffect(() => {
    socket.on("fileUploaded", (data) => {
      // Remove the first element of the array
      files.shift();
      // Add the new file to the array
      files.push(data);
      console.log(data);
      // Set the new array
      setFiles([...files]);
    });
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

export default Card;
