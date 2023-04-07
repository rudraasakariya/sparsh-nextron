import {
  TextInput,
  TextInputProps,
  ActionIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconSearch, IconArrowRight, IconCopy } from "@tabler/icons-react";

export default function InputWithButton(props) {
  const theme = useMantineTheme();

  return (
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
                
            }} />
          </ActionIcon>
        </>
      }
      placeholder="Share your text here!"
      rightSectionWidth={42}
      {...props}
    />
  );
}
