import React, { useEffect, useState, useRef, FC, useLayoutEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import UserInfo from "../../components/personal_profile/UserInfo";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import fetchUserData from "../../hooks/users/fetchUserData";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import Loading from "../../components/Loading/Loading";
import fetchUserPostsAndTotals from "../../hooks/posts/fetchUserPostsAndTotals";
import { UserData, Friend, EventType } from "../../types";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import colors from "src/config/colors";
import typography from "src/config/typography";
import checkRequestStatus from "@/hooks/friends/checkRequestStatus";
import UserFriends from "@/components/personal_profile/UserFriends";
import UserContentNew from "@/components/personal_profile/UserContentNew";
import fetchAllFriends from "@/hooks/users/fetchAllFriends";
import { AntDesign } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReportContent from "@/components/bottomSheets/ReportContent";
const PersonalProfileNew = () => {
  const currentUser = useFetchUserDataAsync();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const user_id = id as string;
  const [userData, setUserData] = useState<UserData | null | undefined>(null);
  const [loading, setLoading] = useState(false);
  const [userLikes, setUserLikes] = useState<number | null>(null); // Assuming userLikes is a number
  const [page, setPage] = useState(0);
  const [requestStatus, setRequestStatus] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myEvents, setMyEvents] = useState<EventType[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (userData && userData.friends && currentUser && currentUser.token) {
        let fetchedFriends = await fetchAllFriends(
          userData.friends,
          currentUser.token
        );
        // Update each friend's isCloseFriend property based on currentUser's close_friends
        fetchedFriends = fetchedFriends.map((friend) => ({
          ...friend,
          isCloseFriend: userData.close_friends.includes(friend._id),
        }));
        setFriends(fetchedFriends);
      }
    };

    // Call the async function
    fetchFriends();
  }, [userData, currentUser]); // Don't forget to include dependencies

  const checkRequest = async () => {
    if (
      currentUser?._id &&
      userData?._id &&
      currentUser?._id !== userData._id
    ) {
      try {
        const result = await checkRequestStatus(currentUser.token, [
          currentUser._id,
          userData._id,
        ]);
        setRequestStatus(result);
      } catch (error) {
        console.error("Failed to check request status:", error);
        // Optionally set some state here to indicate the error to the user
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: userData?.first_name });
  }, [userData?.first_name]);

  //fetching user data
  useEffect(() => {
    const fetch_user_data = async () => {
      setLoading(true);
      if (currentUser) {
        const fetchedUserData = await fetchUserData(user_id, currentUser.token);
        setUserData(fetchedUserData);
        setLoading(false);
        checkRequest();
      }
    };
    fetch_user_data();
  }, [currentUser, user_id]);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     if (currentUser) {
  //       const fetchedPosts = await fetchUserPostsAndTotals(
  //         page,
  //         500,
  //         user_id,
  //         currentUser.token
  //       );
  //       setUserLikes(fetchedPosts.total_appreciations);
  //     }
  //   };
  //   fetchPosts();
  // }, [currentUser, user_id]);

  useEffect(() => {
    checkRequest();
  }, [userData, currentUser]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  function handlePresentModal() {
    bottomSheetModalRef.current?.present();
  }

  if (loading) return <Loading />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign
              name="close"
              size={28}
              color={colors.__main_background}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
          {userData && (
            <UserInfo
              userData={userData}
              handlePresentModal={handlePresentModal}
              userLikes={userLikes}
              requestStatus={requestStatus}
            />
          )}
          {/* {friends && friends.length > 0 && <UserFriends friends={friends} />}
      {myEvents && myEvents.length > 0 && (
        <UserContentNew myEvents={myEvents} />
      )} */}
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS != "web" ? 60 : 0,
    paddingTop: Platform.OS === "ios" ? 50 : 80,
    width: "100%",
    paddingHorizontal: 15,
    backgroundColor: colors.__secondary_background,
  },
  containerHeader: {
    flexDirection: "row",
  },
  goback: {
    fontFamily: typography.appFont[500],
    fontSize: 16,
  },
  closeIcon: {
    alignSelf: "flex-end",
    top: -20,
  },
});

export default PersonalProfileNew;
