import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  FlatList,
} from "react-native";
import React from "react";
import { EventType } from "../../types";
import typography from "src/config/typography";
import { useRouter } from "expo-router";
import colors from "src/config/colors";
import { Image } from 'expo-image';


const StoryComponent: React.FC<any> = ({
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
  const scale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.6],
    extrapolate: "clamp",
  });
  const margin = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [12, -80],
    extrapolate: "clamp",
  });
  const marginTop = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -27],
    extrapolate: "clamp",
  });
  const marginLeft = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const height = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [190, 0],
    extrapolate: "clamp",
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 150], // Adjust these values as needed
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const renderItem = ({ item, index }: any) => (
    <Animated.View
      key={index}
      style={[
        {
          transform: [{ scale }],
          marginRight: margin,
          marginTop: marginTop,
          opacity,
        },
        index === 0 && { marginLeft: marginLeft },
      ]}
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
          source={{ uri: item.event_image }}
          contentFit="cover"
        />
      </Pressable>
      <Text style={styles.textEventName}>{item.event_name}</Text>
    </Animated.View>
  );

  return (
    <Animated.View style={{ rowGap: 5, height: height }}>
      <Text style={styles.text}>Live Events</Text>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={[styles.storiesContainer]}
        contentContainerStyle={{ paddingLeft: 5 }}
      />
    </Animated.View>
  );
};

export default StoryComponent;

const styles = StyleSheet.create({
  storyContainer: {
    width: 200,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  text: {
    fontFamily: typography.appFont[500],
    color: colors.__main_text,
    marginLeft: 5,
    fontSize: 16,
  },
  textEventName: {
    fontFamily: typography.appFont[500],
    color: colors.__main_text,
    marginLeft: 5,
    fontSize: 14,
    marginTop: 12,
  },
});
