import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
import colors from "@/config/colors";
import { Image } from "expo-image";
import typography from "@/config/typography";
import { EventType, Memorytype } from "@/types";
import { ResizeMode, Video } from "expo-av";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
const Recap = ({ eventData }: { eventData: EventType }) => {
  const { event_image, location, start_date, memories, name } = eventData;
  const [regenerate, setRegenerate] = useState<boolean>(false);
  const standardImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";
  const imageMemories =
    memories && memories.filter((memory) => memory.memory_type === "image");

  const [eventImage, setEventImage] = useState(
    event_image === standardImage
      ? imageMemories[Math.floor(Math.random() * imageMemories.length)]
          .media_file
      : event_image
  );

  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);

  function generateRandomNumbers(n: number) {
    const result = new Set<number>();
    while (result.size < 6) {
      const random = Math.floor(Math.random() * n);
      result.add(random);
    }
    return Array.from(result);
  }

  const updateImagesAndNumbers = () => {
    const randoms = generateRandomNumbers(memories.length);

    setRandomNumbers(randoms);
    setEventImage(
      event_image === standardImage
        ? imageMemories[Math.floor(Math.random() * imageMemories.length)]
            .media_file
        : event_image
    );
    setRegenerate(false);
  };

  useEffect(() => {
    if (eventData) {
      updateImagesAndNumbers();
    }
  }, [eventData, regenerate]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Entypo name="chevron-left" size={30} color={colors.__main_text} />
        </TouchableOpacity>
        <MainPolaroid
          event_image={eventImage}
          event_name={name}
          start_date={start_date}
          location={location}
        />
        {randomNumbers.length > 0 && (
          <MultiplePhotos memories={memories} randomNumbers={randomNumbers} />
        )}
        <TouchableOpacity
          style={styles.regenerate}
          onPress={() => setRegenerate(true)}
        >
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Recap;
interface MainPolaroidInterface {
  event_image: string;
  event_name: string;
  start_date: string;
  location: string;
}
const MainPolaroid: React.FC<MainPolaroidInterface> = ({
  event_image,
  event_name,
  location,
  start_date,
}) => {
  return (
    <View style={styles.mainPolaroidContainer}>
      <Image
        source={{
          uri: event_image,
        }}
        style={styles.mainImage}
        contentFit="cover"
      />
      <View style={styles.eventData}>
        <View style={{ maxWidth: "70%" }}>
          <Text style={styles.date}>{location}</Text>
          <Text style={styles.name}>{event_name}</Text>
        </View>
        <Image
          source={require("../../../../assets/logo-amico-blue.png")}
          style={{ width: 90, height: 24.5 }}
        />
      </View>
    </View>
  );
};

const MultiplePhotos: FC<any> = ({
  memories,
  randomNumbers,
}: {
  memories: Memorytype[];
  randomNumbers: number[];
}) => {
  const MediaDisplay = ({ index }: { index: number }) => {
    const [isLoading, setIsLoading] = useState(true);
    return (
      <View>
        {memories[randomNumbers[index]].memory_type === "image" ? (
          <Image
            source={{
              uri: memories[randomNumbers[index]].media_file,
            }}
            style={styles.smallImage}
          />
        ) : (
          <View>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={colors.__secondary_text_color}
                style={styles.loader}
              />
            )}
            <Video
              source={{
                uri: memories[randomNumbers[index]].media_file,
              }}
              style={styles.smallImage}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isMuted
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
            />
            {/* {isLoading && <Text style={styles.loadingText}>Loading...</Text>} */}
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.image1, styles.vertical]}>
        <MediaDisplay index={0} />
      </View>
      <View style={[styles.image2, styles.horizontal]}>
        <MediaDisplay index={1} />
      </View>
      <View style={[styles.horizontal, styles.image3]}>
        <MediaDisplay index={2} />
      </View>
      <View style={[styles.horizontal, styles.image4]}>
        <MediaDisplay index={3} />
      </View>
      <View style={[styles.horizontal, styles.image5]}>
        <MediaDisplay index={4} />
      </View>
      <View style={[styles.vertical, styles.image6]}>
        <MediaDisplay index={5} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    // backgroundColor: colors.__main_background,
    backgroundColor: "#fff",
  },
  container: {
    padding: 15,
    flex: 1,
  },
  mainPolaroidContainer: {
    width: "100%",
    backgroundColor: colors.__secondary_background,
    padding: 10,
    // height: "40%",
    shadowColor: "#000",
    transform: [{ rotate: "2deg" }],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 10,
  },
  eventData: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 10,
    // height: "18%",
  },
  date: {
    // fontFamily: typography.appFont[500],
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "500",
  },
  name: {
    fontFamily: typography.appFont[600],
    fontSize: 14,
  },
  mainImage: {
    width: "100%",
    height: 220,
  },
  horizontal: {
    width: 176,
    height: 130,
    padding: 5,
    backgroundColor: colors.__secondary_background,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  vertical: {
    width: 130,
    height: 173,
    padding: 5,
    backgroundColor: colors.__secondary_background,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  image1: {
    position: "absolute",
    top: "5%",
    left: "6%",
  },
  image2: {
    position: "absolute",
    right: "6%",
    top: "5%",
  },
  image3: {
    width: 150,
    height: 110,
    top: "43%",
    left: "13%",
    transform: [{ rotate: "-2deg" }],
  },
  image4: {
    position: "absolute",
    right: "-1%",
    top: "30%",
    transform: [{ rotate: "-2deg" }],
    width: 160,
  },
  image5: {
    position: "absolute",
    top: "67%",
    left: "3%",
  },
  image6: {
    position: "absolute",
    bottom: "3%",
    right: "5%",
  },
  smallImage: {
    width: "100%",
    height: "100%",
  },
  regenerate: {
    alignSelf: "center",
    top: "3%",
  },
  loader: {
    position: "absolute",
    top: "40%",
    left: "40%",
    zIndex: 1,
  },
  backIcon: {
    top: -15,
  },
});
