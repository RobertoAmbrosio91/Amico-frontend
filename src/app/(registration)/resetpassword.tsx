import React, { useState } from "react";
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
import axios from "../../hooks/axios/axiosConfig";
import { useRouter } from "expo-router";
import { hideKeyboard } from "../../functionality/hideKeyboard";



const ResetPassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const isEmailValid = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isDisabled: boolean = !isEmailValid(email);

  const resetPassword = async (): Promise<void> => {
    try {
      const response = await axios.post("/user/create-link", { email: email });
      if (response.data && response.data.success) {
        setEmailSent(!emailSent);
      }
    } catch (error: any) { // You might want to define a more specific error type
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log(error.response.data.message);
      } else {
        console.log(error);
      }
    }
  };  


  return (
    <TouchableWithoutFeedback onPress={()=>hideKeyboard()}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Header style={{ color: colors.secondary_contrast }} />
          <Text style={styles.mainText}>Reset password</Text>
          <Text style={styles.secondaryText}>
            Type the email you used to sign up on Noosk and we'll send you a
            password reset email.
          </Text>
          <View style={styles.inputs_container}>
            <SignupInput
              placeholder={"Email address"}
              placeholderColor={colors.primary}
              onChangeText={(value) => setEmail(value)}
            />
            <CustomButton
              disabled={isDisabled}
              text={"Resend"}
              borderStyle={{
                backgroundColor: isDisabled
                  ? "rgba(84, 215, 183, 0.5)"
                  : colors.__teal_light,
                borderRadius: 4,
              }}
              textStyle={{
                color: colors.w_contrast,
                fontFamily: typography.appFont[400],
              }}
              onPress={resetPassword}
            />
          </View>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 40, alignSelf: "center" }}
            onPress={() => router.back()}
          >
            <Text
              style={{
                color: colors.primary,
                fontFamily: typography.appFont[400],
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
          {emailSent && (
            <View style={styles.messageContainer}>
              <Text
                style={{ fontFamily: typography.appFont[700], color: "#fff" }}
              >
                Please check your email
              </Text>
              <Text
                style={{ fontFamily: typography.appFont[400], color: "#fff" }}
              >
                We've sent an e-mail to create a new password
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 30 : 0,
    maxWidth:800,
    alignSelf:"center"
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainText: {
    marginTop: "15%",
    fontSize: 35,
    fontFamily: typography.appFont[700],
    color: colors.__main_dark_text,
  },
  secondaryText: {
    color: colors.__blue_dark,
    fontFamily: typography.appFont[400],
    marginTop: 10,
  },
  inputs_container: {
    marginTop: "25%",
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
});

export default ResetPassword;
