import {
  TextInput,
  TextInputProps,
  ActionIcon,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCopy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import axios from "axios";


export default function InputWithButton(props) {
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: { text: "" }
  });

  return (
    <form onSubmit={form.onSubmit((values) => {
      // * Send post request to /text-upload with the body containing the text
      axios.post("/text-upload", { text: values.text })
        .then((res) => {
          notifications.show({
            title: "Text uploaded",
            message: "Text uploaded successfully",
            color: "teal",
          });
        })
        .catch((err) => {
          notifications.show({
            title: "Error",
            message: "Error uploading text",
            color: "red",
          });
        }
      );
    })}>
      <TextInput
        radius="xl"
        size="md"
        rightSection={
          <>
            <ActionIcon
              size={32}
              radius="xl"
              color={theme.primaryColor}
              variant="filled"
            >
              <IconCopy size="1.1rem" stroke={1.5} onClick={() => {
                // * Fetch /get-text for the text and copy it to the clipboard
                axios.get("/get-text")
                  .then((res) => {
                    navigator.clipboard.writeText(res.data.text);
                    notifications.show({
                      title: "Text copied",
                      message: "Text copied to clipboard",
                      color: "teal",
                    });
                  }
                );
              }} />
            </ActionIcon>
          </>
        }
        placeholder="Share your text here!"
        rightSectionWidth={42}
        {...form.getInputProps("text")}
      />
    </form>
  );
}
