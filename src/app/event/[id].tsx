import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  Share,
} from "react-native";
import React, { memo, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { EventType, Memorytype, Prompt } from "@/types";
import { Feather } from "@expo/vector-icons";
import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";
import typography from "src/config/typography";
import MemoriesContents from "@/components/events/MemoriesContents";
import EventChat from "@/components/events/EventChat";
import colors from "src/config/colors";
import SingleEventStoriesCarousel from "@/components/events/single event/SingleEventStoriesCarousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useEventMemoriesSocket from "@/hooks/sockets/useEventMemoriesSocket";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import CameraComponent from "@/components/camera/NewCamera";
import EventHeaderComponent from "@/components/events/EventHeaderComponent";
import MemoriesAlbum from "@/components/events/MemoriesAlbum";
import ReportContent from "@/components/bottomSheets/ReportContent";
import CreateRecapAlert from "@/components/events/single event/CreateRecapAlert";
import CameraPrompts from "@/components/camera/CameraPrompts";
import PromptModal from "@/components/bottomSheets/PromptModal";
import PromptList from "@/components/events/prompts/PromptList";
import CustomButton from "@/components/buttons&inputs/CustomButton";

const SelectedEvent: React.FC = () => {
  const router = useRouter();
  const { id, memory_id, prevRoute } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const memoryId = Array.isArray(memory_id) ? memory_id[0] : memory_id;
  const currentUser = useFetchUserDataAsync();
  const [eventData, setEventData] = useState<EventType>();
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("memories");
  const [memories, setMemories] = useState<Memorytype[]>([]);
  const [storiesVisible, setStoriesVisible] = useState<boolean>(false);
  const [startingIndex, setStartingIndex] = useState<number>(0);
  const [shouldScrollToLast, setShouldScrollToLast] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectable, setSelectable] = useState<boolean>(false);
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>();
  const [isPromptReply, setIsPromptReply] = useState<boolean>(false);
  const [currentPostCreator, setCurrentPostCreator] = useState<
    string | undefined
  >();
  const [currentPostId, setCurrentPostId] = useState<string | undefined>();
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
  useEffect(() => {
    if (currentUser && eventId) {
      try {
        const fetchEventData = async () => {
          const fetchedEventData = await fetchSingleEvent(
            eventId,
            currentUser.token
          );
          if (fetchedEventData) {
            setEventData(fetchedEventData);
            // setIsCameraOpen(fetchedEventData.is_expired ? false : true);
            setShowAlert(fetchedEventData.is_expired);
            if (fetchedEventData.memories) {
              setMemories(fetchedEventData.memories);
            } else {
              setMemories([]);
            }
          }
        };
        fetchEventData();
      } catch (error: any) {
        console.log("Something went wrong fetching the event data", error);
      }
    }
  }, [currentUser]);
  //calling memories socket
  useEventMemoriesSocket(setEventData, eventId);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const promptModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModal = (
    postId: string,
    postCreator: string,
    report_type: string
  ) => {
    setReportType(report_type);
    setCurrentPostId(postId);
    setCurrentPostCreator(postCreator);
    bottomSheetModalRef.current?.present();
  };
  const handlePresentPromptModal = () => {
    promptModalRef.current?.present();
  };
  function navigate() {
    if (prevRoute === "/createevent") {
      return router.push("/myeventsrevisited");
    } else if (prevRoute?.includes("/amicoevent/")) {
      return router.push("/myeventsrevisited");
    } else {
      return router.back();
    }
  }

  if (eventData !== undefined) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.wrapper}>
          <BottomSheetModalProvider>
            {!isCameraOpen && (
              <View style={{ flex: 1 }}>
                <EventHeaderComponent
                  eventData={eventData}
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  navigate={navigate}
                  prevRoute={prevRoute}
                  handlePresentPromptModal={handlePresentPromptModal}
                  setSelectedPrompt={setSelectedPrompt}
                />

                {
                  activeSection === "memories" && (
                    // eventData.memories.length > 0 && (
                    <View style={styles.memoriesWrapper}>
                      {eventData.prompts && eventData.prompts.length > 0 && (
                        <PromptList
                          prompts={eventData.prompts}
                          setSelectedPrompt={setSelectedPrompt}
                          presentPromptModal={handlePresentPromptModal}
                        />
                      )}

                      <MemoriesContents
                        memories={eventData.memories}
                        is_expired={eventData.is_expired}
                        memory_id={memoryId}
                        setStoriesVisible={setStoriesVisible}
                        setStartingIndex={setStartingIndex}
                        shouldScrollToLast={shouldScrollToLast}
                        setShouldScrollToLast={setShouldScrollToLast}
                        handlePresentModal={handlePresentModal}
                        eventName={eventData.name}
                        hasPrompts={
                          eventData.prompts && eventData.prompts.length > 0
                        }
                      />
                    </View>
                  )
                  // )
                }

                {activeSection !== "chat" &&
                  !eventData.is_expired &&
                  !isPromptReply && (
                    <TouchableOpacity
                      style={styles.addMemoryContainer}
                      onPress={() => setIsCameraOpen(true)}
                    >
                      <Feather
                        name="camera"
                        size={35}
                        color={colors.w_contrast}
                      />
                      <Text style={[styles.addMemory]}>Add Memory</Text>
                    </TouchableOpacity>
                  )}
                {activeSection === "chat" && eventData.chat_room_data._id && (
                  <EventChat chatRoomId={eventData.chat_room_data._id} />
                )}
                {activeSection === "album" && (
                  <MemoriesAlbum
                    memories={eventData.memories}
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
              </View>
            )}
            {isCameraOpen && (
              // <CameraComponent
              //   setIsCameraOpen={setIsCameraOpen}
              //   eventId={eventData._id}
              //   setShouldScrollToLast={setShouldScrollToLast}
              //   eventData={eventData}
              // />
              <CameraPrompts
                setIsCameraOpen={setIsCameraOpen}
                eventId={eventData._id}
                setShouldScrollToLast={setShouldScrollToLast}
                eventData={eventData}
                isPromptReply={isPromptReply}
                promptName={selectedPrompt?.name}
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
            {showAlert && eventData.memories.length >= 6 && (
              <CreateRecapAlert
                setShowAlert={setShowAlert}
                eventId={eventData._id}
                // handlePresentModal={handlePresentModal}
              />
            )}
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={0}
              snapPoints={["52%"]}
              backgroundStyle={{
                backgroundColor: colors.__secondary_background,
                borderColor: colors.__secondary_text_color,
                borderWidth: 1,
              }}
            >
              <ReportContent
                current_post_id={currentPostId}
                currentPostCreator={currentPostCreator}
                currentUser={currentUser}
                reportType={reportType}
                setIsMessageVisible={setIsMessageVisible}
                isMessageVisible={isMessageVisible}
                handleDismissModal={() =>
                  bottomSheetModalRef.current?.dismiss()
                }
                bottomSheetModalRef={bottomSheetModalRef}
              />
            </BottomSheetModal>
            <BottomSheetModal
              ref={promptModalRef}
              index={0}
              snapPoints={["80%"]}
              backgroundStyle={{
                backgroundColor: colors.__secondary_background,
                borderColor: colors.__secondary_text_color,
                borderWidth: 1,
              }}
              onChange={() => setIsPromptReply(!isPromptReply)}
            >
              <PromptModal
                selectedPrompt={selectedPrompt}
                memories={eventData.memories.filter((memory) =>
                  selectedPrompt?.memories_id.includes(memory._id)
                )}
                setIsCameraOpen={setIsCameraOpen}
              />
            </BottomSheetModal>
          </BottomSheetModalProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
};

export default memo(SelectedEvent);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? "5%" : 0,
  },
  eventNameContainer: {
    backgroundColor: "red",
  },
  eventName: {
    color: colors.__main_text_color,
    fontFamily: typography.appFont[700],
    fontSize: 18,
    maxWidth: 280,
  },
  addMemory: {
    color: colors.__main_text_color,
    fontFamily: typography.appFont[600],
    fontSize: 13,
  },
  eventImage: {
    width: 42,
    height: 42,
    borderRadius: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "red",
  },
  headerWrapper: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    columnGap: 10,
    padding: 14,
  },
  addMemoryContainer: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: colors.__amico_blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    rowGap: 3,
    zIndex: 10,
    elevation: 4,
  },
  sectionOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    padding: 3,
    height: 40,
    // columnGap: 20,
    width: 250,
    alignSelf: "center",
    borderRadius: 30,
  },
  textContainer: {
    flexDirection: "row",
    columnGap: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  textContainerSelected: {
    backgroundColor: colors.__logo_color,
  },
  eventParticipantsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10,
    width: "70%",
  },
  participantsContentContainer: {
    justifyContent: "center",
  },
  eventParticipantsContainerText: {
    fontSize: 13,
    fontFamily: typography.appFont[400],
    color: "rgba(255, 255, 255, 0.80);",
  },
  eventParticipantsContainerIn: {
    flexDirection: "column",
    marginRight: -15,
    alignItems: "center",
    rowGap: 3,
    alignSelf: "center",
  },
  friendImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.__main_background,
  },
  memoriesWrapper: {
    flex: 1,
    backgroundColor: colors.__secondary_background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});