import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
} from "react-native";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { useRouter } from "expo-router";
import fetchAllFriends from "@/hooks/users/fetchAllFriends";
import { Friend } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import colors from "src/config/colors";
import { Image } from 'expo-image';
import fetchAllUsers from "@/hooks/users/fetchAllUsers";
import * as Haptics from "expo-haptics";

interface ImageUriMap {
  [key: string]: string;
}

const AddParticipant: React.FC<any> = ({
  bottomSheetModalRef,
  eventData,
  setEventData,
  setHasChanged,
  setEventDetails,
  eventDetails,
}) => {
  const router = useRouter();
  const currentUser = useFetchUserDataAsync();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [imageUris, setImageUris] = useState<ImageUriMap>({});

  const standardProfileImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";

  useEffect(() => {
    const fetchFriends = async () => {
      if (currentUser && currentUser.friends && currentUser.token) {
        const fetchedFriends = await fetchAllUsers(currentUser.token);
        setFriends(fetchedFriends);
        setFilteredFriends(fetchedFriends);
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
    fetchFriends();
  }, [currentUser]);

  const handleSelectedFriends = (friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedFriends.includes(friend)) {
      setSelectedFriends((prev) =>
        prev.filter((prev) => prev._id !== friend._id)
      );
    } else {
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };
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
    const lastIndex = index === filteredFriends.length - 1;
    return (
      <View style={[styles.friendItem, lastIndex && { paddingBottom: 50 }]}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => handleSelectedFriends(item)}
        >
          <Image
            source={{ uri: imageUris[item._id] }}
            style={styles.friendImage}
            onError={() => handleImageError(item._id)}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.first_name} </Text>
            <Text style={styles.friendUsername}>@{item.user_name}</Text>
          </View>
          <View
            style={[
              styles.checkbox,
              selectedFriends.includes(item) && {
                backgroundColor: colors.__amico_blue,
                borderColor: "transparent",
              },
            ]}
          ></View>
        </TouchableOpacity>
      </View>
    );
  };
  const handleFilteredFriends = (query: string) => {
    if (query.length > 0) {
      const filtered = friends.filter(
        (friend) =>
          `${friend.first_name || ""} ${friend.last_name || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (friend.user_name || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends);
    }
  };

  const renderSelectedFriendItem = ({ item }: { item: Friend }) => {
    const profileImage = item.profile || standardProfileImage;
    return (
      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 90,
        }}
        onPress={() => handleSelectedFriends(item)}
      >
        <Image
          source={{ uri: profileImage }}
          style={styles.selectedFriendImage}
        />
        <Text style={styles.friendUsername}>
          @
          {item.user_name.length > 8
            ? item.user_name.slice(0, 5) + "..."
            : item.user_name}
        </Text>
        <View style={{ position: "absolute", right: 10, top: 0 }}>
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={colors.__main_background}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddParticipant = () => {
    if (selectedFriends.length > 0) {
      const existingParticipantIds = new Set(
        eventData.participants.map((p: any) => p._id)
      );

      const newParticipants = selectedFriends.filter(
        (friend) => !existingParticipantIds.has(friend._id)
      );

      const updatedParticipants = [
        ...eventData.participants,
        ...newParticipants,
      ];
      const participant_ids = updatedParticipants.map((p: any) => p._id);

      setEventData({ ...eventData, participants: updatedParticipants });
      setEventDetails({ ...eventDetails, participants: participant_ids });
      setHasChanged(true);
      setSelectedFriends([]);
      bottomSheetModalRef.current?.close();
    } else {
      bottomSheetModalRef.current?.close();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={["100%"]}
      handleStyle={{
        backgroundColor: colors.__main_background,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.__main_text_color,
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={styles.sectionTitle}>My Friends</Text>
          {selectedFriends.length > 0 ? (
            <TouchableOpacity onPress={handleAddParticipant}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Done</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={bottomSheetModalRef.current?.close}>
              <Ionicons
                name="close-circle-outline"
                size={24}
                color={colors.__main_text_color}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.selectedParticipants}>
          <Text style={styles.friendUsername}>Selected Participants</Text>
          {selectedFriends.length > 0 ? (
            <FlatList
              data={selectedFriends}
              keyExtractor={(item) => item._id}
              renderItem={renderSelectedFriendItem}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.newParticipantText}>
              Select new participants to add in the event
            </Text>
          )}
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends"
          placeholderTextColor={"#a7a7a7"}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleFilteredFriends(text);
          }}
        />
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item._id}
          renderItem={renderFriendItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.__main_background,
    flex: 1,
    paddingHorizontal: 15,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.main_text_color,
  },
  tabText: {
    color: colors.main_text_color,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.__secondary_background,
    margin: 10,
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  friendItem: {
    flexDirection: "column",
    marginVertical: 8,
    marginHorizontal: 16,
    alignContent: "center",
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 16,
  },
  selectedFriendImage: {
    width: 70,
    height: 70,
    borderRadius: 60,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.__secondary_background,
  },
  friendUsername: {
    fontSize: 14,
    color: "#9a9a9d",
  },
  searchInput: {
    backgroundColor: colors.__secondary_background,
    // color: colors.__main_text_color,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    marginHorizontal: 0,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.__secondary_background,
  },
  newParticipantText: {
    alignSelf: "center",
    marginTop: 25,
    fontSize: 14,
    color: "#9a9a9d",
  },
  selectedParticipants: {
    marginBottom: 15,
    padding: 10,
    rowGap: 15,
    backgroundColor: colors.__secondary_background,
    borderRadius: 10,
    minHeight: 140,
  },
});

export default AddParticipant;
