import { Avatar, Badge, Table, Group, Text, ScrollArea, Divider, Skeleton } from "@mantine/core";
import { modals } from "@mantine/modals";

import AddFriend from "../AddFriend";

import Friend from "../Friend";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersRolesTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from API
    axios
      .get(`/get-friends`)
      .then((res) => {
        const friends = res.data;
        setData(friends);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      setData([]);
    };
  }, []);

  const rows = data.map((item) => (
    <tr key={item.name}>
      <td>
        <Group
          spacing="sm"
          onClick={() => {
            modals.open({
              children: <Friend friend={item} />,
              overlayProps: {
                opacity: 0.55,
                blur: 3,
              },
              size: "xl",
              centered: true,
            });
          }}
        >
          <Avatar size={40} src={item.profileURL} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </td>
    </tr>
  ));

  return (
    <div>
      <ScrollArea>
        <Table miw={100} verticalSpacing="sm">
          <tbody>{rows.length ? rows : (
            "No friends yet"
          )}</tbody>
        </Table>
      </ScrollArea>

      <Divider />

      <button
        className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        onClick={() => {
          modals.open({
            children: <AddFriend />,
            overlayProps: {
              opacity: 0.55,
              blur: 3,
            },

            centered: true,
          });
        }}
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          Add Friend
        </span>
      </button>
    </div>
  );
}
