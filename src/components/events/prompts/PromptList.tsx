import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { Image } from "expo-image";
import colors from "@/config/colors";
import { Prompt } from "@/types";
import typography from "@/config/typography";
import { BlurView } from "expo-blur";
import { Entypo, Ionicons } from "@expo/vector-icons";
import getFileType from "@/services/getFileType";
import { ResizeMode, Video } from "expo-av";
interface PromptListInterface {
  prompts: any;
  presentPromptModal: any;
  setSelectedPrompt: any;
}
const PromptList: React.FC<PromptListInterface> = ({
  prompts,
  presentPromptModal,
  setSelectedPrompt,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const animatedHeight = useRef(new Animated.Value(1)).current;

  const togglePromptList = () => {
    if (isExpanded) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setIsExpanded(!isExpanded);
  };

  const animatedStyle = {
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: ["6%", "19%"],
    }),
  };
  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    presentPromptModal();
  };
  const renderPrompt = ({ item, index }: { item: any; index: number }) => {
    return (
      <View key={index}>
        {item && item.prompt_image && (
          <TouchableOpacity
            onPress={() => handleSelectPrompt(item)}
            // key={index}
            style={[styles.prompt, index === 0 && { marginLeft: 5 }]}
          >
            {getFileType(item.prompt_image) === "image" ? (
              <Image
                source={{ uri: item.prompt_image }}
                style={styles.promptImage}
              />
            ) : (
              <Video
                source={{ uri: item.prompt_image }}
                style={styles.promptImage}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isMuted
              />
            )}
            <Text style={styles.promptName}>
              {item.name.length > 15
                ? item.name.slice(0, 15) + "..."
                : item.name}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <Animated.View
      style={[
        styles.promptsContainer,
        animatedStyle,
        !isExpanded && { backgroundColor: colors.__secondary_background },
      ]}
    >
      {/* <BlurView
        style={[
          styles.promptsContainer,
          { height: "100%", borderRadius: 30 },
          !isExpanded && { backgroundColor: colors.__secondary_background },
        ]}
        intensity={20}
      > */}
      {isExpanded && (
        <View>
          <Text style={[styles.picPromptTitle, { marginTop: 5 }]}>
            See what your friends are Snapping!
          </Text>
        </View>
      )}
      {isExpanded ? (
        <FlatList
          data={prompts}
          renderItem={renderPrompt}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.flatListStyle}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.picPrompts}>
          <Ionicons name="camera-outline" size={24} color="black" />
          <Text style={styles.picPromptTitle}>Snap Challenges</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.openClosePrompt}
        onPress={togglePromptList}
      >
        <Entypo
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {/* </BlurView> */}
    </Animated.View>
  );
};

export default PromptList;

const styles = StyleSheet.create({
  promptImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  prompt: {
    alignItems: "center",
    maxWidth: 55,
    marginLeft: 20,
  },
  promptsContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 1000,
    alignItems: "center",
    rowGap: 5,
    backgroundColor: "rgba(255, 251, 242, 0.9)",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    height: "16%",
    // flexDirection: "row",
  },
  promptName: {
    fontSize: 11,
    textAlign: "center",
  },
  listContainer: {
    paddingRight: 50,
  },
  flatListStyle: {
    paddingHorizontal: 10,
    width: "100%",
  },
  title: {
    fontFamily: typography.appFont[600],
    fontSize: 14,
    alignSelf: "center",
    color: colors.w_contrast,
  },
  openClosePrompt: {
    position: "absolute",
    zIndex: 10000,
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  picPrompts: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 10,
  },
  picPromptTitle: {
    fontFamily: typography.appFont[500],
  },
});
