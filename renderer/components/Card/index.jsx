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
      // Set the new array
      setFiles([...files]);
    });
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
