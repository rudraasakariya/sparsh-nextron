import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

function Card() {
  const [files, setFiles] = useState([]);
  const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT || 8080}`);

  // * Use effect to get files from server
  useEffect(() => {
    axios
      .get(`http://localhost:${process.env.NEXT_PUBLIC_PORT || 8080}/get-files`, {
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

  // useEffect(() => {
    socket.on("file-uploaded", () => {
      axios
        .get(`http://localhost:${process.env.NEXT_PUBLIC_PORT || 8080}/get-files`, {
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
    // });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl  px-1 sm:py-4 sm:px-3 lg:max-w-7xl lg:px-8">
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-3">
        {files.map((file, key) => (
          <div
            className="card"
            id={key}
            onClick={() => {
              window.shell.openDownloadLink(file.webContentLink);
              // window.open(file.webContentLink);
            }}
          >
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Card;
