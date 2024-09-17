import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import colors from "../../config/colors";
import typography from "src/config/typography";
import { EventType } from "@/types";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';

interface EventProps {
  eventData: EventType;
  setIsCameraOpen?: (isOpen: boolean) => void;
  navigateAndOpenCamera?: () => void;
}

const Event: React.FC<EventProps> = ({ eventData, navigateAndOpenCamera }) => {
  const router = useRouter();

  const isEventLive = (event: EventType) => {
    const currentDate = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return currentDate >= startDate && currentDate <= endDate;
  };
  const eventName =
    eventData.name.length > 30
      ? eventData.name.slice(0, 30) + "..."
      : eventData.name;
  return (
    <View>
      {eventData && (
        <View style={styles.eventContainer}>
              <TouchableOpacity
                style={styles.event}
                onPress={() => {
                  if (eventData.is_expired) {
                    router.push(`/album/${eventData._id}`);
                  } else {
                    router.push(`/event/${eventData._id}`);
                  }
                }}
              >
            <Image
              source={{ uri: eventData.event_image }}
              style={styles.chatIcon}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventName}>{eventName}</Text>
              {isEventLive(eventData) && (
                <Text style={styles.eventDescription}>Live Now</Text>
              )}
            </View>
          </TouchableOpacity>
          {isEventLive(eventData) && (
          <TouchableOpacity
            style={styles.addMemoryButton}
            onPress={() => router.push(`/event/${eventData._id}`)}
          >
            <Text style={styles.addMemoryButtonText}>
              Add a Memory
            </Text>
          </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eventContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  event: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    backgroundColor: "transparent",
    width: "70%",
  },

  eventDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 5,
  },
  chatIcon: {
    width: 56,
    height: 56,
    marginRight: 10,
    borderRadius: 56,
    borderColor: colors.__logo_color,
    borderWidth: 2,
  },
  chatSubcategory: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.__main_blue,
    marginBottom: 5,
  },
  eventName: {
    fontSize: 15,
    fontFamily: typography.appFont[500],
    color: colors.__main_text,
    marginBottom: 5,
  },
  eventDetailsBottom: {
    flexDirection: "row",
    gap: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.__main_text,
    fontFamily: typography.appFont[400],
  },
  chatTimestamp: {
    fontSize: 12,
    color: "#C7C7C7",
    alignSelf: "flex-start",
  },
  noDiscussions: {
    textAlign: "center",
    marginTop: "10%",
    fontFamily: typography.appFont[500],
  },
  addMemoryButton: {
    borderRadius: 10,
    backgroundColor: "rgba(41, 182, 246, 0.1)",
    paddingHorizontal: 5,
    width: "30%",
    height: 30,
    justifyContent: "center",
  },
  addMemoryButtonText: {
    fontFamily: typography.appFont[500],
    fontSize: 12,
    textAlign: "center",
  },
});

export default Event;
