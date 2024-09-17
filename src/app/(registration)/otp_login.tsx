import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import CountryPicker, { Country } from "react-native-country-picker-modal";
import colors from "src/config/colors";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import typography from "src/config/typography";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { router, useLocalSearchParams } from "expo-router";
import { otpSignupLogin } from "@/hooks/users/otp_login_signup";
import { Image } from "expo-image";
import OtpInputs from "react-native-otp-textinput";

type CountryCode = Country["cca2"];

const OtpLogin = () => {
  const { isSignup } = useLocalSearchParams();
  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [callingCode, setCallingCode] = useState<string>("+1");
  const phoneInputAnim = useState(new Animated.Value(0))[0];
  const confirmationAnim = useState(
    new Animated.Value(Dimensions.get("window").width)
  )[0];

  //handling login/signup with otp
  const loginSignup = async () => {
    const filteredPhone = phone.replaceAll("-", "");
    try {
      const response = await otpSignupLogin(callingCode + filteredPhone);
      if (response && response.success) {
        if (response.result.first_name && response.result.user_name) {
          router.replace("/myeventsrevisited");
        } else {
          router.replace("/onboarding/firstlastname");
        }
      }
    } catch (error: any) {
      console.log("something went wrong", error);
    }
  };
  // formatting phone number adding -
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const currentValue = value.replace(/[^\d]/g, "");
    const cvLength = currentValue.length;

    if (cvLength < 4) return currentValue;
    if (cvLength < 7)
      return `${currentValue.slice(0, 3)}-${currentValue.slice(3)}`;

    return `${currentValue.slice(0, 3)}-${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
  };

  // Update your phone number state handling
  const handlePhoneInput = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    setPhone(formattedPhoneNumber);
  };
  // Update country selection
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode("+" + country.callingCode);
  };
  // handle send code
  const handleSendCode = async () => {
    try {
      const filteredPhone = phone.replaceAll("-", "");
      const confirmationResult = await auth().signInWithPhoneNumber(
        callingCode + filteredPhone
      );
      setConfirmation(confirmationResult);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  // handel verify code
  const handleVerifyCode = async () => {
    try {
      if (confirmation) {
        await confirmation.confirm(code);
        loginSignup();
      }
    } catch (error: any) {
      Alert.alert("Verification Error", error.message);
    }
  };
  // animation between components
  useEffect(() => {
    if (confirmation) {
      Animated.timing(phoneInputAnim, {
        toValue: -Dimensions.get("window").width,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(confirmationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [confirmation]);
  return (
    <SafeAreaView
      style={[Platform.OS === "android" && { paddingTop: 100 }, styles.wrapper]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={{
              transform: [{ translateX: phoneInputAnim }],
              // transform: [{ translateX: confirmationAnim }],
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <View style={styles.container}>
              <Image
                source={require("../../../assets/logo-amico-white.png")}
                style={{ width: 120, height: 32, marginBottom: 10 }}
              />
              <Text style={{ color: colors.__blue_dark }}>
                Verify Your Mobile Number
              </Text>
              <View style={styles.inputContainer}>
                <CountryPicker
                  countryCode={countryCode}
                  onSelect={onSelect}
                  withFilter
                  withFlag
                  withCallingCodeButton
                  withAlphaFilter
                  withCallingCode
                />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneInput}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  placeholderTextColor={"#000"}
                />
              </View>
              <CustomButton
                text="Send Code"
                onPress={handleSendCode}
                // onPress={loginSignup}
                borderStyle={styles.button}
                textStyle={styles.textButton}
              />
              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => router.back()}
              >
                <Text style={{ color: colors.__blue_dark }}>Back</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ translateX: confirmationAnim }],
              // transform: [{ translateX: phoneInputAnim }],
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <View style={styles.container}>
              <Image
                source={require("../../../assets/logo-amico-white.png")}
                style={{ width: 120, height: 32, marginBottom: 10 }}
              />
              <Text style={{ color: colors.__blue_dark }}>
                Enter Verification Code
              </Text>
              <View style={styles.verifyCode}>
                <View style={{ alignItems: "center", rowGap: 10 }}>
                  <Text
                    style={{ color: colors.__blue_dark }}
                  >{` Didn't receive the code on ${callingCode} *******${phone.replaceAll("-", "").slice(7, 10)}?`}</Text>
                  <TouchableOpacity
                    style={styles.sendAgain}
                    onPress={handleSendCode}
                  >
                    <Text style={{ color: colors.__blue_dark }}>
                      Send Again
                    </Text>
                  </TouchableOpacity>
                </View>
                {Platform.OS === "android" ? (
                  <OtpInputs
                    handleTextChange={(code) => setCode(code)}
                    inputCount={6}
                    inputCellLength={1}
                    tintColor={colors.__amico_blue}
                    textInputStyle={styles.OTPInput as any}
                  />
                ) : (
                  <OTPInputView
                    style={{ width: "80%", height: 130 }}
                    pinCount={6}
                    codeInputFieldStyle={styles.borderStyleBase}
                    codeInputHighlightStyle={styles.borderStyleHighLighted}
                    onCodeFilled={(code) => {
                      setCode(code);
                    }}
                  />
                )}
              </View>
              <CustomButton
                text="Verify Code"
                onPress={handleVerifyCode}
                borderStyle={styles.button}
                textStyle={styles.textButton}
              />
              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => router.back()}
              >
                <Text style={{ color: colors.__blue_dark }}>Back</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background,
  },
  logo: {
    fontSize: 40,
    fontFamily: typography.appFont[700],
    color: colors.__amico_blue,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
  },
  input: {
    paddingHorizontal: 15,
    color: colors.primary,
    backgroundColor: "transparent",
    height: 40,
    flex: 1,
    // borderRadius: 4,
    // borderColor: "#e1e1e1",
    // borderWidth: 1,
    width: "80%",
  },
  OTPInput: {
    color: colors.__secondary_background,
    marginBottom: 25,
  },
  button: {
    width: "80%",
    backgroundColor: colors.__amico_blue,
  },
  textButton: {
    color: colors.w_contrast,
    fontFamily: typography.appFont[600],
  },
  inputContainer: {
    width: "80%",
    marginTop: 200,
    alignItems: "center",
    flexDirection: "row",
    columnGap: 10,
    marginBottom: 30,
    backgroundColor: colors.__secondary_background,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  verifyCode: {
    marginTop: 140,
  },
  borderStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.__secondary_background,
  },

  borderStyleHighLighted: {
    borderColor: colors.__amico_blue,
  },

  underlineStyleHighLighted: {
    borderColor: colors.__logo_color,
  },
  sendAgain: {
    borderColor: colors.__blue_dark,
    borderWidth: 1,
    padding: 5,
    borderRadius: 8,
  },
});

export default OtpLogin;
