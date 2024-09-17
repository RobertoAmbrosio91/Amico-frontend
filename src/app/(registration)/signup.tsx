import React, { useState, useEffect, FC } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import { registerUser } from "../../hooks/users/registerUser";
import { useRouter } from "expo-router";
import { hideKeyboard } from "../../functionality/hideKeyboard";



const Signup = () => {
  const router = useRouter()
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  //setting states to get user data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const isEmailValid = (email: string): boolean => {
    // Regular expression pattern for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const isPasswordValid = (password: string): boolean => {
    // Regular expression pattern for password validation
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };
  const passwordMatch = (password: string, rePassword: string): boolean => {
    if (password != rePassword) return false;
    return true;
  };
  const isClickable =
    passwordMatch(password, rePassword) &&
    email !== "" &&
    password !== "" &&
    rePassword !== "";

  const [registerStatus, setRegisterStatus] = useState("");
  const register = async (): Promise<void> => {
    try {
      const response = await registerUser(email.toLowerCase().trim(), password);
  
      if (response && response.success) {
        router.push('/onboarding/firstlastname');
      } else if (response && response.success === false) {
        setRegisterStatus(response.message);
      } else {
        setRegisterStatus(response);
      }
    } catch (error) {
      setRegisterStatus("An error occurred during registration.");
    }
  };

  

  return (
    <TouchableWithoutFeedback onPress={() => hideKeyboard()}>
      <KeyboardAvoidingView
        style={styles.background}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -300}
      >
        <SafeAreaView style={styles.background}>
          <View style={{ paddingHorizontal: 24 }}>
            <Header />
          </View>
          <ScrollView style={[styles.container]}>
            <View style={{ top: "5%", rowGap: 25 }}>
              <Text style={styles.mainText}>Create an account in 3-2-1</Text>
              <Text style={styles.secondaryText}>
                Join us to share meaningful moments and forge strong
                connections!
              </Text>
            </View>

            <View style={[styles.formcontainer]}>
              <View style={{ rowGap: 15 }}>
                {registerStatus && (
                  <View style={{ flexDirection: "row" }}>
                    <MaterialCommunityIcons
                      name="exclamation"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.error_message}>{registerStatus}</Text>
                  </View>
                )}

                <SignupInput
                  placeholder={"Email"}
                  placeholderColor={colors.primary}
                  onChangeText={(value) => {
                    setEmail(value);
                  }}
                />
                <SignupInput
                  placeholder={"Password"}
                  placeholderColor={colors.primary}
                  secure_Text_Entry={true}
                  onChangeText={(value) => {
                    setPassword(value);
                  }}
                />
                <SignupInput
                  placeholder={"Confirm Password"}
                  placeholderColor={colors.primary}
                  secure_Text_Entry={true}
                  onChangeText={(value) => {
                    setRePassword(value);
                  }}
                />

                <Text
                  style={styles.signuptext}
                  onPress={() => router.push("/login")}
                >
                  Already have an account?{" "}
                  <Text style={styles.signupspan}>Log in</Text>
                </Text>
              </View>
              <ErrorMessage
                isEmailValid={isEmailValid}
                isPasswordValid={isPasswordValid}
                email={email}
                password={password}
              />
            </View>
          </ScrollView>
          {!keyboardVisible && (
            <View
              style={{
                position: "absolute",
                alignSelf: "center",
                bottom: 25,
                rowGap: 20,
                width: "100%",
                paddingHorizontal: 24,
              }}
            >
              <CustomButton
                text={"Create Account"}
                onPress={register}
                borderStyle={{
                  backgroundColor: colors.primary_contrast,
                  borderRadius: 4,
                }}
                textStyle={{
                  color: colors.__main_background,
                  fontFamily: typography.appFont[700],
                }}
                disabled={isClickable ? false : true}
              />
              <TouchableOpacity
                style={{ alignSelf: "center" }}
                onPress={() => router.push("/login")}
              >
                <Text>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

interface ErrorMessageProps {
  email: string;
  password: string;
  isEmailValid: (email: string) => boolean;
  isPasswordValid: (password: string) => boolean;
}



const ErrorMessage: FC<ErrorMessageProps> = ({ email, password, isEmailValid, isPasswordValid }) => {
  if (!isEmailValid(email) && email != "") {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <MaterialCommunityIcons
          name="exclamation"
          size={24}
          color={colors.primary}
        />
        <View>
          <Text
            style={{
              color: colors.primary,
              fontFamily: typography.appFont[400],
            }}
          >
            insert a valid email "example@example.com"
          </Text>
        </View>
      </View>
    );
  } else if (!isPasswordValid(password) && password != "") {
    return (
      <View style={{ marginTop: 20 }}>
        <Text
          style={{
            color: colors.primary,
            fontFamily: typography.appFont[400],
          }}
        >
          Your password should have:
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontFamily: typography.appFont[400],
          }}
        >
          At least 8 characters
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontFamily: typography.appFont[400],
          }}
        >
          At least 1 number
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontFamily: typography.appFont[400],
          }}
        >
          At least 1 Uppercase letter
        </Text>
        <Text
          style={{
            color: colors.primary,
            fontFamily: typography.appFont[400],
          }}
        >
          At least 1 Special character
        </Text>
      </View>
    );
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  background: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 40 : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  mainText: {
    fontSize: 35,
    fontFamily: typography.appFont[700],
    color: colors.__main_dark_text,
  },
  secondaryText: {
    fontSize: 15,
    color: colors.__blue_dark,
    fontFamily: typography.appFont[400],
  },
  formcontainer: {
    top: "10%",
    height: 250,
  },

  buttonContainer: {
    width: "90%",
    marginBottom: 10,
  },

  login: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "center",
  },

  logo: {
    width: 130,
    height: 130,
    borderRadius: 20,
    marginTop: 50,
    alignSelf: "center",
  },

  signuptext: {
    fontSize: 12,
    fontFamily: typography.appFont[400],
    color: colors.primary,
    alignSelf: "center",
  },

  signupspan: {
    color: colors.primary,
  },
  error_message: {
    fontFamily: typography.appFont[500],
    color: colors.primary,
    alignSelf: "center",
  },
});

export default Signup;
