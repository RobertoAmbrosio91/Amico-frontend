import React, { useState } from "react";
import { View, Text, StyleSheet,TouchableOpacity, Platform } from "react-native";
import { FontAwesome, MaterialIcons, Ionicons, Fontisto } from "@expo/vector-icons";
import colors from "src/config/colors";
import typography from "../../config/typography";
import Header from "../header/header";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import CustomButton from "../buttons&inputs/CustomButton";
import endorseUser from "../../hooks/users/endorse";
import Toast from "react-native-root-toast";
import { CurrentUserType } from "../../types";
import { UserData } from "../../types";
import useSendFriendRequest from "@/hooks/friends/useSendFriendsRequest";
import { Image } from 'expo-image';

interface Subcategory {
  _id: string;
  name: string;
  // ... other properties of subcategory
}

interface UserInfoProps {
  userData: UserData;
  handlePresentModal: () => void;
  userLikes: number | null;
  requestStatus: string;
}

interface ProfileImageProps {
  currentUser: CurrentUserType | UserData;
  userData: UserData;
}

interface UserInformationProps {
  userData: UserData;
  currentUser: CurrentUserType;
  requestSent: boolean;
  handleAddFriend: () => void;
  requestStatus: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  userData,
  requestStatus,
  userLikes,
}) => {
  const currentUser = useFetchUserDataAsync();
  const [userDetails, setUserDetails] = useState<UserData>(userData);
  const { isLoading, error, sendFriendRequest } = useSendFriendRequest(
    currentUser?.token
  );
  const [requestSent, setRequestSent] = useState(false);

  const handleAddFriend = async () => {
    if (userData && currentUser && currentUser._id !== userData._id) {
      try {
        await sendFriendRequest(userData._id);
        setRequestSent(true);
      } catch (error) {
        console.error("Failed to send friend request:", error);
      }
    }
  };

  return (
    <View style={styles.profile_top_side}>
      {currentUser && userData && (
        <ProfileImage currentUser={currentUser} userData={userData} />
      )}
      {userDetails && currentUser && (
        <UserInformation
          userData={userDetails}
          currentUser={currentUser}
          requestSent={requestSent}
          handleAddFriend={handleAddFriend}
          requestStatus={requestStatus}
        />
      )}
    </View>
  );
};

const ProfileImage: React.FC<ProfileImageProps> = ({
  currentUser,
  userData,
}) => {
  if (currentUser && currentUser && userData) {
    const profileImage = userData.profile
      ? `${userData.profile}`
      : "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
    return (
      <View style={styles.profile_img_container}>
        <Image
          source={{ uri: profileImage }}
          style={styles.profile_img}
          contentFit="cover"
        />
      </View>
    );
  }
};

