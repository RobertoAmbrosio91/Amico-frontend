import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { updateUserInStorage } from "../../hooks/async_storage/updateUserInStorage";
import axios from "../../hooks/axios/axiosConfig";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import OnBoardingProgressBar from "../../components/progressbar/OnBoardingProgressBar";
import { useNavigation, router, useRouter } from "expo-router";
import { CurrentUserType } from "src/types";
import { hideKeyboard } from "../../functionality/hideKeyboard";
import { useRouteNode } from "expo-router/build/Route";


interface CreateUsernameProps {
  // Define any props here if needed
}



const CreateUsername: React.FC<CreateUsernameProps> = () => {
  const [username, setUsername] = useState<string>("");
  const [wrongUserName, setWrongUserName] = useState<string | undefined>(
    undefined
  );
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  //fetch  user
  const currentUser = useFetchUserDataAsync();
  const router = useRouter();
  const isDisabled = username.length < 2;
  //updating user data
  const updateUser = async () => {
    if (currentUser && currentUser.token) {
      try {
        const response = await axios.post(
          "/user/profile-update",
          {
            user_name: username,
          },
          {
            headers: {
              "x-access-token": currentUser.token,
            },
          }
        );
        if (response.data && response.data.success) {
          const responseData = response.data;
          // console.log(responseData);
          updateUserInStorage(responseData.result);
          router.replace("/myeventsrevisited");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Now TypeScript knows this is an Axios error
          // Accessing error.response, error.response.data, etc. is safe
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            console.log(error.response.data.message);
            setShowErrorMessage(!showErrorMessage);
            setWrongUserName(username);
          }
        } else {
          // Handle non-Axios errors
          console.error("Error registering:", error);
        }
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => hideKeyboard()}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Header />
          <View style={styles.heading_container}>
            <Text style={styles.mainText}>Pick a Nickname</Text>
            <Text style={styles.secondaryText}>
              Choose a username that makes you stand out.
            </Text>
          </View>

          <View style={styles.inputs_container}>
            <SignupInput
              placeholder={"Pick your username"}
              placeholderColor="#999"
              onChangeText={(value) => setUsername(value)}
            />
            {showErrorMessage && <ErrorMessage username={wrongUserName} />}

            <CustomButton
              text={"Continue"}
              borderStyle={{
                backgroundColor: isDisabled
                  ? colors.__disabled_button
                  : colors.__amico_blue,
                borderRadius: 4,
              }}
              textStyle={{
                fontFamily: typography.appFont[700],
                color: isDisabled
                  ? colors.__main_text_color
                  : colors.w_contrast,
              }}
              onPress={updateUser}
              disabled={isDisabled}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

type ErrorMessageProps = {
  username: string | undefined;
};

const ErrorMessage = ({ username }: ErrorMessageProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: "5%",
      }}
    >
      <MaterialCommunityIcons name="exclamation" size={24} color={"#4B5567"} />
      <View>
        <Text
          style={{
            color: "#4B5567",
            fontFamily: typography.appFont[400],
          }}
        >
          @{username} is already being used.
        </Text>
        <Text style={{ color: "#4B5567", fontFamily: typography.appFont[400] }}>
          Try another one.
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? "18%" : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 24,
  },
  mainText: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 30,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  secondaryText: {
    fontFamily: typography.appFont[400],
    fontSize: 16,
    marginTop: 0,
    color: colors.__blue_dark,
    width: "100%",
  },
  inputs_container: {
    flexDirection: "column",
    marginTop: Platform.OS != "web" ? "25%" : "5%",
    rowGap: 15,
  },
  messageContainer: {
    padding: 20,
    rowGap: 5,
    backgroundColor: "rgba(19, 26, 41, 0.90)",
    borderRadius: 4,
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    color: colors.w_contrast,
    fontSize: 13,
    textAlign: "center",
  },
  heading_container: {
    marginTop: "10%",
    rowGap: 10,
    marginBottom: 20,
  },
});

export default CreateUsername;
