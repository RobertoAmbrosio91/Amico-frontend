import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import Header from "@/components/header/header";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import fetchAllFriends from "@/hooks/users/fetchAllFriends";
import { Friend, FriendRequest, UserData } from "@/types";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import fetchFriendRequests from "@/hooks/friends/fetchFriendRequests";
import useAcceptFriendRequests from "@/hooks/friends/acceptFriendRequests";
import useManageCloseFriends from "@/hooks/friends/useManageCloseFriends";
import colors from "src/config/colors";
import typography from "src/config/typography";
import fetchUserData from "@/hooks/users/fetchUserData";
import useMyFriendsSocket from "@/hooks/sockets/useMyFriendsSocket";
import { Image } from "expo-image";
interface ImageUriMap {
  [key: string]: string;
}
const MyFriends = () => {
  const router = useRouter();
  const { section } = useLocalSearchParams();
  const currentUser = useFetchUserDataAsync();
  const [userData, setUserData] = useState<UserData>();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]); // State for friend requests
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState(
    section !== undefined ? section : "friends"
  );
  const [imageUris, setImageUris] = useState<ImageUriMap>({});

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editFriends, setEditFriends] = useState<boolean>(false);
  const {
    isLoading: isAcceptLoading,
    error: acceptError,
    acceptFriendRequest,
  } = useAcceptFriendRequests(currentUser?.token);
  const {
    isLoading: isToggleLoading,
    error: toggleError,
    toggleCloseFriend,
  } = useManageCloseFriends(currentUser?.token);
  const standardProfileImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";

  const handleAcceptRequest = async (friendRequest: FriendRequest) => {
    await acceptFriendRequest(friendRequest._id);
    const newFriend: Friend = {
      _id: friendRequest.sender_data._id,
      isCloseFriend: false,
      profile: friendRequest.sender_data.profile,
      user_name: friendRequest.sender_data.user_name,
      first_name: friendRequest.sender_data.first_name,
      last_name: friendRequest.sender_data.last_name,
    };

    // Optionally, you can also refresh the friend requests list here
    if (!acceptError) {
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== friendRequest._id)
      );
      setFriends((prevFriends) => [newFriend, ...prevFriends]);
    }
  };
  //calling use my friends socket hook
  useMyFriendsSocket(friendRequests, setFriendRequests);

  useEffect(() => {
    const fetch_user_data = async () => {
      if (currentUser) {
        const fetchedData = await fetchUserData(
          currentUser._id,
          currentUser.token
        );
        if (fetchedData) {
          setUserData(fetchedData);
          setRefreshing(false);
        }
      }
    };
    fetch_user_data();
  }, [currentUser, refreshing]);

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
        setRefreshing(false);
        const uris = fetchedFriends.reduce(
          (acc, friend) => ({
            ...acc,
            [friend._id]: friend.profile || standardProfileImage,
          }),
          {}
        );
        setImageUris(uris);
      }
    };

    const fetchRequests = async () => {
      if (currentUser?.token) {
        const fetchedRequests = (await fetchFriendRequests(
          currentUser.token
        )) as FriendRequest[];
        setFriendRequests(fetchedRequests);
        setRefreshing(false);
      }
    };
    fetchFriends();
    fetchRequests(); // Fetch friend requests
  }, [userData, refreshing]);

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) =>
      `${friend.first_name} ${friend.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const closeFriends = useMemo(
    () => filteredFriends.filter((friend) => friend.isCloseFriend),
    [filteredFriends] // Change dependency to filteredFriends
  );

  const otherFriends = useMemo(
    () => filteredFriends.filter((friend) => !friend.isCloseFriend),
    [filteredFriends] // Change dependency to filteredFriends
  );

  const handleToggleCloseFriend = useCallback(
    async (friendId: string) => {
      // console.log("Before update:", friends);
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.map((friend) =>
          friend._id === friendId
            ? { ...friend, isCloseFriend: !friend.isCloseFriend }
            : friend
        );
        // console.log("After update:", updatedFriends);
        return updatedFriends;
      });

      try {
        await toggleCloseFriend(friendId);
      } catch (error) {
        setFriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend._id === friendId
              ? { ...friend, isCloseFriend: !friend.isCloseFriend }
              : friend
          )
        );
        console.error("Failed to toggle close friend status:", error);
      }
    },
    [toggleCloseFriend]
  );
  const handleImageError = (friendId: any) => {
    setImageUris((prevUris) => ({
      ...prevUris,
      [friendId]: standardProfileImage,
    }));
  };
  const renderFriendItem = ({
    item,
    index,
  }: {
    item: Friend;
    index: number;
  }) => {
    const profileImage = item.profile || standardProfileImage; // Ensure you have a fallback image path
    const isCloseFriend = item.isCloseFriend; // Use isCloseFriend from the state
    return (
      <View
        style={[
          styles.friendItem,
          index === friends.length - 1 && { marginBottom: 200 },
        ]}
      >
        <TouchableOpacity
          style={styles.friendTouchable}
          onPress={() => router.push(`/user/${item._id}`)}
        >
          <Image
            source={{ uri: imageUris[item._id] }}
            onError={() => handleImageError(item._id)}
            style={styles.friendImage}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{`${item.first_name}`}</Text>
            <Text style={styles.friendUsername}>@{item.user_name}</Text>
          </View>
          {editFriends && (
            <TouchableOpacity onPress={() => handleToggleCloseFriend(item._id)}>
              <Ionicons
                name={
                  isCloseFriend ? "person-remove-outline" : "person-add-outline"
                }
                size={24}
                color="#555"
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderFriendRequestItem = ({
    item,
    index,
  }: {
    item: FriendRequest;
    index: number;
  }) => {
    const senderFirstName = item.sender_data.first_name || "Unknown";
    const senderLastName = item.sender_data.last_name || "User";
    const profileImage = item.sender_data.profile || standardProfileImage;
    return (
      <View
        style={[
          styles.friendRequestItem,
          index === friendRequests.length - 1 && { marginBottom: 200 },
        ]}
      >
        {/* <Text style={styles.sectionTitle}>New Requests</Text> */}
        <View style={styles.friendRequestItemInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: profileImage }} style={styles.friendImage} />
            <Text style={styles.friendRequestItemInfoName}>
              {senderFirstName}
            </Text>
          </View>
          <CustomButton
            text="Accept"
            textStyle={styles.buttonText}
            borderStyle={styles.button}
            onPress={() => handleAcceptRequest(item)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View
        style={{
          paddingHorizontal: 16,
        }}
      ></View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeSection === "friends" ? styles.activeTab : {},
          ]}
          onPress={() => setActiveSection("friends")}
        >
          <Text style={styles.tabText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeSection === "close friends" ? styles.activeTab : {},
          ]}
          onPress={() => setActiveSection("close friends")}
        >
          <Text style={styles.tabText}>Close Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeSection === "requests" ? styles.activeTab : {},
          ]}
          onPress={() => setActiveSection("requests")}
        >
          <Text style={styles.tabText}>Requests</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 20,
          backgroundColor: colors.__secondary_background,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        {activeSection !== "requests" && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 10,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              alignItems: "center",
              backgroundColor: colors.__secondary_background,
            }}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search Friends..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => setEditFriends(!editFriends)}>
              <FontAwesome
                name={editFriends ? "check-square-o" : "pencil-square-o"}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        )}
        {editFriends && (
          <Text style={[styles.friendUsername, { paddingLeft: 25 }]}>
            You can add or remove users from close friends
          </Text>
        )}

        {activeSection === "friends" && (
          <FlatList
            style={{ height: "100%" }}
            data={otherFriends}
            keyExtractor={(item) => item._id}
            renderItem={renderFriendItem}
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeSection === "close friends" && (
          <FlatList
            style={{ height: "100%" }}
            data={closeFriends}
            keyExtractor={(item) => item._id}
            renderItem={renderFriendItem}
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {activeSection === "requests" && (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.__secondary_background,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <FlatList
            style={{ marginTop: 10 }}
            data={friendRequests}
            keyExtractor={(item) => item._id}
            renderItem={renderFriendRequestItem}
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.__main_background,
    flex: 1,
    paddingTop: Platform.OS === "android" ? "11%" : 0,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.__amico_blue,
  },
  tabText: {
    color: colors.__main_text_color,
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.__main_text,
    marginVertical: 16,
    marginLeft: 16,
  },
  friendRequestItem: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  friendRequestItemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendRequestItemInfoName: {
    color: colors.__main_text,
    fontSize: 16,
    fontFamily: typography.appFont[500],
  },
  button: {
    width: 70,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderColor: colors.__logo_color,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  buttonText: {
    color: colors.__logo_color,
  },

  friendItem: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 10,
    // marginVertical: 8,
    marginHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },

  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
    justifyContent: "center",
  },
  friendName: {
    color: colors.__main_text,
    fontSize: 14,
    fontFamily: typography.appFont[400],
  },
  friendUsername: {
    color: colors.__01_light_n,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#000",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    borderColor: colors.__secondary_text_color,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  friendTouchable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Take available space
  },
  // friendStatus: {
  //   fontSize: 14,
  //   color: "#9a9a9d",
  //   // Add margin if needed to match the design
  // },
});

export default MyFriends;
