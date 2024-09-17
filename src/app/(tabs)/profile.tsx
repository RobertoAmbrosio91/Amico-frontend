import React, { useEffect, useState, useRef, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Animated,
} from "react-native";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import fetchUserData from "../../hooks/users/fetchUserData";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import colors from "src/config/colors";
import Header from "@/components/header/header";
import { EventType, Friend, UserData } from "@/types";
import fetchUserEvents from "@/hooks/events/fetchUserEvents";
import SingleEventStoriesCarousel from "@/components/events/single event/SingleEventStoriesCarousel";
import fetchAllFriends from "@/hooks/users/fetchAllFriends";
import { Image } from "expo-image";
import typography from "@/config/typography";
import EventComponent from "@/components/events/EventItemNew";
import NoEvents from "@/components/events/NoEvents";
import { groupEvents } from "@/services/groupEventsByDate";
import ProfileLoadingScreen from "@/components/Loading/ProfileLoading";
import ErrorScreen from "../Errors/ErrorScreen";

const PersonalProfileNew = () => {
  const currentUser = useFetchUserDataAsync();
  const [userData, setUserData] = useState<UserData | null | undefined>(null);
  const [page, setPage] = useState(0);
  const [eventData, setEventData] = useState<EventType>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean | null>(null);
  const [myEvents, setMyEvents] = useState<EventType[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<EventType[]>([]);
  const [storiesVisible, setStoriesVisible] = useState<boolean>(false);
  const [startingIndex, setStartingIndex] = useState<number>(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const groupedEvents = groupEvents(myEvents);
  const onRefresh = () => {
    setRefreshing(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setRefreshing(false);
      setIsLoading(true);
      try {
        setTimeout(() => {}, 1000);
        // Fetch user data
        const fetchedUserData = await fetchUserData(
          currentUser._id,
          currentUser.token
        );
        setUserData(fetchedUserData);

        // Fetch user events
        const events = await fetchUserEvents(currentUser.token);
        if (events && events.length > 0) {
          setMyEvents(events);
          const groupEv = groupEvents(events);
          setDisplayedEvents(groupEv.past.slice(0, 2));
        }

        // Fetch friends if userData is updated and friends list exists
        if (fetchedUserData && fetchedUserData.friends) {
          let fetchedFriends = await fetchAllFriends(
            fetchedUserData.friends,
            currentUser.token
          );
          fetchedFriends = fetchedFriends.map((friend) => ({
            ...friend,
            isCloseFriend: fetchedUserData.close_friends.includes(friend._id),
          }));
          setFriends(fetchedFriends);
        }
      } catch (error) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, refreshing]);

  const handleLoadMore = () => {
    const nextEvents = groupedEvents.past.slice(
      displayedEvents.length,
      displayedEvents.length + 2
    );
    setDisplayedEvents([...displayedEvents, ...nextEvents]);
  };
  //bottomSheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  function handlePresentModal() {
    bottomSheetModalRef.current?.present();
  }
  //handle animation for profile image and username
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, 190],
    outputRange: [0, -170],
    extrapolate: "clamp",
  });
  const translateYName = scrollY.interpolate({
    inputRange: [0, 190],
    outputRange: [0, -150],
    extrapolate: "clamp",
  });
  const scale = scrollY.interpolate({
    inputRange: [0, 190],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateYMemories = scrollY.interpolate({
    inputRange: [0, 190],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });
  const textColorInterpolation = scrollY.interpolate({
    inputRange: [0, 190],
    outputRange: ["#000", colors.__secondary_background],
    extrapolate: "clamp",
  });
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.setValue(y);
  };

  if (isLoading) return <ProfileLoadingScreen />;
  if (error)
    return (
      <ErrorScreen state={error} setState={setError} onRefresh={onRefresh} />
    );
  return (
    <SafeAreaView style={styles.safe_area}>
      {userData && (
        <View style={{ flex: 1 }}>
          <View>
            <Header />
          </View>
          {userData && (
            <ProfileImage
              userData={userData}
              myEvents={myEvents}
              translateY={translateY}
              scale={scale}
              translateYName={translateYName}
              textColor={textColorInterpolation}
            />
          )}
          <View style={styles.userDataContainer}>
            {displayedEvents.length > 0 ? (
              <Animated.View
                style={{
                  transform: [{ translateY: translateYMemories }],
                }}
              >
                <View>
                  <Text style={styles.myMemories}>Your Past Memories</Text>
                </View>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={displayedEvents}
                  renderItem={({ item: event, index }) => (
                    <View
                      style={
                        index === groupedEvents.past.length - 1 && {
                          marginBottom: 150,
                        }
                      }
                    >
                      <EventComponent
                        events={event}
                        // navigationPath={(id) => `/event/${id}`}
                      />
                    </View>
                  )}
                  keyExtractor={(event) => event._id}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              </Animated.View>
            ) : (
              <NoEvents />
            )}
          </View>

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
        </View>
      )}
    </SafeAreaView>
  );
};
const ProfileImage = ({
  userData,
  myEvents,
  translateY,
  scale,
  translateYName,
  textColor,
}: {
  userData: any;
  myEvents: EventType[];
  translateY: any;
  translateYName: any;
  scale: any;
  textColor: any;
}) => {
  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <Animated.View
      // style={[styles.userDetails, { transform: [{ translateY }, { scale }] }]}
      style={[styles.userDetails]}
    >
      <Animated.View
        style={[styles.userDetails, { transform: [{ translateY }, { scale }] }]}
      >
        <Image source={{ uri: userData.profile }} style={styles.profileImage} />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ translateY: translateYName }], rowGap: 5 }}
      >
        <AnimatedText style={[styles.firstName, { color: textColor }]}>
          {userData.first_name}
        </AnimatedText>
        <AnimatedText style={[styles.userName, { color: textColor }]}>
          @{userData.user_name}
        </AnimatedText>
      </Animated.View>

      <Animated.View
        style={[styles.details, { transform: [{ translateY }, { scale }] }]}
      >
        <View style={styles.detailsContainer}>
          <Text
            style={[
              styles.detailsText,
              { fontFamily: typography.appFont[600] },
            ]}
          >
            {userData.friends.length}
          </Text>
          <Text style={styles.detailsText}>
            {userData.friends.length > 1 ? "Amicos" : "Amico"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text
            style={[
              styles.detailsText,
              { fontFamily: typography.appFont[600] },
            ]}
          >
            {myEvents.length}
          </Text>
          <Text style={styles.detailsText}>
            {myEvents.length > 1 ? "Events" : "Event"}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
    backgroundColor: colors.__main_background,
    width: "100%",
    alignSelf: "center",
    paddingTop: Platform.OS === "android" ? "18%" : 0,
  },
  container: {
    flex: 1,
    paddingBottom: Platform.OS != "web" ? 60 : 0,
    backgroundColor: colors.__main_background,
  },
  profileImage: {
    width: 138,
    height: 138,
    borderRadius: 100,
  },
  userDataContainer: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    paddingTop: "24%",
    top: "17%",
    overflow: "hidden",
    width: 850,
    height: "100%",
    backgroundColor: colors.__secondary_background,
    borderTopLeftRadius: 425,
    borderTopRightRadius: 425,
  },
  userDetails: {
    alignSelf: "center",
    alignItems: "center",
    rowGap: 10,
    top: "5%",
    zIndex: 10,
  },
  firstName: {
    fontFamily: typography.appFont[600],
    fontSize: 20,
  },
  userName: {
    fontSize: 15,
    fontFamily: typography.appFont[400],
    top: -5,
    textAlign: "center",
  },
  details: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: "30%",
    justifyContent: "space-between",
  },
  detailsContainer: {
    alignItems: "center",
  },
  detailsText: {
    fontFamily: typography.appFont[400],
    fontSize: 15,
  },
  myMemories: {
    fontFamily: typography.appFont[700],
    fontSize: 16,
    marginBottom: 5,
  },
});

export default PersonalProfileNew;
