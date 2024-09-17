import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform
} from "react-native";
import { RefObject, useState } from 'react';
import React, {useRef} from 'react';
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Header from "../header/header";
import { AntDesign } from "@expo/vector-icons";
import typography from "../../config/typography";
import colors from "../../config/colors";
import { Octicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import CustomButton from "../buttons&inputs/CustomButton";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import deleteAccount from "../../hooks/users/deleteAccount";
import { useNavigation } from "@react-navigation/native";
import editProfile from "../../hooks/users/editProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logout from "../../hooks/users/logout";
import selectSingleImage from "../../functionality/selectSingleImage";
import updateProfileImage from "../../hooks/users/updateProfileImage";
import { useRouter } from "expo-router";

interface UserState {
  first_name: string;
  last_name: string;
  bio: string;
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
  bio: string;
  image: string[];
  profile: string;
  subcategory_data?: Array<{ _id: string; name: string }>;
};

type CurrentUserType = {
  token: string;
  // ... other properties
};

const EditProfile: React.FC<EditProfileProps> = ({ bottomSheetModalRef, userData }) => {
  const router = useRouter()
  const currentUser: CurrentUserType | null | undefined = useFetchUserDataAsync();
  const [userDetails, setUserDetails] = useState<UserDetailsState>({
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    bio: userData.bio || '',
    image: userData.image || [],
    user_name: userData.user_name || '', 
    subcategory_data: userData.subcategory_data || [],
    profile: userData.profile,

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
    bio: "",
    image: [],
});

  const isButtonVisible =
    user.first_name || user.last_name || user.bio ? true : false;

  const updateProfile = async () => {
    if (currentUser) {
      const response = await editProfile(
        user.first_name,
        user.last_name,
        user.bio,
        currentUser.token
      );
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
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
          router.replace('/signup');
        }
      } catch (error) {
        console.log("Error logging out", error);
      }
    }
  };

  const PlatformSafeAreaView = ({ children }: any) => {
    // Check if the platform is web and return children directly if true
    if (Platform.OS === 'web') {
      return <>{children}</>;
    }
    // For other platforms, wrap children with SafeAreaView
    return <SafeAreaView>{children}</SafeAreaView>;
  };



  return (
    <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={["100%"]} >
      <PlatformSafeAreaView >
        <ScrollView  >
          <View style={styles.container}>
            <Header />
            <Heading bottomSheetModalRef={bottomSheetModalRef} />
            <ProfileImage userData={userDetails} currentUser={currentUser} />
            <View>
              <PersonalData
                userData={userDetails}
                setUser={setUser}
                updateProfile={updateProfile}
                isButtonVisible={isButtonVisible}
              />
              <Topics userData={userDetails} />
              <Wins />
              <TouchableOpacity
                style={{ marginTop: 30 }}
                onPress={logTheUserOut}
              >
                <Text style={{ color: colors.__blue_dark }}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 10 }} onPress={toggleModal}>
                <Text style={{ color: "#E96B60" }}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
          {isModalVisible && (
            <MyModal
              isModalVisible={isModalVisible}
              toggleModal={toggleModal}
              deleteUser={deleteUser}
            />
          )}
          {isDeleted && <DeletedUserMessage />}
        </ScrollView>
        </PlatformSafeAreaView>
    </BottomSheetModal>
  );
};

interface HeadingProps {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
}

const Heading: React.FC<HeadingProps> = ({ bottomSheetModalRef }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
        <AntDesign name="arrowleft" size={24} color="#131A29" />
      </TouchableOpacity>
      <Text style={styles.editProfile}>Edit Profile</Text>
      <Text style={{ color: "transparent" }}>...</Text>
    </View>
  );
};




type ProfileImageProps = {
  userData: UserData;
  currentUser: any; 
};



