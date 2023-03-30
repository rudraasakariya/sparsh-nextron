import Card from "../components/Card";
import Upload from "../components/Upload";
import { useEffect } from "react";

export function Home() {
  useEffect(() => {
    let blob = document.getElementById("blob");

    window.onpointermove = (event) => {
      const { clientX, clientY } = event;

      if (!blob) blob = document.getElementById("blob");

      blob?.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        { duration: 3000, fill: "forwards" }
      );
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div id="blur"></div>
      <div id="blob"></div>
      <div className="myContainer">
        <main>
          <Card />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              width: "100%",
            }}
          >
            <Upload />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
