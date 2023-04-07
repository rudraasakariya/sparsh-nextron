import Card from "../components/Card";
import Upload from "../components/Upload";
import Friends from "../components/Friends";
import { useEffect, useState } from "react";
import { modals } from "@mantine/modals";
import axios from "axios";
import { Skeleton } from "@mantine/core";
import InputBox from "../components/InputBox";
import { IconFiles, IconHelp, IconFriends } from "@tabler/icons-react";
import SharedFiles from "../components/SharedFiles";

export function Home() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    profileURL: "",
  });

  useEffect(() => {
    let blob = document.getElementsByClassName("blob");

    // * If it exists, get the first element
    if (blob) blob = blob[0];

    window.onpointermove = (event) => {
      const { clientX, clientY } = event;

      if (!blob) blob = document.getElementsByClassName("blob");

      if (blob) blob = blob[0];

      blob?.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        { duration: 3000, fill: "forwards" }
      );
    };

    document.documentElement.classList.add("dark");
  }, []);

  // * Fetch user data
  useEffect(() => {
    axios
      .get(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/me`)
      .then((res) => {
        const user = res.data;
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
      });
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
      <div id="blur">
        <div className="blob"></div>
      </div>
      <div>
        <button
          data-drawer-target="logo-sidebar"
          data-drawer-toggle="logo-sidebar"
          aria-controls="logo-sidebar"
          type="button"
          className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            />
          </svg>
        </button>
        <aside
          id="logo-sidebar"
          className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 backdrop-filter backdrop-blur-sm bg-opacity-50 dark:bg-opacity-50 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
            <div className="flex items-center pl-2.5 mb-5 pointer-events-none">
              {user ? (
                <img
                  src={
                    user
                      ? user.profileURL
                      : "https://lh3.googleusercontent.com/a/AGNmyxbQGWVuZg8O4Z7eIK4Czpo8JgYmAy6NN1plupox=s96-c"
                  }
                  className="h-6 mr-3 sm:h-7 rounded-full"
                  alt="User Avatar"
                />
              ) : (
                <Skeleton height={40} width={40} />
              )}
              <span className="self-center text-xl font-semibold dark:text-white">
                {user ? user.name : <Skeleton height={20} width={90} ml={2} />}
              </span>
            </div>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  onClick={() => {
                    modals.open({
                      children: <Friends />,

                      overlayProps: {
                        opacity: 0.55,
                        blur: 3,
                      },

                      centered: true,
                    });
                  }}
                  href="#"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <IconFriends />
                  <span className="ml-3">Friends</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => {
                    modals.open({
                      children: <SharedFiles />,

                      overlayProps: {
                        opacity: 0.55,
                        blur: 3,
                      },

                      size: "xl",

                      centered: true,
                    });
                  }}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <IconFiles />
                  <span className="flex-1 ml-3 whitespace-nowrap">
                    Shared Files
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <IconHelp />
                  <span className="flex-1 ml-3 whitespace-nowrap">
                    Contact Us
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
        <div className="p-4 sm:ml-64">
          <div className="p-4">
            <div className="grid grid-cols-1 mb-4 items-center">
              <InputBox />
            </div>
            <Card />
            <div className="flex items-center justify-center h-65 mb-4 rounded">
              <Upload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
