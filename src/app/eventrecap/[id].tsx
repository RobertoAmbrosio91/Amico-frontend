import { StyleSheet, Text, View } from "react-native";
import React, { FC, useEffect, useState } from "react";
import Recap from "@/components/events/single event/Recap";
import { useLocalSearchParams } from "expo-router";
import { EventType } from "@/types";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";

const Eventrecap: FC = () => {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const currentUser = useFetchUserDataAsync();
  const [eventData, setEventData] = useState<EventType>();
  useEffect(() => {
    if (currentUser && eventId) {
      try {
        const fetchEventData = async () => {
          const fetchedEventData = await fetchSingleEvent(
            eventId,
            currentUser.token
          );
          if (fetchedEventData) {
            setEventData(fetchedEventData);
          }
        };
        fetchEventData();
      } catch (error: any) {
        console.log("Something went wrong fetching the event data", error);
      }
    }
  }, [currentUser]);

  if (eventData) return <Recap eventData={eventData} />;
};

export default Eventrecap;

const styles = StyleSheet.create({});
