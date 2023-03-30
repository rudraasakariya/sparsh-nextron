import "../styles/globals.css"
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

export default function App(props) {
  const { Component, pageProps } = props;

  
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        /** Put your mantine theme override here */
        colorScheme: "dark",
      }}
    >
      <ModalsProvider>
        <Notifications />
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}
