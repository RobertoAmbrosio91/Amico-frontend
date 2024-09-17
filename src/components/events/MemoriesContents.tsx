import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  FlatList,
  Animated,
} from "react-native";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { CurrentUserType, Memorytype } from "@/types";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { ResizeMode, Video } from "expo-av";
import { AntDesign, Feather } from "@expo/vector-icons";
import deleteMemory from "@/hooks/events/deleteMemory";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toggleLikeUnlikeMemory } from "@/hooks/events/toggleLikeUnlikeMemory";
import colors from "src/config/colors";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import useDownloadFile from "../../functionality/downloadMedia";
import DownloadProgressComponent from "../download/DownloadProgressComponent";
import UsersReactions from "./UsersReactions";
import typography from "@/config/typography";
import getTimeAgo from "@/services/timeAgo";
import { BlurView } from "expo-blur";
type MemoriesContentsProps = {
  memory?: Memorytype;
  lastIndex?: boolean;
  memories: Memorytype[];
  is_expired: boolean;
  memory_id?: string;
  setStoriesVisible: any;
  setStartingIndex: any;
  setShouldScrollToLast: any;
  shouldScrollToLast: any;
  handlePresentModal?: any;
  eventName: string;
  hasPrompts: boolean;
};
const MemoriesContents: React.FC<MemoriesContentsProps> = ({
  memories,
  is_expired,
  memory_id,
  setStoriesVisible,
  setStartingIndex,
  setShouldScrollToLast,
  shouldScrollToLast,
  handlePresentModal,
  eventName,
  hasPrompts,
}) => {
  const [showMemoryOptions, setShowMemoryOptions] = useState<boolean>(false);
  const [selectedMemory, setSelectedMemory] = useState<Memorytype | undefined>(
    undefined
  );
  const [dynamicStyle, setDynamicStyle] = useState<any>();
  const currentUser = useFetchUserDataAsync();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const delete_memory = async () => {
    if (currentUser && selectedMemory !== undefined) {
      const response = await deleteMemory(
        [selectedMemory._id],
        currentUser.token
      );
      if (response === true) {
        setShowMemoryOptions(false);
      }
    }
  };
  const scrollViewRef = useRef<FlatList>(null);

  const reversedMemories = useMemo(() => {
    return [...memories].reverse();
  }, [memories]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, dynamicStyle]}>
        <FlatList
          inverted
          // contentContainerStyle={{ flexDirection: "column-reverse" }}
          ref={scrollViewRef}
          data={reversedMemories}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Memory
              memory={item}
              index={index}
              memoriesLength={memories.length}
              showMemoryOptions={showMemoryOptions}
              setShowMemoryOptions={setShowMemoryOptions}
              setSelectedMemory={setSelectedMemory}
              currentUser={currentUser}
              lastIndex={index === memories.length - 1 ? true : false}
              setStoriesVisible={setStoriesVisible}
              setStartingIndex={setStartingIndex}
            />
          )}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={[
            {
              paddingHorizontal: 10,
              paddingBottom: 10,
            },
            hasPrompts && { paddingBottom: 90 },
          ]}
          // getItemLayout={(data, index) => ({
          //   length: 260,
          //   offset: 260 * index,
          //   index,
          // })}
        />

        {showMemoryOptions && (
          <MemoryOptions
            selectedMemory={selectedMemory}
            currentUser={currentUser}
            setShowMemoryOptions={setShowMemoryOptions}
            delete_memory={delete_memory}
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
            eventName={eventName}
            handlePresentModal={handlePresentModal}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const Memory: React.FC<any> = ({
  memory,
  showMemoryOptions,
  setShowMemoryOptions,
  setSelectedMemory,
  currentUser,
  lastIndex,
  index,
  setStoriesVisible,
  setStartingIndex,
  memoriesLength,
}: {
  memory: Memorytype;
  showMemoryOptions: boolean;
  setSelectedMemory: any;
  setShowMemoryOptions: (showMemoryOptions: boolean) => void;
  currentUser: CurrentUserType;
  lastIndex: boolean;
  index: number;
  setStoriesVisible: any;
  setStartingIndex: any;
  memoriesLength: number;
}) => {
  const timeAgo = memory.createdAt != undefined ? getTimeAgo(memory) : "now";
  const isCreator = memory?.created_by?._id === currentUser?._id;
  const isImage = memory?.memory_type === "image" ? true : false;
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
  return (
    <View
      style={[
        styles.memoryContainer,
        isCreator && { justifyContent: "flex-end" },
        // lastIndex ? { marginBottom: 150 } : {},
        memoriesLength === 1 && { top: 120 },
        index === 0 ? { marginBottom: 150 } : {},
      ]}
    >
      {!isCreator && (
        <Image
          source={{ uri: `${memory.created_by.profile}` }}
          style={[styles.userPhoto, { marginRight: 10 }]}
          placeholder={blurhash}
        />
      )}

      <Pressable
        style={[
          {
            flex: 1,
            alignItems: isCreator ? "flex-end" : "flex-start",
          },
        ]}
        onPress={() => {
          setStartingIndex(memoriesLength - 1 - index), setStoriesVisible(true);
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setShowMemoryOptions(!showMemoryOptions);
          setSelectedMemory(memory);
        }}
      >
        <View
          style={{
            backgroundColor: colors.__secondary_background,
            borderRadius: 10,
          }}
        >
          <View
            style={[
              { top: 10, flexDirection: "row", alignItems: "flex-end" },
              isCreator ? { justifyContent: "flex-end" } : {},
            ]}
          >
            <Text style={styles.userName}>{memory.created_by.user_name} </Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          {isImage ? (
            <Image
              source={{ uri: memory.media_file }}
              style={[
                styles.memoryImage,
                !memory.caption && {
                  // Object.keys(memory.reactions_summary).length === 0 &&
                  borderRadius: 10,
                },
              ]}
              contentFit="cover"
              placeholder={blurhash}
            />
          ) : (
            <View>
              <View style={[styles.playButton, { left: 75 }]}>
                <AntDesign name="playcircleo" size={44} color="white" />
              </View>
              <Video
                source={{ uri: memory.media_file }}
                style={[
                  styles.memoryImage,
                  !memory.caption && {
                    // Object.keys(memory.reactions_summary).length === 0 &&
                    borderRadius: 10,
                  },
                ]}
                resizeMode={ResizeMode.COVER}
              />
            </View>
          )}

          {memory.caption && (
            <View style={styles.captionLikeContainer}>
              <Text style={{ maxWidth: 155 }}>
                {memory.caption.length > 80
                  ? memory.caption.slice(0, 80) + "..."
                  : memory.caption}
              </Text>
            </View>
          )}
          {/* {Object.keys(memory.reactions_summary).length > 0 && (
            <UsersReactions memory={memory} />
          )} */}
        </View>
        {Object.keys(memory.reactions_summary).length > 0 && (
          <View style={!memory.caption ? { top: 20 } : { top: 15 }}>
            <UsersReactions memory={memory} />
          </View>
        )}
      </Pressable>

      {isCreator && (
        <Image
          source={{ uri: `${memory.created_by.profile}` }}
          style={[styles.userPhoto, { marginLeft: 10 }]}
          placeholder={blurhash}
        />
      )}
    </View>
  );
};

const MemoryOptions: React.FC<any> = ({
  memory,
  selectedMemory,
  currentUser,
  setShowMemoryOptions,
  delete_memory,
  isDownloading,
  setIsDownloading,
  eventName,
  handlePresentModal,
}: {
  memory: Memorytype;
  selectedMemory: Memorytype;
  currentUser: CurrentUserType;
  setShowMemoryOptions: (showMemoryOptions: boolean) => void;
  delete_memory: () => void;
  isDownloading: boolean;
  setIsDownloading: (isDownloading: boolean) => void;
  eventName: string;
  handlePresentModal: any;
}) => {
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
  const isImage = selectedMemory?.memory_type === "image" ? true : false;
  const likeUnlike = async (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Ensure that you have a valid memory ID and user token before calling the API
    if (selectedMemory && currentUser) {
      // setIsLiked(!isLiked);
      const success = await toggleLikeUnlikeMemory(
        selectedMemory._id,
        currentUser.token,
        type
      );
      if (success) {
        setShowMemoryOptions(false);
      }
    }
  };

  // Array of emoji Lottie files - add your file names here
  const emojiReactions = [
    {
      source: require("../../../assets/lottie/heart.json"),
      type: "Heart",
    },
    {
      source: require("../../../assets/lottie/fire.json"),
      type: "Fire",
    },
    {
      source: require("../../../assets/lottie/laugh.json"),
      type: "Laugh",
    },
    {
      source: require("../../../assets/lottie/mind_blowing.json"),
      type: "Mind_Blowing",
    },
    {
      source: require("../../../assets/lottie/top.json"),
      type: "Top",
    },
  ];

  const renderEmoji = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => likeUnlike(item.type)}
      style={{ alignSelf: "center" }}
    >
      <LottieView
        source={item.source}
        autoPlay
        loop
        style={styles.emojiStyle}
      />
    </TouchableOpacity>
  );

  const isCreator = selectedMemory?.created_by?._id === currentUser?._id;
  const urls = React.useMemo(
    () => [selectedMemory?.media_file],
    [selectedMemory?.media_file]
  );

  const { downloadAllFiles, progress, error, resetDownloads } = useDownloadFile(
    urls,
    eventName
  );
  const handleDownload = async () => {
    setIsDownloading(true);
    const success = await downloadAllFiles();
    if (success) {
      setTimeout(() => {
        setIsDownloading(false);
        setShowMemoryOptions(false);
      }, 2000);
    }
  };
  const handleRetry = () => {
    resetDownloads();
    handleDownload();
  };
  return (
    <Pressable
      style={styles.memoryOptionsWrapper}
      onPress={() => {
        setShowMemoryOptions(false);
      }}
    >
      <BlurView style={styles.memoryOptionsBlur} intensity={40}>
        {!isDownloading ? (
          <View style={[styles.memoryOptionsContainer]}>
            <View style={styles.emojiContainer}>
              <FlatList
                data={emojiReactions}
                horizontal
                renderItem={renderEmoji}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                style={styles.emojisList}
              />
            </View>
            {selectedMemory && isImage && (
              <Image
                source={{ uri: selectedMemory.media_file }}
                style={styles.memoryPreview}
                placeholder={blurhash}
              />
            )}
            {selectedMemory && !isImage && (
              <View>
                <View style={[styles.playButton, { left: "25%", top: "40%" }]}>
                  <AntDesign name="playcircleo" size={40} color="white" />
                </View>
                <Video
                  source={{ uri: selectedMemory.media_file }}
                  style={[styles.memoryPreview]}
                  resizeMode={ResizeMode.COVER}
                />
              </View>
            )}

            <View style={styles.reportContainer}>
              {isCreator && (
                <TouchableOpacity style={styles.option} onPress={delete_memory}>
                  <AntDesign name="delete" size={21} color="black" />
                  <Text style={styles.optionText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  handlePresentModal(
                    selectedMemory._id,
                    selectedMemory.created_by._id,
                    "memory"
                  );
                }}
              >
                <Feather name="alert-triangle" size={21} color="black" />
                <Text style={styles.optionText}>Report Content</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={handleDownload}>
                <Feather name="download" size={21} color="black" />
                <Text style={styles.optionText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <DownloadProgressComponent
            progress={progress}
            error={error}
            onRetry={handleRetry}
          />
        )}
      </BlurView>
    </Pressable>
  );
};
export default memo(MemoriesContents);

const styles = StyleSheet.create({
  memoryOptionsWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },
  memoryOptionsBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  memoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    rowGap: 7,
    paddingTop: 15,
    flex: 1,
    marginBottom: 40,

    // height: 205,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  memoryImage: {
    width: 200,
    height: 259,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    top: 20,
  },
  memoryOptionsContainer: {
    // backgroundColor: "red",
    alignSelf: "center",
    width: "80%",
    borderRadius: 20,
    padding: 40,
    top: "-10%",
  },
  emojiContainer: {
    backgroundColor: "white",
    height: 50,
    // width: 300,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emojiStyle: {
    width: 30,
    height: 30,
    marginRight: 8,
    marginLeft: 8,
  },

  emojisList: {
    flexDirection: "row",
    // Add other styling as necessary
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  optionText: {
    fontSize: 17,
  },
  captionLikeContainer: {
    padding: 8,
    gap: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: -15,
  },

  createPostContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  createPostButton: {
    padding: 10,
    borderColor: "#E1E1E1",
    backgroundColor: "rgba(41, 182, 246, 0.1)",
    borderWidth: 1,
    alignItems: "center",
    width: 150,
    alignSelf: "center",
    borderRadius: 30,
  },
  playButton: {
    position: "absolute",
    left: 65,
    top: "50%",
    zIndex: 10000,
  },
  userName: {
    fontFamily: typography.appFont[600],
    fontSize: 13,
  },
  timeAgo: {
    fontSize: 12,
  },
  memoryPreview: {
    width: 160,
    height: 235,
    borderRadius: 10,
    marginBottom: 10,
  },
});
