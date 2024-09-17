import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ScrollView,
    Platform,
  } from "react-native";
  import { RefObject, useState, useEffect } from 'react';
  import React, {useRef} from 'react';
  import { BottomSheetModal } from "@gorhom/bottom-sheet";
  import Header from "@/components/header/header";
  import { AntDesign } from "@expo/vector-icons";
  import typography from "src/config/typography";
  import colors from "src/config/colors";
  import { Octicons } from "@expo/vector-icons";
  import { MaterialIcons } from "@expo/vector-icons";
  import CustomButton from "@/components/buttons&inputs/CustomButton";
  import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
  import deleteAccount from "@/hooks/users/deleteAccount";
  import { useNavigation } from "@react-navigation/native";
  import editProfile from "@/hooks/users/editProfile";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import logout from "@/hooks/users/logout";
  import selectSingleImage from "@/services/selectSingleImage";
  import updateProfileImage from "@/hooks/users/updateProfileImage";
  import { router, useRouter } from "expo-router";
  import fetchUserData from "@/hooks/users/fetchUserData";
  import { CurrentUserType } from "@/types";
  import { Image } from 'expo-image';


  
  interface UserState {
    first_name: string;
    last_name: string;
    image: any[]; // Replace 'any' with a more specific type if you know the structure of the objects in the array
  }
  
  
  type UserData = {
    profile: string;
    // add other properties of userData here
    user_name?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    subcategory_data?: Array<{ _id: string; name: string }>;
    image?: string[];
    
  };
  
  // Define the props type for EditProfile
  type EditProfileProps = {
    bottomSheetModalRef: RefObject<BottomSheetModal>;
    userData: UserData;
  };
  
  // Define the state type for user details (adjust according to the actual structure)
  type UserDetailsState = {
    first_name: string;
    last_name: string;
    user_name: string;
    profile: string;
    subcategory_data?: Array<{ _id: string; name: string }>;
  };
  
  
  const Settings: React.FC<EditProfileProps> = () => {
    const router = useRouter()
    const currentUser: CurrentUserType | null | undefined = useFetchUserDataAsync();
    const [userData, setUserData] = useState<UserData | null | undefined>(null);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<UserDetailsState>({
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      user_name: userData?.user_name || '', 
      subcategory_data: userData?.subcategory_data || [],
      profile: userData?.profile || '',
    });
    const [isDeleted, setIsDeleted] = useState(false);
    //clear all data from async
    const clearAllData = async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        console.error("Error clearing AsyncStorage:", error);
      }
    };
    // handling delete account modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModal = () => {
      setIsModalVisible(!isModalVisible);
    };
    

    useEffect(() => {
        const fetch_user_data = async () => {
          
          setLoading(true);
          if (currentUser) {
            const fetchedUserData = await fetchUserData(
              currentUser._id,
              currentUser.token
            );
            setUserData(fetchedUserData);
            setUserDetails({ // Use setUserDetails to update userDetails based on the fetched userData
                first_name: fetchedUserData?.first_name || '',
                last_name: fetchedUserData?.last_name || '',
                user_name: fetchedUserData?.user_name || '',
                subcategory_data: fetchedUserData?.subcategory_data || [],
                profile: fetchedUserData?.profile || '',
              });
            setLoading(false);
          }
        };
        fetch_user_data();
      }, [currentUser]);
  

    // handling delete account functionality
    const deleteUser = async () => {
      if (currentUser) {
        const response = await deleteAccount(currentUser.token);
        if (response && response.success) {
          clearAllData();
          setIsModalVisible(!isModalVisible);
          setIsDeleted(!isDeleted);
          setTimeout(() => {
            router.replace('/landing');
          }, 4000);
        }
      }
    };
    //handling update user
    const [user, setUser] = useState<UserState>({
      first_name: "",
      last_name: "",
      image: [],
  });
  
    const isButtonVisible =
      user.first_name || user.last_name
  
    const updateProfile = async () => {
      if (currentUser) {
        const response = await editProfile(
          user.first_name,
          user.last_name,
          currentUser.token
        );
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          first_name: user.first_name,
          last_name: user.last_name,
        }));
      }
    };
  
    //handling user logout
    const logTheUserOut = async () => {
      if (currentUser) {
        try {
          const logOut = await logout(currentUser.token);
          if (logOut) {
            clearAllData();
            router.replace("/landing");
          }
        } catch (error) {
          console.log("Error logging out", error);
        }
      }
    };
  


    return (
            <View style={styles.container}>
              <Heading />
              <ProfileImage userData={userDetails} currentUser={currentUser} />
              <View>
                <PersonalData
                  userData={userDetails}
                  setUser={setUser}
                  updateProfile={updateProfile}
                  isButtonVisible={isButtonVisible}
                />
                <TouchableOpacity
                  style={{ marginTop: 30 }}
                  onPress={logTheUserOut}
                >
                  <Text style={{ color: colors.__blue_dark, fontSize: 16 }}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 10 }} onPress={toggleModal}>
                  <Text style={{ color: "#E96B60",fontSize: 16 }}>Delete Account</Text>
                </TouchableOpacity>
              </View>
           
            {isModalVisible && (
              <MyModal
                isModalVisible={isModalVisible}
                toggleModal={toggleModal}
                deleteUser={deleteUser}
              />
            )}
            {isDeleted && <DeletedUserMessage />}
            </View>
    );
  };
  

  
  const Heading: React.FC = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color={colors.__dark_text} />
        </TouchableOpacity>
        <Text style={styles.editProfile}>Profile Settings</Text>
        <Text style={{ color: "transparent" }}>...</Text>
      </View>
    );
  };

  type ProfileImageProps = {
    userData: UserData;
    currentUser: any;
  };

  const ProfileImage: React.FC<ProfileImageProps> = ({
    userData,
    currentUser,
  }) => {
    const [profileImage, setProfileImage] = useState("");
    const [showButton, setShowButton] = useState(false);
    const currentProfileImage = userData.profile
      ? `${userData.profile}`
      : "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
    const handleImageSelection = async () => {
      const selectedUri = await selectSingleImage();
      if (selectedUri) {
        if (currentUser) {
          updateProfileImage(selectedUri, currentUser.token);
          setProfileImage(selectedUri);
        }
      }
    };
    return (
      <View>
        <View style={styles.profile_img_container}>
          <Image
            source={{
              uri: profileImage != "" ? `${profileImage}` : currentProfileImage,
            }}
            style={styles.profile_img}
            contentFit="cover"
          />
          <TouchableOpacity
            style={{ position: "absolute", bottom: 2, right: 2 }}
            onPress={handleImageSelection}
          >
            <Octicons name="diff-added" size={24} color={colors.__blue_dark} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  type PersonalDataProps = {
    userData: UserData;
    setUser: React.Dispatch<React.SetStateAction<any>>; // Adjust the type for setUser
    updateProfile: () => void;
    isButtonVisible: any;
  };

  const PersonalData: React.FC<PersonalDataProps> = ({
    userData,
    setUser,
    updateProfile,
    isButtonVisible,
  }) => {
    const { user_name, first_name, last_name } = userData;

    return (
      <View style={{ marginTop: 20 }}>
        <View>
          <Text style={styles.textInfoTitle}>Username</Text>
          <Text style={styles.textInfo}>@{user_name}</Text>
        </View>
        <View>
          <Text style={styles.textInfoTitle}>First Name</Text>
          <Text style={styles.textInfo}>{first_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            router.dismiss(), router.push("/privacy_policy");
          }}
          style={styles.inputRow}
        >
          <Text style={styles.text}>
            Platform Guidelines, Terms & Conditions and Privacy Policy
          </Text>
        </TouchableOpacity>
        {isButtonVisible && (
          <CustomButton
            text={"update"}
            onPress={updateProfile}
            borderStyle={{ marginTop: 20 }}
          />
        )}
      </View>
    );
  };

  type MyModalProps = {
    isModalVisible: boolean;
    toggleModal: () => void;
    deleteUser: () => void;
  };

  const MyModal: React.FC<MyModalProps> = ({
    isModalVisible,
    toggleModal,
    deleteUser,
  }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Delete Account</Text>

            <Text>
              By deleting your account you are aware that all your data and
              content on the platform will be permanently deleted.
            </Text>
            <Text>Would you like to proceed with deletion?</Text>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 30,
                columnGap: 20,
              }}
            >
              <View>
                <CustomButton
                  text={"Delete"}
                  onPress={deleteUser}
                  borderStyle={styles.button}
                  textStyle={styles.buttonText}
                />
              </View>
              <View>
                <CustomButton
                  text={"Cancel"}
                  onPress={toggleModal}
                  borderStyle={styles.button}
                  textStyle={styles.buttonText}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const DeletedUserMessage = () => {
    const router = useRouter();
    return (
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          justifyContent: "center",
        }}
      >
        <View style={styles.deletedMessageContainer}>
          <Text style={styles.textMessage}>
            Account has been deleted successfully
          </Text>
          <TouchableOpacity onPress={() => router.replace("/landing")}>
            <Text style={styles.textMessage}>Leave the app</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "android" ? "15%" : 30,
      rowGap: 10,
      paddingVertical: 30,
      backgroundColor: colors.__secondary_background,
    },
    editProfile: {
      fontSize: 20,
      fontFamily: typography.appFont[600],
      color: colors.__dark_text,
      marginBottom: 10,
    },
    profile_img_container: {
      height: 70,
      width: 70,
      borderRadius: 8,
      alignSelf: "center",
    },
    profile_img: {
      width: "100%",
      height: "100%",
      // resizeMode: "cover",
      position: "absolute",
      borderRadius: 8,
    },
    changePhotoText: {
      alignSelf: "center",
      fontFamily: typography.appFont[700],
      marginTop: 10,
    },
    text: {
      fontFamily: typography.appFont[400],
      color: colors.__main_text,
      fontSize: 15,
      width: "100%",
    },
    inputRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.__blue_light,
      paddingVertical: 15,
    },

    textInfoTitle: {
      color: colors.__dark_text,
      fontSize: 16,
      fontFamily: typography.appFont[500],
    },
    textInfo: {
      color: colors.__main_text,
      fontSize: 14,
      backgroundColor: colors.__background_input,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 10,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      paddingHorizontal: 10,
    },
    title: {
      fontFamily: typography.appFont[700],
    },
    category: {
      backgroundColor: "rgba(84, 215, 183, 0.50)",
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 4,
      borderColor: colors.__teal_dark,
      borderWidth: 1,
    },
    modalContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-end",
    },
    modalContent: {
      height: 350,
      backgroundColor: "#fff",
      padding: 24,
      alignItems: "center",
      rowGap: 20,
    },
    deletedMessageContainer: {
      width: "80%",
      alignSelf: "center",
      padding: 24,
      alignItems: "center",
      rowGap: 40,
      borderRadius: 4,
      backgroundColor: colors.__main_blue,
    },
    textMessage: {
      color: colors.__blue_light,
      fontFamily: typography.appFont[500],
      fontSize: 14,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.__amico_blue,
    },
    buttonText: {
      fontFamily: typography.appFont[600],
      color: "#fff",
    },
  });
  
  export default Settings;