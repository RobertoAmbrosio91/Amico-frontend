import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import useDownloadFiles from "@/services/downloadMedia";
import { Memorytype } from "@/types";
import DownloadProgressComponent from "../download/DownloadProgressComponent";
import CustomButton from "../buttons&inputs/CustomButton";
import { Entypo, Ionicons } from "@expo/vector-icons";
import colors from "@/config/colors";
import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";

const MemoriesAlbum: React.FC<any> = ({
  memories,
  token,
  setStartingIndex,
  setStoriesVisible,
  setSelectable,
  selectable,
  handleMemorySelection,
  selectedMemories,
  closeAndReset,
  eventName,
}) => {
  const [imageMemories, setImageMemories] = React.useState<string[]>([]);
  const [videoMemories, setVideoMemories] = React.useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // const urls = React.useMemo(() => [selectedMemories]);

  const { downloadAllFiles, progress, error, resetDownloads } =
    useDownloadFiles(selectedMemories, eventName);
  const handleDownload = async () => {
    setIsDownloading(true);
    const success = await downloadAllFiles();
    if (success) {
      setTimeout(() => {
        setIsDownloading(false);
        closeAndReset();
      }, 2000);
    }
  };
  const handleRetry = () => {
    resetDownloads();
    handleDownload();
  };
  const handleLongPress = (memory: Memorytype) => {
    if (!selectable) {
      setSelectable(!selectable);
      handleMemorySelection(memory);
    }
  };
  const handlePress = (memory: Memorytype, index: number) => {
    if (selectable) {
      handleMemorySelection(memory);
    } else {
      setStartingIndex(index), setStoriesVisible(true);
    }
  };

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <View style={styles.container}>
      {selectable && (
        <View style={styles.downloadSection}>
          <View style={styles.downloadText}>
            <View></View>
            <Text style={{ maxWidth: "85%", textAlign: "center" }}>
              Save your favorite memories directly into a dedicated album in
              your gallery.
            </Text>
            <TouchableOpacity onPress={() => closeAndReset()}>
              <Ionicons name="close" size={26} color="black" />
            </TouchableOpacity>
          </View>
          <CustomButton
            text={"Download"}
            onPress={() => handleDownload()}
            borderStyle={[
              styles.downloadButton,
              selectedMemories.length === 0
                ? { backgroundColor: colors.__disabled_button }
                : { backgroundColor: colors.__amico_blue },
            ]}
            textStyle={[
              styles.downloadButtonText,
              // selectedMemories.length === 0
              //   ? { color: colors.__main_text_color }
              //   : {},
            ]}
            disabled={selectedMemories.length === 0}
          />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {isDownloading && (
          <View style={styles.downloadContainer}>
            <DownloadProgressComponent
              progress={progress}
              error={error}
              onRetry={handleRetry}
            />
          </View>
        )}
        <View style={styles.innerContainer}>
          {memories &&
            memories.map((memory: Memorytype, index: number) => {
              return (
                <TouchableOpacity
                  onPress={() => handlePress(memory, index)}
                  onLongPress={() => handleLongPress(memory)}
                  key={index}
                  style={styles.singlePhotoContainer}
                >
                  {selectedMemories.includes(memory.media_file) && (
                    <View
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 10,
                        zIndex: 1000,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="white"
                      />
                    </View>
                  )}

                  {memory.memory_type === "image" ? (
                    <Image
                      source={{ uri: memory.media_file }}
                      style={styles.image}
                      placeholder={blurhash}
                    />
                  ) : (
                    <Video
                      source={{ uri: memory.media_file }}
                      style={styles.image}
                      resizeMode={ResizeMode.COVER}
                      isMuted={true}
                      shouldPlay={false}
                    />
                  )}
                  <View style={styles.creatorProfileContainer}>
                    <Image
                      source={{ uri: memory.created_by.profile }}
                      style={styles.creatorProfile}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
};

export default MemoriesAlbum;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingVertical: 10,
    // marginTop: 20,
    backgroundColor: colors.__secondary_background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  downloadSection: {
    alignItems: "center",
    paddingVertical: 10,
    rowGap: 5,
  },
  downloadText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  downloadButton: {
    width: "35%",
    borderRadius: 10,
  },
  downloadButtonText: {
    color: colors.w_contrast,
    fontWeight: "600",
  },
  downloadContainer: {
    position: "absolute",
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  singlePhotoContainer: {
    width: "50%",
    padding: 3,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 50,
    paddingHorizontal: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderWidth: 0.5,
    borderColor: "white",
    borderRadius: 10,
  },
  creatorProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.__amico_blue,
  },
  creatorProfileContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
});