const ProfileImage: React.FC<ProfileImageProps> = ({ userData, currentUser }) => {
  const [profileImage, setProfileImage] = useState("");
  const [showButton, setShowButton] = useState(false);
  const currentProfileImage=userData.profile? `${userData.profile}` : "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";

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
  isButtonVisible: boolean;
};




const PersonalData: React.FC<PersonalDataProps> = ({
  userData,
  setUser,
  updateProfile,
  isButtonVisible,
}) => {
  const { user_name, first_name, last_name, bio } = userData;
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>About me</Text>
      <View style={styles.inputRow}>
        <Text style={styles.text}>Username</Text>
        <TextInput
          placeholder={`@${user_name}`}
          style={[styles.input]}
          placeholderTextColor={"#000"}
          editable={false}
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.text}>First Name</Text>
        <TextInput
          placeholder={first_name}
          style={styles.input}
          onChangeText={(value) =>
            setUser((prevState: UserState) => ({ ...prevState, first_name: value }))
          }
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.text}>Last Name</Text>
        <TextInput
          placeholder={last_name}
          style={styles.input}
          onChangeText={(value) =>
            setUser((prevState: UserState) => ({ ...prevState, first_name: value }))
          }
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.text}>Bio</Text>
        <TextInput
          placeholder={bio}
          style={styles.input}
          onChangeText={(value) =>
            setUser((prevState: UserState) => ({ ...prevState, first_name: value }))
          }
        />
      </View>
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

type TopicsProps = {
  userData: UserData;
};




const Topics: React.FC<TopicsProps> = ({ userData }) => {
  return (
    <View style={{ marginTop: 30, rowGap: 10 }}>
      <Text style={styles.title}>Your Knowledge</Text>
      <View style={styles.verified}>
        <MaterialIcons name="verified" size={24} color={colors.__teal_dark} />
        <Text style={[styles.title, { color: colors.__teal_dark }]}>
          Verified in / topic
        </Text>
      </View>
      <Text style={styles.yourPicks}>Your Picks (3 of 3)</Text>
      {userData &&
        userData.subcategory_data?.map((item) => (
          <View style={{ flexDirection: "row" }} key={item._id}>
            <Text style={styles.category}>{item.name}</Text>
          </View>
        ))}
    </View>
  );
};


const Wins = () => {
  return (
    <View style={{ marginTop: 30, rowGap: 10 }}>
      <Text style={styles.title}>Your Wins</Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", columnGap: 10 }}
      >
        <Image source={require("../../../assets/images/medalla12.png")} />
        <View>
          <Text style={styles.title}>Name of the Badge</Text>
          <Text>Short description of the badge</Text>
        </View>
      </View>
    </View>
  );
};

type MyModalProps = {
  isModalVisible: boolean;
  toggleModal: () => void;
  deleteUser: () => void;
};


const MyModal: React.FC<MyModalProps> = ({ isModalVisible, toggleModal, deleteUser }) => {
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
              <CustomButton text={"Delete"} onPress={deleteUser} />
            </View>
            <View>
              <CustomButton text={"Cancel"} onPress={toggleModal} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};




const DeletedUserMessage = () => {
   const router = useRouter()
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
        <TouchableOpacity
          onPress={() =>
            router.replace('/landing')
          }
        >
          <Text style={styles.textMessage}>Leave the app</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    rowGap: 10,
    paddingBottom: 100,
   
  },
  editProfile: {
    fontSize: 20,
    fontFamily: typography.appFont[600],
    color: colors.__main_blue,
  },
  profile_img_container: {
    height: 70,
    width: 70,
    backgroundColor: "#E8E8F0",
    borderRadius: 8,

    alignSelf: "center",
  },
  profile_img: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    color: colors.__blue_dark,
    fontSize: 14,
    width: 100,
  },
  inputRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: colors.__blue_light,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: typography.appFont[700],
  },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.__teal_dark,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  yourPicks: {
    color: colors.__blue_medium,
    fontFamily: typography.appFont[400],
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
});

export default EditProfile;
