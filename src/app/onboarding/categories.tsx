import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import React, { useEffect, useRef, useState, memo } from "react";
import colors from "../../config/colors";
import Header from "../../components/header/header";
import typography from "../../config/typography";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import axios from "../../hooks/axios/axiosConfig";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import { updateUser } from "../../hooks/users/updateUser";
import fetchAllCategories from "../../hooks/categories/fetchAllCategories";
import fetchFCMfromAsync from "../../hooks/async_storage/fetchFCMfromAsync";
import saveToken from "../../hooks/fcm_token/saveFCM";
import SignupInput from "../../components/buttons&inputs/SignupInput";
import OnBoardingProgressBar from "../../components/progressbar/OnBoardingProgressBar";
import { CategoryData } from "../../types";
import { hideKeyboard } from "../../functionality/hideKeyboard";
import { useRouter } from "expo-router";
 
 
 
 
const OnBoardingCategories = () => {
  //fetching token from asyncstorage
  const tokenFCM = fetchFCMfromAsync();
  //  fetching the user from async storage
  const currentUser = useFetchUserDataAsync();
 
  // declaring state to fetch categories from api
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  // handling Topics selection
  const [selectedTopics, setSelectedTopics] = useState<CategoryData[]>([]);
  const isDisabled = selectedTopics.length > 0 ? false : true;
 
  // initializing state to hold selected categories id
  const [categoriesId, setCategoriesId] = useState<string[]>([]);
 
  //saving token im database
  useEffect(() => {
    if (tokenFCM && currentUser) {
      saveToken(tokenFCM, currentUser.token);
    }
  }, [tokenFCM, currentUser]);
  // handling topic selection
  const handleSelectTopic = ({ item }: any) => {
    const isSelected = selectedTopics.includes(item);
    const isMaxLimitReached = selectedTopics.length >= 5;
    if (isSelected) {
      setSelectedTopics((prevSelected) =>
        prevSelected.filter((t) => t !== item)
      );
      setCategoriesId((prevId) => prevId.filter((i) => i !== item._id));
    } else if (!isMaxLimitReached) {
      setSelectedTopics((prevSelected) => [...prevSelected, item]);
      setCategoriesId((prevId) => [...prevId, item._id]);
    }
  };
 
  // handling style change on selection
  function setSelectedContainerStyle(value: CategoryData) {
    if (selectedTopics.includes(value)) return styles.selectedTopicContainer;
    return styles.topicContainer;
  }
 
  //fetching categories from database
 
  useEffect(() => {
    const fetchCategories = async () => {
      if (currentUser) {
        const fetchedCategories = await fetchAllCategories(currentUser.token);
        setCategories(fetchedCategories);
        setFilteredCategories(fetchedCategories);
      }
    };
    fetchCategories();
  }, [currentUser]);
 
  // updating the user
  const router=useRouter();
  const handleUpdate = (e: any) => {
    updateUser(e, categoriesId, currentUser?.token || '',router);
  };

  const toggleCategorySelection = (category: any) => {
    if (selectedTopics.includes(category)) {
      setSelectedTopics(selectedTopics.filter(n => n !== category));
    } else if (selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, category]);
    }
  };
 
  const [searchTerm, setSearchTerm] = useState("");
 
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredCategories(categories);
      return;
    }
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const renderSelectedCategories = () => {
    return selectedTopics.map((item, index) => (
      <View key={index} style={styles.selectedCategoryItem}>
        <Text style={styles.selectedCategoryText}>{item.name}</Text>
        <TouchableOpacity onPress={() => toggleCategorySelection(item)}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    ));
  };

 
  return (
    <TouchableWithoutFeedback onPress={()=>hideKeyboard}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Header />
            <Text style={styles.title}>What do you enjoy doing socially?</Text>
            <Text style={styles.subTitle}>
            Pick up to five interests that define your social life
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Social Interests..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={handleSearch}
            />
            {selectedTopics.length !== 0 && (
              <Text style={{ color: "#000", marginTop: 10 }}>
                Your Picks ({selectedTopics.length} of 5)
              </Text>
            )}

         <View style={styles.selectedCategoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderSelectedCategories()}
          </ScrollView>
          </View>

          
 
          <ScrollView
            style={styles.topicsScrollView}
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback
              style={{
                flex: 1,
                width: "100%",
                zIndex: 10,
              }}
            >
              <View style={styles.topicsContainer}>
                {filteredCategories &&
                  filteredCategories.map((category, index) => {
                    return (
                      <TouchableOpacity
                        style={setSelectedContainerStyle(category)}
                        key={category._id}
                        onPress={() => handleSelectTopic({ item: category })}
                      >
                        <Text style={styles.topicText}>{category.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
 
          <View style={styles.bottomContainer}>
            <CustomButton
              text={"Continue"}
              textStyle={{
                fontFamily: typography.appFont[700],
              }}
              borderStyle={{
                backgroundColor: isDisabled
                  ? colors.__disabled_button
                  : colors.primary_contrast,
                borderRadius: 4,
              }}
              onPress={handleUpdate}
              disabled={isDisabled}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
 
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    //backgroundColor: colors.__main_blue,
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    flex: 1,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
   // backgroundColor: Platform.OS != "web" ? colors.__main_blue : colors.__main_blue,
   backgroundColor: colors.__main_background,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 30,
    marginVertical: 10,
  },
  subTitle: {
    fontFamily: typography.appFont[500],
    color: "#ADADAD",
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 1,
  },
  searchInput: {
    backgroundColor: colors.__background_input, // Adjusted for visibility
    color: colors.__main_text_color, // White text for readability
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '100%',
  },
  selectedChoice: {
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
  topicsScrollView: {
    marginTop: "3%",
    marginBottom: Platform.OS != 'web' ? "15%" : "5%",
    height: Platform.OS != 'web' ? "50%" : "70%",
  },
  topicsContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    flexWrap: "wrap",
    paddingBottom: 10,
  },

  topicContainer: {
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
  selectedCategoriesContainer:{
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.__main_text_color,
    width: "100%",
     // Ensure full width for horizontal scrolling
  },
  selectedTopicContainer: {
    flexDirection: "row",
    columnGap: 5,
    padding: Platform.OS != 'web' ? 10 : 5,
    marginRight: 20,
    height: 40,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: Platform.OS != 'web' ? 10 : 0,
    backgroundColor: colors.primary_contrast,
  },
 
  topicText: {
    fontSize: 16,
    color: colors.__main_text_color,
  },
 
  scrollViewContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 10,
    paddingHorizontal: 5,
    marginBottom: Platform.OS != 'web' ? 50 : 0,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    rowGap: 15,
  },
  bottomSheetContainer: {
    padding: 24,
  },
  subcatWrapper: {
    flexDirection: "row",
    columnGap: 10,
    rowGap: 10,
    flexWrap: "wrap",
  },
  subcatContainer: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  selectedSubCatText: {
    fontFamily: typography.appFont[400],
    // color: "#fff",
  },
  selectedCategoryItem: {
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
  selectedCategoryText: {
    color: colors.__main_text_color,
    marginRight: 10,
  },
  removeButtonText: {
    color: "#CB7B7B",// Red color for the remove button
    fontWeight: 'bold',
  },
});
 
export default memo(OnBoardingCategories);