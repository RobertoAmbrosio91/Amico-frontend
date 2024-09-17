import { View, Text } from "react-native";
import React, { useEffect } from "react";
import useFetchUserDataAsync from "../async_storage/useFetchUserDataAsync";
import io from "socket.io-client";
import { EventType } from "@/types";

const useMyEventsSocket = (setMyEvents: any) => {
  const currentUser = useFetchUserDataAsync();
  useEffect(() => {
    if (currentUser) {
      const socket = io("https://socket.noosk.co");
      // const socket = io("https://dbfc-154-27-22-81.ngrok-free.app");
      socket.emit("my_events", currentUser._id);
      socket.on("event_update", (eventData: any) => {
        setMyEvents((currentEvents: EventType[]) => {
          let eventFound = false;

          const updatedEvents = currentEvents.map((event: EventType) => {
            if (event._id === eventData._id) {
              eventFound = true;
              return eventData;
            }
            return event;
          });
          if (!eventFound) {
            return [...updatedEvents, eventData];
          }

          return updatedEvents;
        });
      });

      socket.on("event_deleted", (eventId: string) => {
        setMyEvents((currentEvents: EventType[]) => {
          return currentEvents.filter(
            (event: EventType) => event._id !== eventId
          );
        });
      });
      return () => {
        socket.off("event_update");
        socket.off("event_deleted");
      };
    }
  }, [currentUser]);
};

export default useMyEventsSocket;