const UserInformation: React.FC<UserInformationProps> = ({
  userData,
  currentUser,
  requestSent,
  handleAddFriend,
  requestStatus,
}) => {
  const {
    user_name,

    first_name,
  } = userData || {};
  const userFriendsSet = new Set(userData.friends);
  const commonFriends = currentUser.friends.filter((friend) =>
    userFriendsSet.has(friend)
  ).length;
  if (userData && currentUser) {
    return (
      <View style={styles.userInfoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.userFirstLast}>{first_name}</Text>
          <Text style={styles.userName}>@{user_name}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.detailsContainer}>
            {/* <Text
              style={[
                styles.detailsText,
                { fontFamily: typography.appFont[600] },
              ]}
            >
              {userData.friends.length}
            </Text>
            <Text style={styles.detailsText}>
              {userData.friends.length > 1 ? "Friends" : "Firend"}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text
              style={[
                styles.detailsText,
                { fontFamily: typography.appFont[600] },
              ]}
            >
              {commonFriends}
            </Text>
            <Text style={styles.detailsText}>
              {commonFriends > 1 ? "Friends in common" : "Friend in common"}
            </Text> */}
            <Text style={styles.detailsText}>
              {`You have ${commonFriends} amico${commonFriends > 1 ? `s` : ``} in common`}
            </Text>
          </View>
        </View>

        {/* {currentUser._id != userData._id && (
          <View style={styles.buttonsContainer}> */}
        {!currentUser.friends.includes(userData._id) && (
          <CustomButton
            text={
              requestSent
                ? "Request Sent"
                : requestStatus === "pending"
                  ? "Request Sent"
                  : "Add Friend"
            }
            borderStyle={styles.button}
            textStyle={styles.buttonText}
            hasIcon
            antdesign
            icon="adduser"
            onPress={!requestSent ? handleAddFriend : undefined}
            disabled={requestStatus !== "not_sent"}
          />
        )}
        {/* </View> */}
        {/* )} */}
        {/* {!currentUser.friends.includes(userData._id) ? (
          <CustomButton
            text={"Send Request"}
            borderStyle={styles.button}
            textStyle={styles.buttonText}
            hasIcon
            antdesign
            icon="adduser"
            onPress={!requestSent ? handleAddFriend : undefined}
          />
        ) : (
          <CustomButton
            text={"Your Friend"}
            borderStyle={styles.button}
            textStyle={styles.buttonText}
            hasIcon
            antdesign
            icon="adduser"
            disabled
          />
        )} */}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  nameContainer: {
    rowGap: 5,
  },
  userName: {
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 16,
    fontFamily: typography.appFont[400],
  },
  profile_top_side: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingTop: Platform.OS != "web" ? "5%" : 8,
    rowGap: 10,
    paddingBottom: Platform.OS != "web" ? 20 : 20,
    // backgroundColor: "#E3E8ED",
    borderRadius: 10,
    marginBottom: 10,
  },
  profileHeaderFollowers: {
    flexDirection: "row",
    gap: 20,
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  profile_img_container: {
    height: 138,
    width: 138,
    borderRadius: 80,
    alignSelf: "center",
  },
  profile_img: {
    width: "100%",
    height: "100%",
    // resizeMode: "cover",
    position: "absolute",
    borderRadius: 80,
  },
  userInfoContainer: {
    rowGap: 10,
    marginVertical: 10,
    alignSelf: "center",
  },

  userFirstLast: {
    color: colors.__main_text,
    fontSize: 20,
    fontFamily: typography.appFont[700],
    textAlign: "center",
  },
  subcategoryItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    // Add other styling as needed to match the design
  },

  subcategoryItem: {
    backgroundColor: colors.__background_input,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 11,
    marginVertical: 5,
    // Add other styling as needed to match the design
  },

  subcategoryText: {
    color: colors.__main_text, // Example text color, adjust as needed
  },
  profileSectionText: {
    color: colors.__main_text,
    fontSize: 16,
    fontFamily: typography.appFont[500],
    textAlign: "left",
  },
  iconContainer: {
    backgroundColor: colors.__background_input, // Gray background for the icon
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginRight: 10,
    borderRadius: 8, // Add some space between the icon and the text
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 50,
    backgroundColor: "red",
    width: "100%",
  },
  languageContainer: {
    flexDirection: "column",
    rowGap: 10,
    paddingRight: 10,
  },
  languageItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageContainerText: {
    fontFamily: typography.appFont[400],
    color: colors.__main_text,
    fontSize: 14,
  },
  interestsWrapper: {
    flexDirection: "row",
    columnGap: 5,
    flexWrap: "wrap",
  },
  endorsement: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    borderWidth: 0.5,
    borderColor: "#647189",
    backgroundColor: "#647189",
    marginVertical: 10,
    width: "100%",
  },
  buttonsContainer: {
    width: 150,
  },
  addFriendButton: {
    backgroundColor: colors.__logo_color,
    borderRadius: 8,
    height: 40,
  },
  addFriendButtonText: {
    fontFamily: typography.appFont[700],
    fontSize: 14,
    color: "white",
    letterSpacing: 0.21,
  },
  messageButton: {
    backgroundColor: "#000",
    width: "48%",
    borderRadius: 12,
    height: 40,
  },
  messageButtonText: {
    fontFamily: typography.appFont[700],
    fontSize: 14,
    color: "white",
    letterSpacing: 0.21,
  },
  details: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: "30%",
    justifyContent: "space-between",
  },
  detailsContainer: {
    alignItems: "center",
    width: 300,
    marginTop: 20,
  },
  detailsText: {
    fontFamily: typography.appFont[400],
    fontSize: 15,
  },
  button: {
    width: 200,
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: colors.__amico_blue,
  },
  buttonText: {
    fontFamily: typography.appFont[700],
    color: colors.w_contrast,
  },
});

export default UserInfo;
