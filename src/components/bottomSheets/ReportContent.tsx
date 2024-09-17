import { View, Text, Alert } from "react-native";
import React, { useState, RefObject } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { Feather,AntDesign } from "@expo/vector-icons";
import typography from "../../config/typography";
import colors from "../../config/colors";
import { TouchableOpacity } from "react-native";
import CustomButton from "../buttons&inputs/CustomButton";
import reportPost from "../../hooks/posts/reportPost";
import blockUser from "../../hooks/users/blockUser";
import Toast from "react-native-root-toast";

type CurrentUserType = any;
type PostCreatorType = any;
type PostIdType = string | undefined;

interface ReportContentProps {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  current_post_id: PostIdType;
  currentPostCreator: PostCreatorType;
  reportType: string;
  currentUser: CurrentUserType;
  isMessageVisible: boolean;
  setIsMessageVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handlePresentModal?: () => void;
  handleDismissModal?: () => void;
}

const ReportContent: React.FC<ReportContentProps> = ({
  bottomSheetModalRef,
  current_post_id,
  currentPostCreator,
  reportType,
  currentUser,
  isMessageVisible,
  setIsMessageVisible,
  handlePresentModal,
  handleDismissModal,
}) => {
  const [motivation, setMotivation] = useState<string | null>(null);
  const [isUserBlocked, setIsUserBlocked] = useState<boolean>(false);
  function handleMotivation(key: number) {
    if (key === 1) {
      setMotivation("Offensive/Abusive/Illegal");
    } else if (key === 2) {
      setMotivation("Not Knowledge Based");
    } else if (key === 3) {
      setMotivation("Factually Incorrect");
    }
  }
  // handling button disable
  var disabled = motivation ? false : true;

  //handling post report
  const postReport = async () => {
    let params = {};
    if (reportType === "post") {
      params = {
        post_id: current_post_id,
        report_type: reportType,
        report_message: motivation || "",
      };
    } else {
      params = {
        memory_id: current_post_id,
        report_type: reportType,
        report_message: motivation || "",
      };
    }

    if (currentUser && current_post_id && reportType) {
      const response = await reportPost(currentUser.token, params);
      if (response && response.success) {
        bottomSheetModalRef.current?.dismiss();
        setIsMessageVisible(!isMessageVisible);
        setMotivation("");
      }
    }
  };

  //handling block user

  const blockReportUser = async () => {
    let response;
    if (currentUser && currentPostCreator) {
      response = await blockUser(currentPostCreator, currentUser.token);
    }

    if (response) {
      setIsUserBlocked(true);
      // bottomSheetModalRef.current?.dismiss();
    }
  };
  const showAlert = () => {
    Alert.alert(
      "Report User",
      "Would you like to report and block this user?",
      [
        {
          text: "Report & Block",
          onPress: blockReportUser,
        },
        {
          text: "Cancel",

          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.mainContainer}>
      {isUserBlocked && <Text>You have successfully blocked this user</Text>}
      <Feather name="alert-triangle" size={30} color={colors.__black} />
      <Text style={styles.title}>Flag content</Text>
      <Text style={styles.text}>
        Help us keeping Amico a safe place. Request the removal of this content
        if you think it’s the right thing to do.
      </Text>
      <View style={[styles.choicesContainer]}>
        <TouchableOpacity
          style={[
            styles.choice,
            motivation === "Offensive/Abusive/Illegal"
              ? { backgroundColor: colors.__main_background }
              : {},
          ]}
          onPress={() => handleMotivation(1)}
        >
          <Text
            style={
              motivation === "Offensive/Abusive/Illegal"
                ? { color: "#fff" }
                : {}
            }
          >
            This content is Offensive/Abusive/Illegal
          </Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        text={"Continue"}
        borderStyle={[
          {
            marginTop: 30,
          },
          disabled
            ? { backgroundColor: "#fff" }
            : { backgroundColor: colors.__amico_blue },
        ]}
        disabled={disabled}
        onPress={postReport}
        textStyle={{
          fontFamily: typography.appFont[700],
          color: disabled ? "#000" : colors.w_contrast,
        }}
      />
      {currentUser && currentPostCreator != currentUser._id && (
        <TouchableOpacity style={{ marginTop: 15 }} onPress={showAlert}>
          <Text>Report & Block User</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={{ marginTop: 15 }}
        onPress={() => {
          bottomSheetModalRef.current?.dismiss();
          setMotivation("");
          setIsUserBlocked(false);
        }}
      >
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
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
    color: colors.__main_background,
  },
  text: {
    fontFamily: typography.appFont[400],
    color: colors.__main_background,
    textAlign: "center",
  },
  choicesContainer: {
    width: "100%",
    marginTop: 20,
    rowGap: 10,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.__main_background,
    borderRadius: 4,
    alignItems: "center",
    padding: 10,
  },
});
export default ReportContent;
