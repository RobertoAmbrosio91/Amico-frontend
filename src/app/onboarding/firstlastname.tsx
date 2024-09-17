import React, { useState, useEffect, memo, FC } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Platform,
} from "react-native";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import { AntDesign } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import { uploadImageTos3 } from "../../functionality/uploadImageTos3";

import { CurrentUserType } from "../../types";
import { useRouter } from "expo-router";
import updateUserHook from "@/hooks/users/updateUserHook";
import { Image } from "expo-image";

const FirstLastName = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const currentUser = useFetchUserDataAsync() as CurrentUserType;
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const isDisabled = firstName.trim().length < 1 || selectedImage === "";

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
  // get permissions
  useEffect(() => {
    const getPermissionAsync = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permission to select an image.");
      }
    };
    getPermissionAsync();
  }, []);
  // updating user data
  const updateUser = async () => {
    // Directly attempt to upload the selected image without comparing it to a standard profile image
    let cloudFrontURL = await uploadImageTos3(selectedImage);

    if (cloudFrontURL) {
      const parameters = {
        first_name: firstName,
        last_name: lastName,
        profile: cloudFrontURL,
      };

      try {
        const user = await updateUserHook(currentUser.token, parameters);
        if (user && user.success) {
          router.push("/onboarding/createusername");
        }
      } catch (error) {
        console.error("Error updating user:", error);
        // Handle the error state in your UI appropriately
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headingContainer}>
            <Header />
          </View>
          <Text style={styles.title}>Welcome to the community!</Text>
          <Text style={styles.subTitle}>
            Please provide your first name and select a profile picture to
            introduce yourself.
          </Text>
          <ProfileImage
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />

          <View style={styles.inputContainer}>
            <SignupInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholderColor="#999"
            />
          </View>

          <CustomButton
            text="Continue"
            onPress={updateUser}
            disabled={isDisabled}
            borderStyle={{
              backgroundColor: isDisabled
                ? colors.__disabled_button
                : colors.__amico_blue,
              borderRadius: 4,
            }}
            textStyle={{
              fontFamily: typography.appFont[700],
              color: isDisabled ? colors.__main_background : colors.w_contrast,
            }}
          />
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            gap: 10,
          }}
        >
          <AntDesign name="eye" size={14} color="black" />
          <Text style={styles.profileText}>
            This will be shown on your profile.
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

type ProfileImageProps = {
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
};

const ProfileImage: React.FC<ProfileImageProps> = ({
  selectedImage,
  setSelectedImage,
}) => {
  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (result?.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (selectedUri) {
        // Use expo-image-manipulator to resize and compress the image
        // const manipResult = await ImageManipulator.manipulateAsync(
        //   selectedUri,
        //   [
        //     { resize: { width: 200, height: 200 } }, // Resize to 400x400 or any size you deem appropriate
        //   ],
        //   { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Adjust compression level and format
        // );
        // setSelectedImage(manipResult.uri);
        setSelectedImage(selectedUri);
      }
    }
  };

  return (
    <View style={styles.profileImageContainer}>
      <TouchableOpacity onPress={handleSelectImage}>
        {!selectedImage && (
          <AntDesign name="plussquareo" size={27} color={colors.__blue_dark} />
        )}
        {selectedImage && (
          <Image
            source={{
              uri: selectedImage,
            }}
            contentFit="cover"
            style={styles.photo}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background, // Assuming you have a background color defined
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center", // Center content horizontally
  },
  headingContainer: {
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 30,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    fontSize: 16,
    marginTop: 0,
    color: colors.__blue_dark,
    width: "100%",
  },
  profileImageContainer: {
    marginVertical: 40,
    alignItems: "center", // Center content horizontally within the container
    justifyContent: "center",
    backgroundColor: "rgba(41, 182, 246, 0.1)",
    width: 150,
    height: 150,
    borderRadius: 10,
    // Profile image container styles remain the same
  },
  inputContainer: {
    width: "100%", // Ensure inputs take full container width
    marginTop: 20,
  },
  input: {
    marginBottom: 15, // Add space between inputs
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary, // Use your primary color
    paddingVertical: 12,
    borderRadius: 25, // Rounded button edges
    width: "100%", // Full width button
  },
  disabledButton: {
    backgroundColor: colors.disabled, // Assuming you have a disabled color defined
  },
  buttonText: {
    fontFamily: typography.appFont[700],
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
  },
  photo: {
    // Example style, adjust as needed
    width: 150,
    height: 150,
    borderRadius: 10, // Adjusted for rounded square appearance
    borderColor: colors.w_contrast,
  },
  profileText: {
    fontFamily: typography.appFont[400],
    color: colors.__main_text_color, // Black color for the text
    fontSize: 12,
  },
});
 
export default memo(FirstLastName);