import React, { useState } from "react";
import { View, Text, StyleSheet,TouchableOpacity, FlatList } from "react-native";
import { FontAwesome, MaterialIcons, Ionicons, Fontisto } from "@expo/vector-icons";
import colors from "src/config/colors";
import typography from "../../config/typography";
import Header from "../header/header";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import CustomButton from "../buttons&inputs/CustomButton";
import endorseUser from "../../hooks/users/endorse";
import Toast from "react-native-root-toast";
import { CurrentUserType, Friend } from "../../types";
import { UserData } from "../../types";
import useSendFriendRequest from "@/hooks/friends/useSendFriendsRequest";
import { Image } from 'expo-image';
import { useRouter } from "expo-router";



interface UserFriendsProps {
  friends: Friend[];
}

const UserFriends: React.FC<UserFriendsProps> = ({
  friends,
}) => {
  const currentUser = useFetchUserDataAsync();
  const router = useRouter();

  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity
        style={styles.friendTouchable}
        onPress={() => router.push(`/user/${item._id}`)}
      >
        <Image source={{ uri: item.profile }} style={styles.friendImage} />
          <Text style={styles.friendName}>{item.first_name}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.profileFriendsContainer}>
    <Text style={styles.profileFriendsContainerText}>Friends</Text>
    <FlatList
      data={friends}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    />
    </View>
  );
};



const styles = StyleSheet.create({
  profileFriendsContainer: {
    flexDirection: "column",
    backgroundColor: "#E3E8ED", // Match card background with UserContentNew
    borderRadius: 10, // Same border-radius for consistency
    paddingVertical: 10, // Padding inside the card
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10, // Elevation for Android shadow
  },
  profileFriendsContainerText: {
    fontSize: 18,
    fontFamily: typography.appFont[700],
    padding: 10,
    marginHorizontal: 5,
  },
  friendItem: {
    flexDirection: "row",
    padding: 10,
    // marginVertical: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginBottom: 5,
  },
  friendName: {
    fontSize: 12,
    fontFamily: typography.appFont[400],
    color: colors.__main_text,
  },
  friendUsername: {
    fontSize: 14,
    color: "#9a9a9d",
  },
  friendTouchable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Take available space
  },
});

export default UserFriends;
