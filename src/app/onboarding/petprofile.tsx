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
  Image,
} from "react-native";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import { AntDesign } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import axios from "../../hooks/axios/axiosConfig";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import { updateUserInStorage } from "../../hooks/async_storage/updateUserInStorage";
import { uploadImageTos3 } from "../../functionality/uploadImageTos3";
import fetchFCMfromAsync from "../../hooks/async_storage/fetchFCMfromAsync";
import OnBoardingProgressBar from "../../components/progressbar/OnBoardingProgressBar";
import { CurrentUserType } from "../../types";
import { useRouter } from "expo-router";
import { hideKeyboard } from "../../functionality/hideKeyboard";
import updateUserHook from "@/hooks/users/updateUserHook";
 
 
const PetProfile = () => {
  const router = useRouter()
  const standardProfileImage="https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
  const [pets, setPets] = useState([{ name: "", photo: standardProfileImage }]);
  const currentUser = useFetchUserDataAsync() as CurrentUserType;
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const isDisabled = pets[0].name.trim().length < 3;

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
    const updatedPets = await Promise.all(pets.map(async (pet) => {
      if (pet.photo !== standardProfileImage) {
        const photoUrl = await uploadImageTos3(pet.photo);
        return { ...pet, photo: photoUrl };
      } else {
        return { ...pet, photo: standardProfileImage }; // Keep the standard image if no photo was selected
      }
    }));
      const parameters = {
        pets: updatedPets
      };
    
      try {
        const user = await updateUserHook(currentUser.token, parameters);
        if (user && user.success) {
            router.push('/onboarding/profilereview');
        }
      } catch (error) {
        console.error("Error updating user:", error);
        // Handle the error state in your UI appropriately
      }
    
  };
  
  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headingContainer}>
          <Header/>
          </View>
          <Text style={styles.title}>Your pet's profile</Text>
          <PetPhoto
          pets={pets}
          setPets={setPets}
          />
          <View style={styles.inputContainer}>
            <SignupInput
            placeholder={"Your pet's name..."}
            onChangeText={(value) => setPets((prevPets) => [{ ...prevPets[0], name: value }])}
            placeholderColor={colors.primary}
            style={styles.input}
            />
          </View>

          <View style={styles.bottomContainer}>
          <CustomButton
            text="Save Profile"
            onPress={updateUser}
            disabled={isDisabled}
            borderStyle={{
              backgroundColor: isDisabled
                ? colors.__disabled_button
                : colors.primary_contrast,
              borderRadius: 4,
            }}
            textStyle={{ fontFamily: typography.appFont[700] }}
          />

            <TouchableOpacity
              onPress={() => {
                router.push ('/onboarding/profilereview')
              }}
              >
                <Text style={{ alignSelf: "center", color: "#4B5567" }}>
                  Go back
                </Text>
            </TouchableOpacity>
            </View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
 
type PetPhotoProps = {
  pets: { name: string; photo: string; }[]; // An array of pet objects
  setPets: React.Dispatch<React.SetStateAction<{ name: string; photo: string; }[]>>; // Function that updates an array of pet objects
};
 
 
const PetPhoto: React.FC<PetPhotoProps> = ({ pets, setPets }) => {
  const handleSelectPetPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
 
    if (!result.canceled && result.assets) {
      const selectedPetUri = result.assets[0].uri;
      // Update the entire pet object with the new photo URI
      // This updates the first pet's photo in the array
    setPets(prevPets => prevPets.map((pet, index) => index === 0 ? { ...pet, photo: selectedPetUri } : pet));
    }
  };
 
  return (
    <View style={styles.profileImageContainer}>
      <TouchableOpacity onPress={handleSelectPetPhoto}>
        <AntDesign name="plussquareo" size={27} color={colors.__blue_dark} />
      </TouchableOpacity>
      <Image
        source={{ uri: pets[0].photo }}
        resizeMode="cover"
        style={styles.petPhoto}
      />
    </View>
  );
};
 
 
 
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background, // Assuming you have a background color defined
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center', // Center content horizontally
  },
  headingContainer: {
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.textPrimary,
    fontSize: 22,
    marginTop: 10,
    textAlign: "center",
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  profileImageContainer: {
    marginVertical: 20,
    // Profile image container styles remain the same
  },
  inputContainer: {
    width: '100%', // Ensure inputs take full container width
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
    width: '100%', // Full width button
  },
  disabledButton: {
    backgroundColor: colors.disabled, // Assuming you have a disabled color defined
  },
  buttonText: {
    fontFamily: typography.appFont[700],
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
  },
  petPhoto: {
    // Example style, adjust as needed
    width: 120,
    height: 120,
    borderRadius: 75,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    rowGap: 15,
},
});
 
export default memo(PetProfile);