import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  RefreshControl,
  FlatList,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../config/typography";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { EventType } from "../../types";
import fetchUserEvents from "@/hooks/events/fetchUserEvents";
import { groupEvents } from "../../functionality/groupEventsByDate";
import Header from "@/components/header/header";
import colors from "@/config/colors";
import ErrorScreen from "../Errors/ErrorScreen";
import fetchAllPublicEvents from "@/hooks/events/fetchAllPublicEvents";
import LiveEvents from "@/components/stories/LiveEvents";
import NoEvents from "@/components/events/NoEvents";
import StoriesContainer from "@/components/events/stories/StoriesContainer";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import ReportContent from "@/components/bottomSheets/ReportContent";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useCheckTokenValidity from "../../utility/useCheckTokenValidity";
import useFriendRequestsSocket from "@/hooks/sockets/useFriendRequestsSocket";
import useFeedSocket from "@/hooks/sockets/useFeedSocket";
import useMyEventsSocket from "@/hooks/sockets/useMyEventsSocket";
import EventComponent from "@/components/events/EventItemNew";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import LoadingScreen from "@/components/homeloading/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";

const MyEvents: React.FC<any> = () => {
  const currentUser = useFetchUserDataAsync();
  const [myEvents, setMyEvents] = useState<EventType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  // const [visibility, setVisibility] = useState<string>("live");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("live");
  const groupedEvents = groupEvents(myEvents);
  const [storiesVisible, setStoriesVisible] = useState<any>(false);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>();
  const [reportType, setReportType] = useState<string>("");
  const [currentPostCreator, setCurrentPostCreator] = useState<
    string | undefined
  >();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [startingIndex, setStartingIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const ITEM_WIDTH = Dimensions.get("window").width - 30;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  //calling sockets
  useFriendRequestsSocket();
  useFeedSocket(setEvents);
  useCheckTokenValidity();
  useMyEventsSocket(setMyEvents);
  const onRefresh = () => {
    setRefreshing(true);
  };
  useEffect(() => {
    const fetchEventsData = async () => {
      setIsLoading(true);
      if (currentUser) {
        setError(false);
        setRefreshing(false);
        try {
          const events = await fetchUserEvents(currentUser.token);
          if (events && events?.length > 0) {
            setMyEvents(events);
          }
          const fetchedEvents = await fetchAllPublicEvents(currentUser.token);
          if (fetchedEvents) {
            setEvents(fetchedEvents);
          }
        } catch (error) {
          setError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchEventsData();
  }, [currentUser, refreshing]);

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

  useEffect(() => {
    if (groupedEvents.live) {
      setTotalPages(groupedEvents.live.length);
    }
  }, [groupedEvents.live]);

  const renderPaginationDots = () => {
    let dots = [];
    for (let i = 0; i < totalPages; i++) {
      dots.push(
        <View
          key={i}
          style={[styles.dot, currentPage === i && styles.activeDot]}
        />
      );
    }
    return dots;
  };
  const handleScroll = (event: any) => {
    const { x } = event.nativeEvent.contentOffset;
    const newIndex = Math.floor(x / ITEM_WIDTH);
    if (newIndex !== currentPage) {
      setCurrentPage(newIndex);
    }
  };

  if (error) {
    return (
      <ErrorScreen state={error} setState={setError} onRefresh={onRefresh} />
    );
  }
  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <Header />

          {events && (
            <LiveEvents
              events={events.filter(
                (event: EventType) =>
                  event.memories && event.memories.length > 0
              )}
              setStoriesVisible={setStoriesVisible}
              setStartingIndex={setStartingIndex}
            />
          )}

          <View style={styles.eventsContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Text style={styles.liveEvents}>Your live events</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons name="refresh-outline" size={20} color="black" />
              </TouchableOpacity>
            </View>
            {groupedEvents.live.length > 0 ? (
              <View>
                <FlatList
                  horizontal={true}
                  pagingEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  data={groupedEvents.live}
                  renderItem={({ item: event }) => (
                    <EventComponent
                      events={event}
                      onRefresh={onRefresh}
                      refreshing={refreshing}
                    />
                  )}
                  keyExtractor={(event) => event._id}
                  snapToAlignment="center"
                  decelerationRate="normal"
                  onScroll={handleScroll}
                  // scrollEventThrottle={16}
                  // refreshControl={
                  //   <RefreshControl
                  //     refreshing={refreshing}
                  //     onRefresh={onRefresh}
                  //   />
                  // }
                />
                <View style={styles.paginationContainer}>
                  {renderPaginationDots()}
                </View>
              </View>
            ) : (
              <NoEvents />
            )}

            <Text style={styles.liveEvents}>Your Upcoming Events on Amico</Text>
            <UpcomingEvents events={groupedEvents.upcoming} />
          </View>

          {storiesVisible && (
            <StoriesContainer
              events={events.filter(
                (event: EventType) =>
                  event.memories && event.memories.length > 0
              )}
              setStoriesVisible={setStoriesVisible}
              startingIndex={startingIndex}
              onPresentModal={handlePresentModal}
            />
          )}
        </SafeAreaView>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={["52%"]}
          backgroundStyle={{ backgroundColor: "#F0F0F0" }}
        >
          <ReportContent
            current_post_id={currentPostId}
            currentPostCreator={currentPostCreator}
            currentUser={currentUser}
            reportType={reportType}
            setIsMessageVisible={setIsMessageVisible}
            isMessageVisible={isMessageVisible}
            handleDismissModal={() => bottomSheetModalRef.current?.dismiss()}
            bottomSheetModalRef={bottomSheetModalRef}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 800,
    width: "100%",
    // alignSelf: "center",
    backgroundColor: colors.__main_background,
    flexDirection: "column",
    paddingTop: Platform.OS === "android" ? "15%" : 0,
    // paddingHorizontal: 16,
    rowGap: 15,
  },
  eventAccessibiliy: {
    padding: 4,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#E3E8ED",
    borderRadius: 20,
    justifyContent: "space-around",
    marginBottom: 8,
  },
  visibility_container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    width: "30%",
    alignItems: "center",
  },
  visibility_text: {
    fontFamily: typography.appFont[500],
    color: colors.__blue_dark,
  },
  visibilitySelected: {
    backgroundColor: colors.primary_contrast,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 12,
    // borderRadius: 16,
    width: "30%",
    alignItems: "center",
  },
  visibilityTextSelected: {
    fontFamily: typography.appFont[500],
    color: "#fff",
    fontSize: 14,
  },
  eventsContainer: {
    backgroundColor: colors.__secondary_background,
    height: "67%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 15,
  },

  liveEvents: {
    color: colors.__main_background,
    fontSize: 15,
    marginTop: 10,
    // marginBottom: 10,
    fontWeight: "bold",
  },
  dot: {
    height: 7,
    width: 7,
    borderRadius: 5,
    backgroundColor: "transparent",
    margin: 5,
    borderColor: colors.__main_background,
    borderWidth: 1,
  },
  activeDot: {
    backgroundColor: colors.__amico_blue,
    borderColor: "transparent",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 15,
  },
});
 
export default MyEvents;