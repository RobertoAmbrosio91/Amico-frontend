import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from "react-native";
import { AntDesign, FontAwesome, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useNavigation, useRouter } from "expo-router";
import colors from "../../config/colors";
import typography from "../../config/typography";
import Header from "../../components/header/header";
import OnBoardingProgressBar from "../../components/progressbar/OnBoardingProgressBar";
import CustomButton from "../../components/buttons&inputs/CustomButton";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import fetchUserData from "../../hooks/users/fetchUserData";
import { UserData, CurrentUserType } from "../../types";
 
 
 
const ProfileReview: React.FC = () => {
  const router = useRouter()
  const currentUser = useFetchUserDataAsync() as CurrentUserType;    
  console.log ("adsad", currentUser)
  const [userData, setUserData] = useState<UserData | undefined>(undefined);


  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        try {
          const fetchedData = await fetchUserData(currentUser._id, currentUser.token);
          if (fetchedData) {
            setUserData(fetchedData);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchUser();
  }, [currentUser]);

  console.log ("This is pets",userData?.pets)
 
  return (
    <SafeAreaView style={styles.wrapper}>
      {userData && (
      <View style={styles.container}>
        <Header />
        <View style={styles.heading_container}>
            <Text style={styles.titleTop}>
            Welcome, {userData.first_name}
            </Text>
          </View>

        <View style={styles.profileImageContainer}>
              <Image source={{ uri: userData?.profile }} style={styles.profileImage} />
            </View>

          <View style={styles.heading_container}>
            <Text style={styles.title}>
            Your profile preview
            </Text>
            <Text style={styles.subTitle}>
            Add more details to your profile to connect with like-minded individuals. You can choose to complete this later.</Text>
          </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
              </View>
          <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.reviewScrollView}
          >
            <View style={styles.userData}>


                {/* Bucket 1: Name */}
              <TouchableOpacity style={styles.bucket} onPress={() => router.push('/onboarding/firstlastname')}>
              <View style={[styles.bucketIcon, { backgroundColor: userData.first_name && userData.first_name.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
              <FontAwesome name="user" size={24} color="white"  />
              </View>
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Name</Text>
                <Text style={styles.bucketContent}>{userData.first_name}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

            {/* Bucket 1a: Useriname */}
            <TouchableOpacity style={styles.bucket} onPress={() => router.push('/onboarding/firstlastname')}>
              <View style={[styles.bucketIcon, { backgroundColor: userData.user_name && userData.user_name.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
              <FontAwesome name="at" size={24} color="white"  />
              </View>
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Username</Text>
                <Text style={styles.bucketContent}>@{userData.user_name}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

              {/* Bucket 2: Nationalities */}
            <TouchableOpacity style={styles.bucket} onPress={() => router.push('/onboarding/nationalities')}>
            <View style={[styles.bucketIcon, { backgroundColor: userData.nationalities && userData.nationalities.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
            <MaterialIcons name="public" size={24} color="white"/>
              </View>
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Nationalities</Text>
                <Text style={styles.bucketContent}>{userData.nationalities?.join(', ')}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

              {/* Bucket 3: Languages */}
              <TouchableOpacity style={styles.bucket} onPress={() => router.push('/onboarding/languages')}>
              <View style={[styles.bucketIcon, { backgroundColor: userData.languages_spoken && userData.languages_spoken.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
              <FontAwesome name="language" size={24} color="white" />
              </View>
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Languages</Text>
                <Text style={styles.bucketContent}>{userData?.languages_spoken.join(', ')}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

              {/* Bucket 4: Pet Profile */}
              <TouchableOpacity
             style={styles.bucket}
              onPress={() => router.push('/onboarding/petprofile')}>   
              <View style={[styles.bucketIcon, { backgroundColor: userData.pets && userData.pets.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
              <MaterialCommunityIcons name="paw" size={24} color="white"/>
              </View>       
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Pet Profile</Text>
              <Text style={styles.bucketContent}>{userData.pets[0]?.name || 'No pet name specified'}</Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

              {/* Bucket 5: Interests */}
              <TouchableOpacity style={styles.bucket} onPress={() => router.push('/onboarding/categories')}>
              <View style={[styles.bucketIcon, { backgroundColor: userData.category_data && userData.category_data.length > 0 ? colors.primary_contrast : "#F5F0E5" }]}>
              <MaterialCommunityIcons name="heart" size={24} color="white"/>
              </View>
              <View style={styles.bucketText}>
                <Text style={styles.bucketTitle}>Interests</Text>
                <Text style={styles.bucketContent}>
                {userData?.subcategory_data.map((item, index, array) => 
                  `${item.name}${index < array.length - 1 ? ', ' : ''}`
                ).join('')}{userData?.subcategory_data.length > 2 ? '...' : ''}
              </Text>
              </View>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>


            </View>
          </ScrollView>
        <BottomContainer/>
      </View>
      )}
    </SafeAreaView>
  );
};
  
 
 
const BottomContainer = () => {
  return (
    <View style={styles.bottomContainer}>
      <CustomButton
        onPress={() =>
          router.push({
            pathname: "/myeventsrevisited",
          })
        }
        text={"Join Amico"}
        textStyle={{
          fontFamily: typography.appFont[700],
        }}
        borderStyle={{
          backgroundColor: colors.primary_contrast,
          borderRadius: 4,
        }}
      />
    </View>
  );
};
 
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Platform.OS != "web" ? colors.__main_background : "gray",
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    // backgroundColor: Platform.OS != "web" ? colors.__main_blue : colors.__main_blue,
    backgroundColor: colors.__main_background
  },
  titleTop:{
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 30,
    marginTop: 10,
    marginBottom: 30,
    width: "100%",
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.__main_text_color,
    fontSize: 18,
    marginTop: 10,
    width: "100%",
    textAlign: "center"
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    fontSize: 16,
    marginTop: 0,
    color: colors.__blue_dark,
    width: "100%",
    marginBottom: 20,
    textAlign: "center"
  },
  heading_container: {
    marginTop: Platform.OS != 'web' ? "5%" : "4%",
    rowGap: 10,
  },
  reviewScrollView: {
    marginBottom: Platform.OS != 'web' ? "14%" : "2%",
  },
  userData: {
    flex: 1,
    marginVertical: Platform.OS != 'web' ? "12%": "3%",
    rowGap: 20,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  username: {
    color: colors.__main_text_color,
    fontFamily: typography.appFont[700],
    fontSize: 16,
  },
  selectedChoice: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.__teal_light,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(84, 215, 183, 0.50)",
  },
  topicText: {
    fontFamily: typography.appFont[400],
    color: colors.__main_text_color,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    rowGap: 15,
  },
  bucket: {
    flexDirection: 'row',
    borderRadius: 8,
    alignItems: 'center',
    height: "15%",
  },
  bucketIcon: {
    marginRight: 15,
    borderRadius: 8,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "15%",
    aspectRatio: 1,
  },
  bucketText: {
    flex: 1,
  },
  bucketTitle: {
    color: colors.__main_text_color,
    fontSize: 18,
    fontFamily: typography.appFont[700],
  },
  bucketContent: {
    color: colors.__blue_dark,
    fontSize: 14,
    fontFamily: typography.appFont[400],
    marginTop: 5,
  },
});
export default ProfileReview;
