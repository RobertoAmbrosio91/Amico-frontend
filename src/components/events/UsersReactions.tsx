import { StyleSheet, Text, View, Animated } from "react-native";
import React from "react";
import LottieView from "lottie-react-native";
import { Memorytype } from "@/types";
import typography from "src/config/typography";
import colors from "src/config/colors";

const UsersReactions = ({ memory }: { memory: Memorytype }) => {
  const my_reaction = memory.my_reaction;

  return (
    <View style={styles.container}>
      {memory.reactions_summary.total_Heart_reaction > 0 && (
        <View
          style={[
            styles.iconContainer,
            my_reaction === "Heart" && { backgroundColor: colors.__amico_blue },
          ]}
        >
          <LottieView
            source={require("../../../assets/lottie/heart.json")}
            autoPlay
            loop
            style={styles.emojiStyle}
          />
          <Text
            style={[
              styles.likesText,
              my_reaction === "Heart" && { color: colors.__main_background },
            ]}
          >
            {memory.reactions_summary.total_Heart_reaction}
          </Text>
        </View>
      )}

      {memory.reactions_summary.total_Fire_reaction > 0 && (
        <View
          style={[
            styles.iconContainer,
            my_reaction === "Fire" && { backgroundColor: colors.__amico_blue },
          ]}
        >
          <LottieView
            source={require("../../../assets/lottie/fire.json")}
            autoPlay
            loop
            style={styles.emojiStyle}
          />

          <Text
            style={[
              styles.likesText,
              my_reaction === "Fire" && { color: colors.__main_background },
            ]}
          >
            {memory.reactions_summary.total_Fire_reaction}
          </Text>
        </View>
      )}

      {memory.reactions_summary.total_Top_reaction && (
        <View
          style={[
            styles.iconContainer,
            my_reaction === "Top" && { backgroundColor: colors.__amico_blue },
          ]}
        >
          <LottieView
            source={require("../../../assets/lottie/top.json")}
            autoPlay
            loop
            style={styles.emojiStyle}
          />

          <Text
            style={[
              styles.likesText,
              my_reaction === "Top" && { color: colors.__main_background },
            ]}
          >
            {memory.reactions_summary.total_Top_reaction}
          </Text>
        </View>
      )}

      {memory.reactions_summary.total_Mind_Blowing_reaction > 0 && (
        <View
          style={[
            styles.iconContainer,
            my_reaction === "Mind_Blowing" && {
              backgroundColor: colors.__amico_blue,
            },
          ]}
        >
          <LottieView
            source={require("../../../assets/lottie/mind_blowing.json")}
            autoPlay
            loop
            style={styles.emojiStyle}
          />

          <Text
            style={[
              styles.likesText,
              my_reaction === "Mind_Blowing" && {
                color: colors.__main_background,
              },
            ]}
          >
            {memory.reactions_summary.total_Mind_Blowing_reaction}
          </Text>
        </View>
      )}

      {memory.reactions_summary.total_Laugh_reaction > 0 && (
        <View
          style={[
            styles.iconContainer,
            my_reaction === "Laugh" && { backgroundColor: colors.__amico_blue },
          ]}
        >
          <LottieView
            source={require("../../../assets/lottie/laugh.json")}
            autoPlay
            loop
            style={styles.emojiStyle}
          />

          <Text
            style={[
              styles.likesText,
              my_reaction === "Laugh" && { color: colors.__main_background },
            ]}
          >
            {memory.reactions_summary.total_Laugh_reaction}
          </Text>
        </View>
      )}
    </View>
  );
};

export default UsersReactions;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    columnGap: 3,
    maxWidth: 180,
    flexWrap: "wrap",
    rowGap: 3,
    padding: 5,
  },
  iconContainer: {
    // backgroundColor: "#E1E1E1",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 15,
    justifyContent: "center",
    flexDirection: "row",
    columnGap: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c9c9c9",
  },
  emojiStyle: {
    width: 18,
    height: 18,
  },
  likesText: {
    color: "black",
    fontFamily: typography.appFont[600],
    fontSize: 10,
  },
});
