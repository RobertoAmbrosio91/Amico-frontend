import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Platform } from "react-native";
import Axios from "../../hooks/axios/axiosConfig";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import storeUserData from "../../hooks/async_storage/storeUser";
import {
  useGoogleAuth,
} from "../../hooks/authentication/googleAuth";
import appleLogin from "../../hooks/users/appleLogin";
import { useRouter } from "expo-router";
import { hideKeyboard } from "../../functionality/hideKeyboard";



type RootStackParamList = {
  HomeNew: undefined; // No parameters passed to Home route
  OnBoarding: undefined; // No parameters passed to OnBoarding route
  // Add other routes as necessary
};



const Login = () => {
  const router = useRouter();
  //setting states to get user data
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("");

  const { onGoogleButtonPress } = useGoogleAuth();

  const login = async () => {
    try {
      const response = await Axios.post("/user/login", {
        email: email,
        password: password,
      });

      if (response.data && response.data.success) {
        router.replace("/feed");
        storeUserData(response.data.result);
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log(error.response.data.message);
        setLoginStatus(error.response.data.message);
      } else {
        console.error("Error logging in:", error);
      }
    }
  };

  const onPressApple = async () => {
    const returnedUser = await appleLogin();
    if (returnedUser && returnedUser.success) {
      if (!returnedUser.result.first_name || !returnedUser.result.profile) {
        router.replace("/onboarding/firstlastname");
      } else if (!returnedUser.result.user_name) {
        router.replace("/onboarding/createusername");
      } else if (!returnedUser.result.mobile_number) {
        router.replace("/otp_add_mobile");
      } else {
        router.replace("/myeventsrevisited");
      }
    }
  };
  return (
    <TouchableWithoutFeedback onPress={() => hideKeyboard()}>
      <SafeAreaView style={styles.background}>
        <View style={styles.container}>
          <Header />
          <Text style={styles.mainText}>Haaaave we met before?</Text>
          <View style={styles.formcontainer}>
            <View style={{ rowGap: 15 }}>
              <Text
                style={{
                  fontFamily: typography.appFont[500],
                  color: colors.primary,
                  textAlign: "center",
                }}
              >
                {loginStatus}
              </Text>
              <View style={styles.buttonsContainer}>
                <CustomButton
                  text={"Login with OTP"}
                  onPress={() =>
                    router.push({
                      pathname: "/otp_login",
                      params: { isSignup: "no" },
                    })
                  }
                  borderStyle={{
                    backgroundColor: colors.__amico_blue,
                    borderRadius: 4,
                  }}
                  textStyle={{
                    color: colors.w_contrast,
                    fontFamily: typography.appFont[700],
                    fontSize: 16,
                  }}
                  hasIcon={true}
                  icon={"mobile"}
                />
                <Separator />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <CustomButton
                    borderStyle={[styles.buttons, styles.socialLogin]}
                    textStyle={{
                      color: colors.w_contrast,
                      fontFamily: typography.appFont[700],
                      fontSize: 16,
                    }}
                    text={"Google"}
                    onPress={() => onGoogleButtonPress()}
                    source={require("../../../assets/images/search.png")}
                  />
                  {Platform.OS === "ios" && (
                    <CustomButton
                      borderStyle={[styles.buttons, styles.socialLogin]}
                      textStyle={{
                        color: colors.w_contrast,
                        fontFamily: typography.appFont[700],
                        fontSize: 16,
                      }}
                      text={"Apple"}
                      source={require("../../../assets/images/apple.png")}
                      onPress={onPressApple}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              rowGap: 20,
              position: "absolute",
              bottom: 20,
              left: 24,
              width: "100%",
            }}
          >
            <TouchableOpacity onPress={() => router.push("/landing")}>
              <Text style={styles.signuptext}>
                Don't have an account?{" "}
                <Text style={styles.signupspan}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
const Separator = () => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          height: 0,
          borderColor: "#fff",
          borderWidth: 0.5,
          flex: 1,
        }}
      ></View>
      <Text
        style={{
          width: 30,
          textAlign: "center",
          fontFamily: typography.appFont[400],
          color: colors.w_contrast,
        }}
      >
        or
      </Text>
      <View
        style={{
          height: 0,
          borderColor: "#fff",
          borderWidth: 0.5,
          flex: 1,
        }}
      ></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  background: {
    flex: 1,
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? "18%" : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  mainText: {
    marginTop: Platform.OS != "web" ? "15%" : "5%",
    fontSize: 35,
    fontFamily: typography.appFont[700],
    color: colors.w_contrast,
  },

  formcontainer: {
    marginTop: Platform.OS != "web" ? "25%" : "5%",
  },

  signuptext: {
    fontSize: 13,
    color: colors.__blue_dark,
  },

  signupspan: {
    textDecorationLine: "underline",
    color: "#fff",
  },
  buttons: {
    // backgroundColor: colors.__teal_light,
    borderRadius: 4,
  },
  socialLogin: {
    width: Platform.OS === "ios" ? "48%" : "100%",
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 1,
  },
  buttonsContainer: {
    rowGap: 10,
    marginTop: 100,
  },
});

export default Login;
