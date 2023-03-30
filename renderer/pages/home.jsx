import Card from "../components/Card";
import Upload from "../components/Upload";
import Friends from "../components/Friends";
import { useEffect, useState } from "react";
import { modals } from "@mantine/modals";

export function Home() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "adad@vard.com",
    photoURL:
      "https://lh3.googleusercontent.com/a/AGNmyxbQGWVuZg8O4Z7eIK4Czpo8JgYmAy6NN1plupox=s96-c",
  });
  useEffect(() => {
    let blob = document.getElementsByClassName("blob");

    // If it exists, get the first element
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

  useEffect(() => {
    /*
    axios
      .get(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/me`)
      .then((res) => {
        const user = res.data;
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
      });
      */
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
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <a href="#" className="flex items-center pl-2.5 mb-5">
              <img
                src={
                  user
                    ? "https://lh3.googleusercontent.com/a/AGNmyxbQGWVuZg8O4Z7eIK4Czpo8JgYmAy6NN1plupox=s96-c"
                    : "https://lh3.googleusercontent.com/a/AGNmyxbQGWVuZg8O4Z7eIK4Czpo8JgYmAy6NN1plupox=s96-c"
                }
                className="h-6 mr-3 sm:h-7 rounded-full"
                alt="User Avatar"
              />
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                {user ? user.name : "John Doe"}
              </span>
            </a>
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
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    ></path>
                  </svg>
                  <span className="ml-3">Friends</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    ></path>
                  </svg>
                  <span className="flex-1 ml-3 whitespace-nowrap">
                    Contact Us
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
        <div className="p-4 sm:ml-64">
          <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
            <div className="grid grid-cols-2 mb-4 items-center">
              <form>
                <input
                  type="text"
                  id="first_name"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Hello World!"
                  required
                />
              </form>
              <a
                href="#"
                className="block w-30 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 justify-self-end"
              >
                <p
                  className="font-normal text-gray-700 dark:text-gray-400"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "A text that I copied from the internet"
                    );
                  }}
                >
                  Receive Text
                </p>
              </a>
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
