import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Memorytype } from "@/types";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { toggleLikeUnlikeMemory } from "@/hooks/events/toggleLikeUnlikeMemory";
import { useLocalSearchParams } from "expo-router";

const UserInteraction: React.FC<any> = ({
  onPresentModal,
  item,
}: {
  onPresentModal: (
    postId: string,
    postCreator: string,
    report_type: string
  ) => void;
  item: Memorytype;
}) => {
  const currentUser = useFetchUserDataAsync();
  const showAlert = useLocalSearchParams().is_story === "yes" ? true : false;
  const [isLiked, setIsLiked] = useState(item.liked_by_me);
  const handleLikePress = async () => {
    const id = item.memory_id ? item.memory_id : item._id;
    if (currentUser) {
      if (isLiked) {
        item.liked_by_me = false;
        setIsLiked(false);
      } else {
        item.liked_by_me = true;
        setIsLiked(true);
      }
      try {
        // Added the "Heart" type as the third argument
        await toggleLikeUnlikeMemory(id, currentUser.token, "Heart");
      } catch (error) {
        console.log(
          "There was an error toggling the like/unlike state:",
          error
        );
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          onPresentModal(item.memory_id, item.created_by._id, "memory");
        }}
      >
        {showAlert && (
          <Feather name="alert-triangle" size={30} color={"white"} />
        )}
      </TouchableOpacity>
      {/* <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          columnGap: 10,
        }}
      > */}
      {/* <Text>{item.total_likes}</Text> */}
      <TouchableOpacity onPress={handleLikePress}>
        <AntDesign
          name={isLiked ? "heart" : "hearto"}
          size={30}
          color={isLiked ? "red" : "white"}
        />
      </TouchableOpacity>
      {/* </View> */}
    </View>
  );
};

export default UserInteraction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
});
