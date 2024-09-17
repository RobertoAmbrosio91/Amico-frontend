import colors from "src/config/colors";
import typography from "src/config/typography";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { UserData } from "@/types";
import { useRouter } from "expo-router";
import React, { useState, useEffect, memo, FC } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import fetchAllUsers from "@/hooks/users/fetchAllUsers";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
interface ImageUriMap {
  [key: string]: string;
}
const SearchUsers = () => {
  const router = useRouter();
  const currentUser = useFetchUserDataAsync();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageUris, setImageUris] = useState<ImageUriMap>({});
  const standardProfileImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.token) {
        try {
          const token = currentUser.token;
          const users = await fetchAllUsers(token);
          // setUserData(users);
          const excludedIds = [
            "651897328d04558e7d0e43d5",
            "6511e98ca124ddfaf936b82b",
          ];
          setUserData(users.filter((user) => !excludedIds.includes(user._id)));
          const uris = users.reduce(
            (acc, friend) => ({
              ...acc,
              [friend._id]: friend.profile || standardProfileImage,
            }),
            {}
          );
          setImageUris(uris);
        } catch (error) {
          console.error("Failed to fetch users:", error);
          setError("Failed to load users");
        } finally {
          setLoading(false);
        }
      } else {
        console.log("Token not available yet");
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleImageError = (friendId: any) => {
    setImageUris((prevUris) => ({
      ...prevUris,
      [friendId]: standardProfileImage,
    }));
  };

  const renderUserData = ({ item }: { item: UserData }) => {
    const userFirstName = item.first_name || "Unknown";
    const user_name =
      item.user_name && item.user_name.startsWith("@")
        ? item.user_name
        : `@${item.user_name}`;
    return (
      <TouchableOpacity
        style={styles.friendTouchable}
        onPress={() => router.push(`/user/${item._id}`)}
      >
        <View style={styles.friendRequestItem}>
          <View style={styles.friendRequestItemInfo}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: imageUris[item._id] }}
                onError={() => handleImageError(item._id)}
                style={styles.friendImage}
              />
              <View>
                <Text style={styles.friendRequestItemInfoName}>
                  {userFirstName}
                </Text>
                <Text style={styles.user_name}>{user_name}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredUsers = userData.filter((user) => {
    // const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const userName = user.user_name ? user.user_name.toLowerCase() : "";
    const filter = fullName + userName;
    return filter.includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Image
            source={require("../../../assets/logo-amico-white.png")}
            style={{ width: 85, height: 23, alignSelf: "center" }}
          />
          <View style={styles.containerHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back-outline"
                size={30}
                color={colors.__secondary_background}
                style={{ marginLeft: 16 }}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput} // Make sure to define this style
              placeholder="Search Users"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#555"
            />
          </View>
        </View>

        <View
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: colors.__secondary_background,
          }}
        >
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderUserData}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? "11%" : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.__main_background,
  },
  containerHeader: {
    flexDirection: "row",
    paddingVertical: 17,
    // width: '100%',
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: colors.__main_background,
  },
  friendTouchable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 16,
  },
  friendRequestItem: {
    padding: 10,
    // marginVertical: 5,
    borderRadius: 8,
  },
  friendRequestItemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendRequestItemInfoName: {
    color: colors.__main_text,
    fontSize: 14,
    fontFamily: typography.appFont[400],
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    color: "#000",
    padding: 10,
    borderRadius: 5,
    width: "82%",
    marginRight: 16,
    borderColor: colors.__secondary_text_color,
    borderWidth: 1,
  },
  user_name: {
    color: colors.__01_light_n,
  },
});

export default SearchUsers;
