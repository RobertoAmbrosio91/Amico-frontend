import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  TextInputProps
} from "react-native";
import React, { useState } from "react";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import OnBoardingProgressBar from "../../components/progressbar/OnBoardingProgressBar";
import typography from "../../config/typography";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import validator from "validator";
import sendVerification from "../../hooks/users/sendVerification";
import axios from "../../hooks/axios/axiosConfig";
import { updateUserInStorage } from "../../hooks/async_storage/updateUserInStorage";
import { useRouter } from "expo-router";
import { hideKeyboard } from "../../functionality/hideKeyboard";

export type RootParamList = {
  ProfileReview: undefined; // No parameters expected for the ProfileReview route
  
};


const UserVerification = () => {
  const router = useRouter()
  const currentUser = useFetchUserDataAsync();
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    linkedin: "",
    twitter: "",
  });

  const [urlValidity, setUrlValidity] = useState({
    instagram: true,
    linkedin: true,
    twitter: true,
  });

  function isValidUrl(url: string) {
    return validator.isURL(url);
  }
  const handleSocialLinks = (key: string, value: string) => {
    const isValid = value === "" || isValidUrl(value);
    setUrlValidity((prevValidity) => ({ ...prevValidity, [key]: isValid }));
    if (isValid) {
      setSocialLinks((prevLinks) => ({
        ...prevLinks,
        [key]: value,
      }));
    }
  };

  type SocialLinksType = {
    instagram: boolean;
    linkedin: boolean;
    twitter: boolean;
  };
  const checkLinksValidity = () => {
    return Object.values(socialLinks).some((link, index) => {
      const key = Object.keys(socialLinks)[index] as keyof SocialLinksType;
      return link !== "" && urlValidity[key];
    });
  };
  const isDisabled = !checkLinksValidity();
  const [shareSocialLinks, setShareSocialLinks] = useState(false);
  const sendEmailForVerification = async () => {
    if (currentUser) {
      try {
        const sendEmail = await sendVerification(
          currentUser.email,
          currentUser._id,
          socialLinks.instagram,
          socialLinks.linkedin,
          socialLinks.twitter
        );

        if (sendEmail) {
          if (shareSocialLinks) {
            const updateUser = await axios.post(
              "/user/profile-update",
              {
                social_links: socialLinks,
              },
              {
                headers: {
                  "x-access-token": currentUser.token,
                },
              }
            );
            if (updateUser && updateUser.data.success) {
              updateUserInStorage(updateUser.data.result);

            }
          }
          router.replace ('/onboarding/profilereview')
        }
      } catch (error) {
        console.log("Error sending email", error);
      }
    }
  };
  return (
    <TouchableWithoutFeedback onPress={()=>hideKeyboard}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Header />
          <OnBoardingProgressBar progress={1} />
          <ScrollView
          showsHorizontalScrollIndicator={false}
          >
            <View style={{ rowGap: 30 }}>
              <View style={styles.heading_container}>
                <Text style={styles.subTitle}>FINAL STEP</Text>
                <Image
                  source={require("../../../assets/images/MEDALLA.png")}
                  style={{ alignSelf: "center" }}
                />
                <Text style={styles.title}>
                  Get your expertise verified to stand out
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/images/MEDALLA.png")}
                  style={{ alignSelf: "center", width: 30, height: 30 }}
                />
                <Text style={{ color: "#fff" }}>
                  Are you an expert in your field?{" "}
                  <Text style={{ color: colors.__teal_light }}>
                    Get your expertise verified!
                  </Text>
                </Text>
              </View>

              <View style={{ rowGap: 7 }}>
                <Text
                  style={[styles.inputText, { color: colors.__blue_medium }]}
                >
                  Social verification links (share at least one)
                </Text>
                <Text
                  style={[styles.inputText, { color: colors.__01_light_n }]}
                >
                  Add some links that prove your expertise
                </Text>
                <View style={{ rowGap: 15 }}>
                  <View style={{ flexDirection: "row" }}>
                    <PersonalizedInput
                      isValid={urlValidity.instagram}
                      icon={"instagram"}
                      onChangeText={(value: string) =>
                        handleSocialLinks("instagram", value)
                      }
                    />
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <PersonalizedInput
                      isValid={urlValidity.linkedin}
                      icon={"linkedin"}
                      onChangeText={(value: string) =>
                        handleSocialLinks("linkedin", value)
                      }
                    />
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <PersonalizedInput
                      isValid={urlValidity.twitter}
                      icon={"twitter"}
                      onChangeText={(value: string) =>
                        handleSocialLinks("twitter", value)
                      }
                    />
                  </View>
                  <RadioButton
                    shareSocialLinks={shareSocialLinks}
                    setShareSocialLinks={setShareSocialLinks}
                  />
                  <CustomButton
                    text={"Continue"}
                    disabled={isDisabled}
                    textStyle={{ fontFamily: typography.appFont[700] }}
                    borderStyle={{
                      backgroundColor: isDisabled
                        ? "rgba(84, 215, 183, 0.3)"
                        : colors.__teal_light,
                    }}
                    onPress={sendEmailForVerification}
                  />
                  {/* <TouchableOpacity
                    onPress={() => router.push ('/onboarding/profilereview')}
                  >
                    <Text style={styles.skip}>Skip for now</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

type PersonalizedInputProps = {
  icon: any;
  onChangeText: TextInputProps['onChangeText'];
  isValid: boolean;
};


const PersonalizedInput: React.FC<PersonalizedInputProps> = ({ icon, onChangeText, isValid }) => {
  return (
    <View
      style={[
        styles.personalizedInput,
        { borderColor: isValid ? "transparent" : "red" },
      ]}
    >
      <FontAwesome name={icon} size={18} color={colors.__blue_medium} />
      <Text style={{ fontSize: 20, color: colors.__blue_medium }}> / </Text>
      <SignupInput
        style={{ borderColor: "transparent" }}
        containerStyle={{ flex: 1 }}
        onChangeText={onChangeText}
      />
    </View>
  );
};

type RadioButtonProps = {
  shareSocialLinks: boolean;
  setShareSocialLinks: (value: boolean) => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({ shareSocialLinks, setShareSocialLinks }) => {
  return (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => setShareSocialLinks(!shareSocialLinks)}
    >
      <View style={styles.outerRadio}>
        {shareSocialLinks && <View style={styles.innerRadio}></View>}
      </View>
      <Text style={{ color: colors.__blue_medium }}>
        Show my social links to my profile
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Platform.OS != "web" ? colors.__main_blue : "gray",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    backgroundColor: Platform.OS != "web" ? colors.__main_blue : colors.__main_blue,
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.w_contrast,
    fontSize: 20,
    textAlign: "center",
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    color: colors.w_contrast,
    fontSize: 13,
    textAlign: "center",
  },
  heading_container: {
    marginTop: Platform.OS != 'web' ? "10%" : "3%",
    rowGap: 10,
  },
  inputText: {
    fontFamily: typography.appFont[400],
  },
  personalizedInput: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 4,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 2,
  },
  skip: {
    color: colors.__blue_medium,
    textAlign: "center",
  },
  radioContainer: {
    flexDirection: "row",
    columnGap: 5,
  },
  outerRadio: {
    width: 15,
    height: 15,
    borderRadius: 100,
    backgroundColor: "#fff",

    alignItems: "center",
    justifyContent: "center",
  },
  innerRadio: {
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: colors.__teal_light,
  },
});

export default UserVerification;
