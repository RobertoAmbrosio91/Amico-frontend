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
 
 
const allCountries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "C\u00f4te d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]; // Your countries list

const Nationalities = () => {
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const currentUser = useFetchUserDataAsync() as CurrentUserType; // Adjust based on your user fetching logic
  const isDisabled = selectedNationalities.length === 0;

  const toggleNationalitySelection = (countryName: any) => {
    if (selectedNationalities.includes(countryName)) {
      setSelectedNationalities(selectedNationalities.filter(n => n !== countryName));
    } else if (selectedNationalities.length < 3) {
      setSelectedNationalities([...selectedNationalities, countryName]);
    }
  };

  const updateUser = async () => {
    const parameters = { nationalities: selectedNationalities };

    try {
      const user = await updateUserHook(currentUser.token, parameters);
      if (user && user.success) {
        router.push('/onboarding/profilereview');
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const renderSelectedNationalities = () => {
    return selectedNationalities.map((nationality, index) => (
      <View key={index} style={styles.selectedNationalityItem}>
        <Text style={styles.selectedNationalityText}>{nationality}</Text>
        <TouchableOpacity onPress={() => toggleNationalitySelection(nationality)}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        <Text style={styles.title}>Select your nationality</Text>
        <Text style={styles.subtitle}>Celebrate your heritage and forge connections by choosing up to three nationalities that reflect your story</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Nationalities..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.selectedNationalitiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderSelectedNationalities()}
          </ScrollView>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.countryContainer}>
          {filteredCountries.map((country, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.countryItem,
                selectedNationalities.includes(country) && styles.countryItemSelected,
              ]}
              onPress={() => toggleNationalitySelection(country)}>
              <Text style={styles.countryText}>
                {country}
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
                color: isDisabled
                ? colors.w_contrast
                : colors.__main_text_color,
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
                  Go back
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
  bottomContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: 20,
      rowGap: 15,
  },
  selectedNationalityItem: {
    // backgroundColor: '#555', // A slightly lighter shade for selected items
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.__logo_color,
    padding: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedNationalityText: {
    color: colors.__main_text_color,
    marginRight: 10,
  },
  removeButtonText: {
    color: "#CB7B7B",// Red color for the remove button
    fontWeight: 'bold',
  },
  scrollView: {
    marginTop: "3%",
    marginBottom: Platform.OS != 'web' ? "20%" : "5%",
    height: Platform.OS != 'web' ? "40%" : "70%",
  },
  countryContainer:{
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  countryItem: {
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
  countryItemSelected: {
    backgroundColor: colors.primary_contrast,
  },
  countryText: {
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
  selectedNationalitiesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.__main_text_color,
    width: "100%",
     // Ensure full width for horizontal scrolling
  },
  // Add more styles as needed
});
 
export default memo(Nationalities);