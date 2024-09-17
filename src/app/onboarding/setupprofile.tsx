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
 
 
const SetUpProfile = () => {
  const router = useRouter()
  const standardProfileImage="https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
  // const [selectedImage, setSelectedImage] = useState<string>(
  //   "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png"
  // );
   const [selectedImage, setSelectedImage] = useState<string>(
    standardProfileImage
  );
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [pets, setPets] = useState([{ name: "", photo: standardProfileImage }]);
  const currentUser = useFetchUserDataAsync() as CurrentUserType;
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const sharer = currentUser && currentUser.user_type === "sharer";
  const isDisabled = firstName.trim().length < 3 || lastName.trim().length < 3;
 
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
    let cloudFrontURL = selectedImage !== standardProfileImage ? await uploadImageTos3(selectedImage) : standardProfileImage;
    
    // Since pets is now an array, map over it to update the photo URLs
    const updatedPets = await Promise.all(pets.map(async (pet) => {
      if (pet.photo !== standardProfileImage) {
        const photoUrl = await uploadImageTos3(pet.photo);
        return { ...pet, photo: photoUrl };
      } else {
        return { ...pet, photo: standardProfileImage }; // Keep the standard image if no photo was selected
      }
    }));
  
    if (cloudFrontURL) {
      const parameters = {
        first_name: firstName,
        last_name: lastName,
        profile: cloudFrontURL,
        languages_spoken: languages,
        nationalities: nationalities,
        pets: updatedPets // Pass the updated pets array directly
      };
  
      console.log("Selected Image URL:", selectedImage);
      console.log("Pet Photo URLs:", updatedPets.map(pet => pet.photo));
      console.log("Parameters being sent to updateUserHook:", parameters);
  
      try {
        const user = await updateUserHook(currentUser.token, parameters);
        console.log("Response from updateUserHook:", user);
        if (user && user.success) {
          if (sharer) {
            router.push('/onboarding/categories');
          } else {
            router.push('/onboarding/categories');
          }
        }
      } catch (error) {
        console.error("Error updating user:", error);
        // Handle the error state in your UI appropriately
      }
    }
  };
  
  return (
    <TouchableWithoutFeedback onPress={()=>hideKeyboard}>
      <KeyboardAvoidingView
        style={styles.wrapper}
      >
        <SafeAreaView style={styles.wrapper}>
          <View style={styles.container}>
          <Header
            style={{color: colors.secondary_contrast }}
          />
            <OnBoardingProgressBar progress={sharer ? 0.2 : 0.2} />
          <ScrollView
            style={[
              styles.container,
              keyboardVisible ? { marginBottom: 200 } : {},
            ]}
            showsHorizontalScrollIndicator={false}
            >
            <View style={styles.heading_container}>
              <Text style={styles.subTitle}>STEP{sharer ? " 1." : " 1."}</Text>
 
              <Text style={styles.title}>Create your social persona</Text>
            </View>
            <ProfileImage
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              />
            <View style={{ marginTop: "10%", marginBottom: "10%", rowGap: 15 }}>
              <View style={{ rowGap: 10 }}>
                <Text style={{ color: colors.__blue_dark, fontSize: 16, }}>First Name and Last Name</Text>
                <View style={{ rowGap: 10 }}>
                  <SignupInput
                    placeholder={"First Name"}
                    placeholderColor={colors.primary}
                    onChangeText={(value) => setFirstName(value)}
                    />
                  <SignupInput
                    placeholder={"Last Name"}
                    placeholderColor={colors.primary}
                    onChangeText={(value) => setLastName(value)}
                    />
                </View>
              </View>
              <View style={{ rowGap: 5 }}>
                  <Text style={{ color: colors.__blue_dark }}>
                  Your nationalities
                </Text>
                  <SignupInput
                  placeholder={"i.e: Italian, British, French..."}
                  multiline={true}
                  onChangeText={(value) => setNationalities(value.split(','))}
                  placeholderColor={colors.primary}
                  style={styles.input}
                  />
                <Text style={{ color: colors.__blue_dark }}>
                  Languages spoken
                </Text>
                  <SignupInput
                  placeholder={"i.e: Latin, Vietnamese, Sanscrit..."}
                  multiline={true}
                  onChangeText={(value) => setLanguages(value.split(','))}
                  placeholderColor={colors.primary}
                  style={styles.input}
                  />
                <Text style={{ color: colors.__blue_dark }}>
                  Your pet's name (optional)
                </Text>
                <SignupInput
                  placeholder={"Your pet's name..."}
                  onChangeText={(value) => setPets((prevPets) => [{ ...prevPets[0], name: value }])}
                  placeholderColor={colors.primary}
                  style={styles.input}
                  />
                  <PetPhoto
                    pets={pets}
                    setPets={setPets}
                  />
              </View>
            </View>
            <View
            style={{ paddingHorizontal: 24, paddingBottom: 20, rowGap: 15 }}
            >
            <CustomButton
              text={"Save Profile"}
              borderStyle={{
                backgroundColor: isDisabled
                ? colors.__disabled_button
                : colors.__teal_light,
                borderRadius: 4,
              }}
              textStyle={{ fontFamily: typography.appFont[700] }}
              onPress={updateUser}
              disabled={isDisabled}
              />
            {!sharer && (
              <TouchableOpacity
              onPress={() => {
                router.push ('/onboarding/categories')
              }}
              >
                <Text style={{ alignSelf: "center", color: "#4B5567" }}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            )}
            
          </View>
            </ScrollView>
          
          
            </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
 
type ProfileImageProps = {
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
  petPhoto?: string;
  setPetPhoto?: React.Dispatch<React.SetStateAction<string>>;
};
 
 
const ProfileImage: React.FC<ProfileImageProps> = ({ selectedImage, setSelectedImage, petPhoto, setPetPhoto }) => {
  const handleSelectImage = async () => {
    let result;
    result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
 
    if (result?.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (selectedUri) {
        setSelectedImage(selectedUri);
      }
    }
  };
 
 
  return (
    <View style={styles.profileImageContainer}>
      <TouchableOpacity onPress={handleSelectImage}>
        <AntDesign
          name="plussquareo"
          size={27}
          color={colors.__blue_dark}
          style={styles.icon}
        />
      </TouchableOpacity>
      {selectedImage && (
        <Image
          source={{
            uri: selectedImage,
          }}
          resizeMode="cover"
          style={styles.photo}
        />
      )}
    </View>
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
        <AntDesign name="plussquareo" size={27} color={colors.__blue_dark} style={styles.icon} />
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
    backgroundColor: Platform.OS != "web" ? colors.__main_blue : "gray",
    paddingTop: Platform.OS === "android" ? 30 : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    paddingHorizontal: 24,
    // backgroundColor: Platform.OS != "web" ? colors.__main_blue : colors.__main_blue, This is Noosk Color
    backgroundColor: Platform.OS != "web" ? "#000000" : "#000000",
  },
  title: {
    textAlign: "center",
    fontFamily: typography.appFont[700],
    color: "#fff",
    fontSize: 20,
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    color: colors.w_contrast,
    fontSize: 13,
    textAlign: "center",
  },
  profileImageContainer: {
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: "#E8E8F0",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 5,
    alignSelf: "center",
    marginTop: "10%",
  },
  photo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 100,
    zIndex: -1,
  },
  petImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  petImageLabel: {
    fontSize: 16,
    color: colors.__blue_dark,
    marginBottom: 10,
  },
  petPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8E8F0',
  },
  input: {
    paddingTop: 10, // Ensure no additional padding is pushing the text up
  },
  icon: {
    zIndex: 200,
  },
  heading_container: {
    marginTop: Platform.OS != 'web' ? "10%" : "3%",
    rowGap: 10,
  },
});
 
export default memo(SetUpProfile);