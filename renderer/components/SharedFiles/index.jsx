import {
  Divider,
  Text,
  createStyles,
  Card,
  Group,
  Avatar,
} from "@mantine/core";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import { ipcRenderer } from "electron";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },
}));

export default function SharedFiles() {
    const { classes } = useStyles();
    const [files, setFiles] = useState({
      sent: [],
      received: [],
    });

    useEffect(() => {
      axios.get("/get-shareable-files")
        .then((res) => {
          setFiles(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, []);

    return (
      <>
        <Text size="xl" weight={500} mb={15}>
          Sent Files:
        </Text>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {files.sent.map((file) => {
            return (
              <Card
                withBorder
                padding="lg"
                radius="md"
                className={classes.card}
              >
                <div
                  className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card"
                  onClick={() => {
                    ipcRenderer.send("downloadLink", file.webContentLink);
                  }}
                >
                  {file.name}
                </div>

                <Group mt="lg">
                  <Avatar src={file.to.profileURL} radius="sm" />
                  <div>
                    <Text fz="xs" c="dimmed">
                      Sent to:
                    </Text>
                    <Text fw={500}>{file.to.name}</Text>
                    <Text fz="xs" c="dimmed">
                      {file.to.email}
                    </Text>
                  </div>
                </Group>
              </Card>
            );
          })}
        </div>

        <Divider mb={15} />

        <Text size="xl" weight={500} mb={15}>
          Received Files:
        </Text>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {files.received.map((file) => {
            return (
              <Card
                withBorder
                padding="lg"
                radius="md"
                className={classes.card}
              >
                <div
                  className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card"
                  onClick={() => {
                    ipcRenderer.send("downloadLink", file.webContentLink);
                  }}
                >
                  {file.name}
                </div>

                <Group mt="lg">
                  <Avatar src={file.from.profileURL} radius="sm" />
                  <div>
                    <Text fz="xs" c="dimmed">
                      Received from:
                    </Text>
                    <Text fw={500}>{file.from.name}</Text>
                    <Text fz="xs" c="dimmed">
                      {file.from.email}
                    </Text>
                  </div>
                </Group>
              </Card>
            );
          })}
        </div>
      </>
    );
};