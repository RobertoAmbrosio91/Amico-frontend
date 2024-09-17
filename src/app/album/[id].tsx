import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from "react-native";
import React, { memo, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { EventType, Memorytype } from "@/types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";
import typography from "src/config/typography";
import colors from "src/config/colors";
import SingleEventStoriesCarousel from "@/components/events/single event/SingleEventStoriesCarousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useEventMemoriesSocket from "@/hooks/sockets/useEventMemoriesSocket";
import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import MemoriesContents from "@/components/events/MemoriesContents";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import DownloadProgressComponent from "@/components/download/DownloadProgressComponent";
import useDownloadFiles from "@/services/downloadMedia";
import LoadingScreen from "@/components/homeloading/LoadingScreen";
import EventHeaderComponent from "@/components/events/EventHeaderComponent";

const Album: React.FC = () => {
  const router = useRouter();
  const { id, memory_id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const memoryId = Array.isArray(memory_id) ? memory_id[0] : memory_id;
  const currentUser = useFetchUserDataAsync();
  const [eventData, setEventData] = useState<EventType>();
  const [selectable, setSelectable] = useState<boolean>(false);
  const [memories, setMemories] = useState<Memorytype[]>([]);
  const [storiesVisible, setStoriesVisible] = useState<boolean>(false);
  const [startingIndex, setStartingIndex] = useState<number>(0);
  const [shouldScrollToLast, setShouldScrollToLast] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("album");
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //fetching event data
  useEffect(() => {
    if (currentUser && eventId) {
      try {
        setIsLoading(true);
        const fetchEventData = async () => {
          const fetchedEventData = await fetchSingleEvent(
            eventId,
            currentUser.token
          );
          if (fetchedEventData) {
            setEventData(fetchedEventData);
            setShowAlert(fetchedEventData.is_expired);
            if (fetchedEventData.memories) {
              setMemories(fetchedEventData.memories);
            } else {
              setMemories([]);
            }
            setIsLoading(false);
          }
        };
        fetchEventData();
      } catch (error: any) {
        console.log(error);
      }
    }
  }, [currentUser]);
 
  //handle memories selection
  const handleMemorySelection = (memory: Memorytype) => {
    if (selectedMemories.includes(memory.media_file)) {
      setSelectedMemories((prevMemories) =>
        prevMemories.filter((media_file) => media_file !== memory.media_file)
      );
    } else {
      setSelectedMemories((prevMemories) => [
        ...prevMemories,
        memory.media_file,
      ]);
    }
  };
  const closeAndReset = () => {
    setSelectedMemories([]);
    setSelectable(!selectable);
  };
 
  //calling memories socket
  useEventMemoriesSocket(setEventData, eventId);
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (eventData !== undefined) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.wrapper}>
        <EventHeaderComponent
                    eventData={eventData}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                  />

          {activeSection === "album" && (
            <MediaAlbum
              memories={memories}
              token={currentUser?.token}
              setStartingIndex={setStartingIndex}
              setStoriesVisible={setStoriesVisible}
              setSelectable={setSelectable}
              selectable={selectable}
              handleMemorySelection={handleMemorySelection}
              selectedMemories={selectedMemories}
              closeAndReset={closeAndReset}
              eventName={eventData.name}
            />
          )}
 
          {activeSection === "memories" && (
            <MemoriesContents
              memories={eventData.memories}
              is_expired={eventData.is_expired}
              memory_id={memoryId}
              setStoriesVisible={setStoriesVisible}
              setStartingIndex={setStartingIndex}
              shouldScrollToLast={shouldScrollToLast}
              setShouldScrollToLast={setShouldScrollToLast}
              eventName={eventData.name}
            />
          )}
 
          {storiesVisible && (
            <View
              style={{
                flex: 1,
                position: "absolute",
              }}
            >
              <SingleEventStoriesCarousel
                event={eventData}
                setStoriesVisible={setStoriesVisible}
                startingIndex={startingIndex}
              />
            </View>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
};
 
const MediaAlbum: React.FC<any> = ({
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
                : {},
            ]}
            textStyle={[
              styles.downloadButtonText,
              selectedMemories.length === 0
                ? { color: colors.__main_text_color }
                : {},
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
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
};
export default memo(Album);


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background
  },
  eventNameContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  eventName: {
    color: colors.__main_text,
    fontFamily: typography.appFont[600],
    fontSize: 16,
    maxWidth: 220,
    alignSelf: "center",
  },
  eventDescr: {
    color: colors.__main_text,
    fontFamily: typography.appFont[400],
    fontSize: 13,
  },
  eventImage: {
    width: 42,
    height: 42,
    borderRadius: 20,
  },
  headerWrapper: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    columnGap: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  gobackIcon: {
    padding: 5,
    zIndex: 1,
  },
  eventParticipantsContainer: {
    flexDirection: "column",
    gap: 15,
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "gray",
  },
  eventParticipantsContainerText: {
    fontSize: 15,
    fontFamily: typography.appFont[400],
  },
  eventParticipantsContainerIn: {
    flexDirection: "column",
    marginRight: -15,
    alignItems: "center",
    rowGap: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderWidth: 0.5,
    borderColor: "white",
    borderRadius: 10,
  },
  friendImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendName: {
    fontSize: 12,
    fontFamily: typography.appFont[400],
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5,
  },
  iconContainerTouch: {
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  iconContainerTouchActive: {
    borderRadius: 20,
    backgroundColor: "#E3E8ED",
    padding: 5, // Increase padding to enlarge touchable area
    zIndex: 1, // E
  },
  selected: {
    position: "absolute",
    top: 7,
    right: 7,
    zIndex: 10,
  },
 
  text: {
    color: colors.__main_text_color,
    fontSize: 16,
    alignSelf: "center",
    paddingVertical: 10,
    fontWeight: "600",
  },
  inputText: {
    color: colors.__main_text_color,
    fontSize: 16,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: colors.__background_input,
    borderColor: "transparent",
    color: colors.__main_text_color,
    borderRadius: 10,
  },
  inputCaption: {
    backgroundColor: colors.__background_input,
    borderColor: "transparent",
    color: colors.__main_text_color,
    borderRadius: 10,
    height: 150,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    paddingBottom: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 50,
    paddingHorizontal: 10,
  },
  imageMedia: {
    width: 140,
    height: 200,
    borderRadius: 10,
    marginLeft: 10,
  },
  playButton: {
    position: "absolute",
    left: 58,
    top: "40%",
    zIndex: 10000,
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
    color: colors.__main_background,
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
  singlePhotoContainer:{
    width: "50%",
    padding: 3,
  }
});