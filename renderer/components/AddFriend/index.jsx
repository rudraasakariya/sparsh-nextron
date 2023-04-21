import { TextInput, Checkbox, Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { notifications } from "@mantine/notifications";

import { closeAllModals } from "@mantine/modals";
import { ipcRenderer } from "electron";

export default function AddFriend() {
  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <Box maw={300} mx="auto">
      <form
        onSubmit={form.onSubmit((values) => {
          ipcRenderer
            .invoke("add-friend", values.email)
            .then((res) => {
              notifications.show({
                title: "Friend added",
                message: "Friend added successfully",
                color: "teal",
              });
              closeAllModals();
            })
            .catch((err) => {
              notifications.show({
                title: "Error",
                message: "Error adding friend",
                color: "red",
              });
            });
        })}
      >
        <TextInput withAsterisk label="Email" placeholder="friend@email.com" {...form.getInputProps("email")} />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
