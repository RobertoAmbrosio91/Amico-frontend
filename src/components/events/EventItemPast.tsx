import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { EventType } from "@/types";
import colors from "@/config/colors";

const EventPast: React.FC<{
  events: EventType[];
  refreshing: any;
  onRefresh: any;
}> = ({ events, refreshing, onRefresh }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleEvents, setVisibleEvents] = useState<EventType[]>([]);
  const [displayCount, setDisplayCount] = useState(2);
  const standardImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";

  function generateRandomNumber(n: number) {
    return Math.floor(Math.random() * n);
  }
  useEffect(() => {
    setVisibleEvents(events.slice(0, displayCount));
  }, [events, displayCount]);

  const handleLoadMore = () => {
    if (displayCount < events.length) {
      setDisplayCount(displayCount + 2);
    }
  };

  const renderEvent = ({ item, index }: { item: EventType; index: number }) => {
    // Filter out video memories and select a random image memory if available
    const videoExtensions = [".mp4", ".mov"];
    const imageMemories = (item.memories || []).filter(
      (memory) =>
        !videoExtensions.some((extension) =>
          memory.media_file.endsWith(extension)
        )
    );
    const randomMemory =
      imageMemories.length > 0
        ? imageMemories[Math.floor(Math.random() * imageMemories.length)]
            .media_file
        : standardImage;
    const eventHasImage =
      item.event_image === standardImage && imageMemories.length > 0
        ? false
        : true;

    // Determine the displayed event name (shortened if too long)
    const eventName =
      item.name.length > 30 ? `${item.name.slice(0, 30)}...` : item.name;

    return (
      <Pressable
        style={[
          styles.container,
          events.filter((event) =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length -
            1 ===
            index && { marginBottom: 330 },
        ]}
        onPress={() => router.push(`/album/${item._id}`)}
      >
        <Image
          source={{ uri: eventHasImage ? item.event_image : randomMemory }}
          style={styles.eventImage}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.eventText}>{eventName}</Text>
          <FlatList
            data={item.participants}
            horizontal
            renderItem={({ item, index }) => (
              <Image
                source={{ uri: item.profile }}
                style={[
                  styles.participantImage,
                  index !== 0 && { marginLeft: -10 },
                ]}
                key={index}
              />
            )}
            keyExtractor={(participant, index) => `participant-${index}`}
            showsHorizontalScrollIndicator={false}
            style={styles.participantsContainer}
          />
        </View>
      </Pressable>
    );
  };
  return (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Past Events"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#555"
      />
      <FlatList
        data={visibleEvents.filter((event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderEvent}
        keyExtractor={(event) => event._id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#e1e1e1"]}
            tintColor="#d1d1d1"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 350,
    borderRadius: 20,
    marginBottom: 15,
    borderColor: "rgba(0,0,0,0.1)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: "white"
  },
  eventImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 20,
  },
  detailsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    rowGap: 10,
    zIndex: 1000,
  },
  eventText: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    color: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  participantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantsContainer: {
    zIndex: 1000000,
  },
  searchInput: {
    backgroundColor: colors.__background_input,
    color: "#000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default EventPast;
