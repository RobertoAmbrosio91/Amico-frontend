import { View, Text } from "react-native";
import React, { useState, memo, RefObject } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import typography from "../../config/typography";
import colors from "../../config/colors";

type MediaPostType = any; 

interface SelectPostColorProps {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  setColor?: (color: string) => void; // Assuming setColor takes a string
  setMediaPost?: React.Dispatch<React.SetStateAction<MediaPostType>>;
  mediaPost: MediaPostType;
  onPostChange?: (post: MediaPostType) => void;
}

const SelectPostColor: React.FC<SelectPostColorProps> = ({
  bottomSheetModalRef,
  setColor,
  setMediaPost,
  mediaPost,
}) => {
  const closeModal = () => bottomSheetModalRef.current?.dismiss();
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={["70%"]}
      backgroundStyle={{ 
        backgroundColor: "#EFEFEF",
       }}
    >
      <TouchableOpacity
        style={{ alignSelf: "flex-end", marginRight: 24 }}
        onPress={() => closeModal()}
      >
        <AntDesign name="close" size={22} color="black" />
      </TouchableOpacity>
      <View style={styles.mainContainer}>
        <Text style={styles.colorTitle}>
          Choose the type of post
        </Text>
        <Text>Use this tags</Text>
        <View style={styles.colorContainer}>
          <PostTag
            setMediaPost={setMediaPost}
            mediaPost={mediaPost}
            tag={"Analysis"}
            closeModal={closeModal}
          />
          <PostTag
            setMediaPost={setMediaPost}
            mediaPost={mediaPost}
            tag={"Latest Trends"}
            closeModal={closeModal}
          />
          <PostTag
            setMediaPost={setMediaPost}
            mediaPost={mediaPost}
            tag={"Tips & Tricks"}
            closeModal={closeModal}
          />
          <PostTag
            setMediaPost={setMediaPost}
            mediaPost={mediaPost}
            tag={"Skills & Crafts"}
            closeModal={closeModal}
          />
          <PostTag
            setMediaPost={setMediaPost}
            mediaPost={mediaPost}
            tag={"Facts & Figures"}
            closeModal={closeModal}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};




const PostTag: React.FC<{
  tag: string;
  setMediaPost?: React.Dispatch<React.SetStateAction<MediaPostType>>;
  mediaPost: MediaPostType;
  closeModal: () => void;
}> = ({ tag, setMediaPost, mediaPost, closeModal }) => {
  const bgColor = (tag: string) => {
    if (tag === "Analysis") return colors.__teal_light;
    else if (tag === "Latest Trends") return "#816C49";
    else if (tag === "Tips & Tricks") return "#D0D0D0";
    else if (tag === "Skills & Crafts") return "#1d232d";
    else if (tag === "Facts & Figures") return colors.__teal_dark;
  };
  const getDescription = (tag: string) => {
    const descriptions: { [key: string]: string } = {
      Analysis: "Examination and interpretation",
      "Latest Trends": "Current and popular topics in a field",
      "Tips & Tricks": "Problem-solving, simple practical solutions",
      "Skills & Crafts": "DIY projects, visual arts and athletic skills",
      "Facts & Figures": "Quantitative data and objective information",
    };
    return descriptions[tag] || "Default description";
  };

  return (
    <TouchableOpacity
      style={styles.tagContainer}
      onPress={() => {
        if (setMediaPost) {
          setMediaPost({
            ...mediaPost,
            type_of_post: tag,
          });
        }
        closeModal();
      }}
    >
      <View style={[styles.color, { backgroundColor: bgColor(tag) }]}></View>
      <View>
        <Text>{tag}</Text>
        <Text>{getDescription(tag)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    margin: 24,
    height: 100,
    // alignItems: "center",
    rowGap: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.appFont[600],
    color: colors.__main_dark_text,
    textAlign: "center",
  },
  text: {
    fontFamily: typography.appFont[400],
    color: colors.__main_dark_text,
    textAlign: "center",
  },
  choicesContainer: {
    width: "100%",
    marginTop: 20,
    rowGap: 10,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.__main_dark_text,
    borderRadius: 4,
    alignItems: "center",
    padding: 10,
  },
  colorTitle: {
    fontFamily: typography.appFont[600],
    fontSize: 16,
  },
  color: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: "red",
  },
  colorContainer: {
    rowGap: 5,
    marginTop: 10,
  },
  tagContainer: {
    flexDirection: "row",
    paddingVertical: 5,
    alignItems: "center",
    columnGap: 15,
    borderBottomColor: colors.__blue_medium,
    borderBottomWidth: 1,
  },
});
export default memo(SelectPostColor);
