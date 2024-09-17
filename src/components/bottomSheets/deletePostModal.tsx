import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, RefObject } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AntDesign } from "@expo/vector-icons";
import typography from "../../config/typography";
import colors from "../../config/colors";
import CustomButton from "../buttons&inputs/CustomButton";
import deletePost from "../../hooks/posts/deleteSinglePost";
import Toast from "react-native-root-toast";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { CurrentUserType } from "../../types";
import { useRouter } from "expo-router";

// Define the props type
type DeletePostModalProps = {
  deleteModalRef: RefObject<any>;
  current_post_id: string | undefined;
  currentUser: CurrentUserType | null | undefined;
};

const DeletePostModal: React.FC<DeletePostModalProps> = ({ deleteModalRef, current_post_id, currentUser }) => {
  const router = useRouter(); // Adjust the type parameter based on your navigation structure
  const [isPostDeleted, setIsPostDeleted] = useState(false);

  const deleteMyPost = async () => {
    if (currentUser && currentUser.token && current_post_id) {
      const token = currentUser.token;
      const response = await deletePost(current_post_id, token);
      if (response) {
        setIsPostDeleted(!isPostDeleted);
        setTimeout(() => {
          deleteModalRef.current?.dismiss();
          router.push("/feed?deleted=true");
        }, 2000);
      }
    }
  };

    return (
      <BottomSheetModal
        ref={deleteModalRef}
        index={0}
        snapPoints={["35%"]}
        backgroundStyle={{ backgroundColor: colors.__blue_light }}
      >
        <View style={styles.mainContainer}>
          <Toast
            visible={isPostDeleted}
            position={500}
            shadow={false}
            animation={true}
            hideOnPress={true}
          >
            Your post has been successfully deleted
          </Toast>
          <AntDesign name="delete" size={30} color={colors.__black} />
          <Text style={styles.title}>Delete content</Text>

          <Text style={styles.text}>
            Are you sure you want permanently delete this content?
          </Text>

          <CustomButton
            text={"Delete"}
            borderStyle={{
              marginTop: 30,
              backgroundColor: colors.__teal_dark,
            }}
            onPress={deleteMyPost}
          />

          <TouchableOpacity
            style={{ marginTop: 15 }}
            onPress={() => deleteModalRef.current?.dismiss()}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  };

  const styles = StyleSheet.create({
    mainContainer: {
      margin: 24,
      height: 100,
      alignItems: "center",
      rowGap: 5,
    },
    title: {
      fontSize: 20,
      fontFamily: typography.appFont[600],
      color: colors.__main_dark_text,
    },
    text: {
      fontFamily: typography.appFont[400],
      color: colors.__main_dark_text,
      textAlign: "center",
    },
  });
  export default DeletePostModal;
