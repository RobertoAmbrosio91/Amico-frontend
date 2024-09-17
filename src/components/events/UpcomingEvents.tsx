import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { EventType } from "@/types";
import colors from "@/config/colors";
import typography from "@/config/typography";
import CustomButton from "../buttons&inputs/CustomButton";
import { router } from "expo-router";

const UpcomingEvents = ({ events }: { events: EventType[] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEM_WIDTH = Dimensions.get("window").width - 30;
  const totalPages = events.length;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);
    if (newIndex !== currentPage) {
      setCurrentPage(newIndex);
    }
  };

  const renderPaginationDots = () => {
    return Array.from({ length: totalPages }, (_, index) => (
      <View
        key={index}
        style={[styles.dot, currentPage === index && styles.activeDot]}
      />
    ));
  };
  const event = ({ item, index }: { item: EventType; index: number }) => {
    let commaIndex = item.location.indexOf(",");
    let slicedLocation = item.location.slice(commaIndex + 1);
    // Create a new Date object
    const date = new Date(item.start_date);
    // Get the day as '20'
    const day = date.toLocaleDateString("en-US", { day: "numeric" });
    // Get the month as 'May'
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return (
      <Pressable
        style={[styles.eventContainer, { width: ITEM_WIDTH }]}
        onPress={() => router.push(`/event/${item._id}`)}
      >
        <View style={styles.dateContainer}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
        </View>
        <View style={styles.nameLocationContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.name}>
            {item.name}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.location}>
            {slicedLocation} | {item.participants.length} participants
          </Text>
        </View>
      </Pressable>
    );
  };
  const NoEvents = () => {
    return (
      <View style={styles.noEventsContainer}>
        <Text style={styles.text}>You don't have upcoming events now</Text>
        <CustomButton
          text={"Create New Event"}
          hasIcon={true}
          icon={"plus-square-o"}
          borderStyle={styles.button}
          textStyle={styles.buttonText}
          onPress={() => router.push("/createevent")}
        />
      </View>
    );
  };
  if (events.length === 0) {
    return <NoEvents />;
  }
  return (
    <View style={[styles.container]}>
      <FlatList
        data={events}
        renderItem={event}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        pagingEnabled
        keyExtractor={(item) => item._id}
      />
      <View style={styles.paginationContainer}>{renderPaginationDots()}</View>
    </View>
  );
};

export default UpcomingEvents;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  eventContainer: {
    flexDirection: "row",
    columnGap: 10,
    padding: 10,
    borderColor: "#E9E2D1",
    borderWidth: 1,
    borderRadius: 8,
  },
  dateContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
  },
  day: {
    fontSize: 20,
    fontWeight: "bold",
  },
  month: {
    fontSize: 13,
  },
  name: {
    fontFamily: typography.appFont[600],
    fontSize: 15,
  },
  location: {
    fontFamily: typography.appFont[400],
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
  },
  nameLocationContainer: {
    rowGap: 5,
    alignSelf: "center",
  },
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    rowGap: 10,
  },
  text: {
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
  },
  button: {
    backgroundColor: colors.__amico_blue,
    width: 200,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: typography.appFont[600],
    color: "#fff",
  },
  dot: {
    height: 7,
    width: 7,
    borderRadius: 5,
    backgroundColor: "transparent",
    margin: 5,
    borderColor: colors.__main_background,
    borderWidth: 1,
  },
  activeDot: {
    backgroundColor: colors.__amico_blue,
    borderColor: "transparent",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 15,
    marginTop: 5,
  },
});
