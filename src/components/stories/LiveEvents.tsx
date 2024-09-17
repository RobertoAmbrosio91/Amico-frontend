import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { EventType, Memorytype } from "../../types";
import typography from "src/config/typography";
import { useRouter } from "expo-router";
import colors from "src/config/colors";
import { Image } from "expo-image";

const LiveEvents: React.FC<any> = ({
  events,
  scrollY,
  setStoriesVisible,
  setStartingIndex,
}: {
  events: EventType[];
  scrollY: Animated.Value;
  setStoriesVisible: (visible: boolean) => void;
  setStartingIndex: (index: number) => void;
}) => {
  const router = useRouter();
  const [randomMemories, setRandomMemories] = useState<any>({});

  useEffect(() => {
    const newRandomMemories: any = {};
    events.forEach((event: EventType) => {
      const standardImage =
        "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";

      const imageMemories = event.memories.filter((memory: Memorytype) => {
        const videoExtensions = [".mp4", ".mov"];
        return !videoExtensions.some((extension) =>
          memory.media_file.endsWith(extension)
        );
      });

      const randomIndex =
        imageMemories.length > 0
          ? Math.floor(Math.random() * imageMemories.length)
          : -1;

      const randomMemory =
        randomIndex !== -1
          ? imageMemories[randomIndex].media_file
          : standardImage;

      newRandomMemories[event._id] = randomMemory;
    });

    setRandomMemories(newRandomMemories);
  }, [events]);

  const renderItem = ({ item, index }: any) => {
    const standardImage =
      "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";

    const randomMemory = randomMemories[item._id];

    const eventHasImage =
      item.event_image && item.event_image !== standardImage;
    return (
      <View
        style={[index !== 0 && { marginLeft: 10, alignItems: "center" }]}
        key={index}
      >
        <Pressable
          style={styles.storyContainer}
          onPress={() => {
            setStartingIndex(index);
            router.setParams({
              is_story: "yes",
            });
            setStoriesVisible(true);
          }}
        >
          <Image
            style={styles.storyBackground}
            source={{ uri: eventHasImage ? item.event_image : randomMemory }}
            contentFit="cover"
          />
        </Pressable>
        <Text style={styles.textEventName}>
          {item.event_name.length > 18
            ? item.event_name.slice(0, 16) + ".."
            : item.event_name}
        </Text>
        <Text style={styles.textEventParticipants}>
          {item.participants ? item.participants.length : 0} participants
        </Text>
      </View>
    );
  };

  return (
    <View style={{ rowGap: 5 }}>
      <Live />
      {events.length === 0 ? (
        <View style={styles.noEvents}>
          <Text style={styles.noEventsTitle}>Nothing live at the moment</Text>
          <Text style={styles.noEventsText}>
            Check out past events, or explore other sections of the app
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={[styles.storiesContainer]}
          contentContainerStyle={{ paddingLeft: 5 }}
        />
      )}
    </View>
  );
};

export default LiveEvents;
const Live: React.FC = () => {
  return (
    <View style={styles.liveNowContainer}>
      <View style={styles.liveNowDot}></View>
      <Text style={styles.liveNow}>LIVE NOW</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  storyContainer: {
    width: 96,
    height: 130,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: "#FF3E3E",
    borderWidth: 1,
  },
  storyBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    // resizeMode: "cover",
  },
  storiesContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 5,
  },
  text: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    marginLeft: 5,
    fontSize: 20,
  },
  textEventName: {
    fontFamily: typography.appFont[600],
    color: colors.__white_text,
    maxWidth: 100,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 2,
  },
  textEventParticipants: {
    fontFamily: typography.appFont[400],
    color: colors.__white_text,
    maxWidth: 100,
    fontSize: 14,
    marginLeft: 2,
  },
  noEvents: {
    alignItems: "center",
    rowGap: 5,
    padding: 10,
    top: "25%",
  },
  noEventsTitle: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
    color: colors.__main_text_color,
  },
  noEventsText: {
    textAlign: "center",
    color: colors.__main_text_color,
  },
  liveNow: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#fff",
  },
  liveNowContainer: {
    padding: 5,
    borderColor: "#FF3E3E",
    borderWidth: 1,
    marginLeft: 5,
    borderRadius: 20,
    width: "20%",
    flexDirection: "row",
    columnGap: 3,
    alignItems: "center",
  },
  liveNowDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#FF3E3E",
  },
});
