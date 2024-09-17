import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import typography from "@/config/typography";
import { Image } from "expo-image";
import { Memorytype, Prompt } from "@/types";
import { Feather, Entypo } from "@expo/vector-icons";
import colors from "@/config/colors";
import getFileType from "@/services/getFileType";
import { ResizeMode, Video } from "expo-av";

interface PromptModalInterface {
  selectedPrompt: Prompt | undefined;
  memories: Memorytype[];
  setIsCameraOpen: (isOpen: boolean) => void;
}

const PromptModal: React.FC<PromptModalInterface> = ({
  selectedPrompt,
  memories,
  setIsCameraOpen,
}) => {
  const filteredMemories = memories.filter(
    (memory) => memory.media_file !== selectedPrompt?.prompt_image
  );
  if (selectedPrompt)
    return (
      <View style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            <Text style={styles.title}>Let's Get Snapping!</Text>
            <Text style={styles.promptName}>"{selectedPrompt.name}"</Text>
            {getFileType(selectedPrompt.prompt_image) === "image" ? (
              <Image
                source={{ uri: selectedPrompt.prompt_image }}
                style={styles.promptImage}
              />
            ) : (
              <Video
                source={{ uri: selectedPrompt.prompt_image }}
                style={styles.promptImage}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isMuted
              />
            )}

            <View style={styles.promptResponses}>
              {filteredMemories.map((memory: Memorytype, index: number) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.memoryContainer,
                      index === filteredMemories.length - 1 && {
                        marginBottom: 150,
                      },
                    ]}
                  >
                    {getFileType(memory.media_file) === "image" ? (
                      <Image
                        source={{ uri: memory.media_file }}
                        style={styles.memory}
                      />
                    ) : (
                      <Video
                        source={{ uri: memory.media_file }}
                        style={styles.memory}
                        shouldPlay
                        isLooping={false}
                        resizeMode={ResizeMode.COVER}
                      />
                    )}
                    <Image
                      source={{ uri: memory.created_by.profile }}
                      style={styles.profileImage}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.addMemoryContainer}
          onPress={() => setIsCameraOpen(true)}
        >
          <Feather name="camera" size={35} color={colors.w_contrast} />
          <Text style={[styles.addMemory]}>Snap Yours</Text>
        </TouchableOpacity>
      </View>
    );
};

export default PromptModal;

const styles = StyleSheet.create({
  wrapper: {
    padding: 5,
    rowGap: 10,
    flex: 1,
    zIndex: 100,
  },
  title: {
    alignSelf: "center",
    fontFamily: typography.appFont[600],
    fontSize: 18,
  },
  promptImage: {
    width: 150,
    height: 200,
    alignSelf: "center",
    borderRadius: 10,
  },
  promptName: {
    fontFamily: typography.appFont[500],
    fontSize: 15,
    alignSelf: "center",
    textAlign: "center",
    marginTop: -5,
    marginBottom: 5,
  },
  promptResponses: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    columnGap: ((Dimensions.get("window").width - 10) * 1.9) / 100,
  },
  memoryContainer: {
    width: "32%",
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 7,
    // marginRight: "1.3%",
  },
  memory: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },
  addMemoryContainer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: colors.__amico_blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    rowGap: 3,
    zIndex: 150,
  },
  addMemory: {
    color: colors.__main_text_color,
    fontFamily: typography.appFont[600],
    fontSize: 13,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    position: "absolute",
    bottom: 5,
    left: 5,
    borderWidth: 1,
    borderColor: colors.__amico_blue,
  },
});
