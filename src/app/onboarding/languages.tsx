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
  TextInput
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
 
 
const allLanguages = [
  "English", "Spanish",
  "Arabic (Egyptian)", "Bengali", "Cantonese (Yue Chinese)", "French", "German", "Gujarati", "Hindi", "Italian", 
  "Japanese", "Javanese", "Jin Chinese", "Kannada", "Korean", "Lahnda (Punjabi)", "Malayalam", "Marathi", "Mandarin Chinese", 
  "Polish", "Portuguese", "Russian", "Tamil", "Telugu", "Turkish", "Ukrainian", "Urdu", "Vietnamese", "Wu Chinese", "Xiang Chinese"
];

const Languages = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const currentUser = useFetchUserDataAsync() as CurrentUserType; // Adjust based on your user fetching logic
  const isDisabled = selectedLanguages.length === 0;

  const toggleNationalitySelection = (languageName: any) => {
    if (selectedLanguages.includes(languageName)) {
      setSelectedLanguages(selectedLanguages.filter(n => n !== languageName));
    } else if (selectedLanguages.length < 7) {
      setSelectedLanguages([...selectedLanguages, languageName]);
    }
  };

  const updateUser = async () => {
    const parameters = { languages_spoken: selectedLanguages };

    try {
      const user = await updateUserHook(currentUser.token, parameters);
      if (user && user.success) {
        router.push('/onboarding/profilereview');
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const renderSelectedLanguages = () => {
    return selectedLanguages.map((languages, index) => (
      <View key={index} style={styles.selectedLanguageItem}>
        <Text style={styles.selectedLanguageText}>{languages}</Text>
        <TouchableOpacity onPress={() => toggleNationalitySelection(languages)}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const filteredLanguages = allLanguages.filter(language =>
    language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        <Text style={styles.title}>Select your languages</Text>
        <Text style={styles.subtitle}>Dialogue diversity – mark the languages you master to mingle with the mosaic of the globe.</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Languages..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.selectedLanguagesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderSelectedLanguages()}
          </ScrollView>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.languageContainer}>
          {filteredLanguages.map((language, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.languageItem,
                selectedLanguages.includes(language) && styles.languageItemSelected,
              ]}
              onPress={() => toggleNationalitySelection(language)}>
              <Text style={styles.languageText}>
                {language}
              </Text>
            </TouchableOpacity>
          ))}
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>     
        <CustomButton
              text={"Save Profile"}
              textStyle={{
                fontFamily: typography.appFont[700],
              }}
              borderStyle={{
                backgroundColor: isDisabled
                  ? colors.__disabled_button
                  : colors.primary_contrast,
                borderRadius: 4,
              }}
              onPress={updateUser}
              disabled={isDisabled}
              />

              <TouchableOpacity
              onPress={() => {
                router.push ('/onboarding/profilereview')
              }}
              >
                <Text style={{ alignSelf: "center", color: "#4B5567" }}>
                  Go Back
                </Text>
              </TouchableOpacity>
              </View>


      </View>
    </SafeAreaView>
  );
};
 
 
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Platform.OS != "web" ? colors.__main_background : "gray",
    paddingTop: Platform.OS === "android" ? 30 : 0,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.__main_background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    // backgroundColor: Platform.OS != "web" ? colors.__main_blue : colors.__main_blue, This is Noosk Color
    backgroundColor: colors.__main_background,
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 30,
    marginVertical: 10,
  },
  subtitle: {
    fontFamily: typography.appFont[500],
    color: "#ADADAD",
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 1,
  },
  input: {
    paddingTop: 10, // Ensure no additional padding is pushing the text up
  },
  heading_container: {
    marginTop: Platform.OS != 'web' ? "10%" : "3%",
    rowGap: 10,
  },
  bottomContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: 20,
      rowGap: 15,
  },
  selectedLanguageItem: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.__logo_color,
    padding: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedLanguageText: {
    color: colors.__main_text_color,
    marginRight: 10,
  },
  removeButtonText: {
    color: "#CB7B7B", // Red color for the remove button
    fontWeight: 'bold',
  },
  scrollView: {
    marginTop: "3%",
    marginBottom: Platform.OS != 'web' ? "15%" : "5%",
    height: Platform.OS != 'web' ? "40%" : "70%",
  },
  languageContainer:{
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  languageItem: {
    flexDirection: "row",
    columnGap: 5,
    borderColor: colors.__blue_dark,
    borderWidth: 1,
    padding: 10,
    marginRight: 5,
    // width: "48%",
    height: 40,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  languageItemSelected: {
    backgroundColor: colors.primary_contrast,
  },
  languageText: {
    fontSize: 16,
    color: colors.__main_text_color,
  },
  searchInput: {
    backgroundColor: colors.__background_input, // Adjusted for visibility
    color: colors.__main_text_color, // White text for readability
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '100%',
  },
  selectedLanguagesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.__main_text_color,
    width: "100%",
     // Ensure full width for horizontal scrolling
  },
  // Add more styles as needed
});
 
export default memo(Languages);