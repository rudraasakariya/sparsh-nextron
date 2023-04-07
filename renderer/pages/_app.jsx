import "../styles/globals.css"
import { MantineProvider, createEmotionCache } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

const myCache = createEmotionCache({ key: "mantine" });

export default function App(props) {
  const { Component, pageProps } = props;
  
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={myCache}
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
