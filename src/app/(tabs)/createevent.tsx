import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import colors from "../../config/colors";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import { usePathname, useRouter } from "expo-router";
import typography from "src/config/typography";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import createEventHandler from "@/hooks/events/createEventHandler";
import { uploadImageTos3 } from "../../functionality/uploadImageTos3";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Friend } from "@/types";
import { Image } from "expo-image";
import Loading from "@/components/Loading/Loading";
import fetchAllUsers from "@/hooks/users/fetchAllUsers";
interface ImageUriMap {
  [key: string]: string;
}
const CreateEvent: React.FC<any> = () => {
  const router = useRouter();
  const standardProfileImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/add-user.png";
  const standardEventImage =
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png";
  const [selectedImage, setSelectedImage] = useState<string>(
    "https://nooskc90b4cf2d6eb42afbe237f9e66429dc7111611-dev.s3.amazonaws.com/public/amico+(2).png"
  );
  const currentRoute = usePathname();
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("");
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [participantIDs, setParticipantIDs] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const currentUser = useFetchUserDataAsync();
  const [searchInput, setSearchInput] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(friendsList);
  const [location, setLocation] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState("invitefriends");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [imageUris, setImageUris] = useState<ImageUriMap>({});

  const eventTypes = [
    "Friends Night Out",
    "Birthday Party",
    "Sport Event",
    "Pet Date",
    "Date Night",
    "Graduation",
    "Wedding",
    "Travel Trip",
    "Festival",
    "Concert",
    "Other",
  ];
  const handleDescription = (value: string) => {
    if (value === "public") {
      return "All users can see your memories";
    } else if (value === "friends") {
      return "Only friends can see your memories";
    } else if (value === "private") {
      return "Only event's participants can see your memories";
    }
  };

  const resetAndClose = (route: string) => {
    setSelectedImage(standardProfileImage);
    setEventTitle("");
    setEventType("");
    setVisibility("");
    setSelectedFriends([]);
    setParticipantIDs([]);
    setActiveSection("invitefriends");
    router.push({
      pathname: `/${route}`,
      params: { prevRoute: currentRoute },
    });
  };
  useEffect(() => {
    const isValid =
      eventTitle.trim() !== "" &&
      eventType.trim() !== "" &&
      visibility.trim() !== "" &&
      location.trim() !== "" &&
      participantIDs.length > 0 &&
      startDate < endDate;

    setIsFormValid(isValid);
  }, [
    eventTitle,
    eventType,
    visibility,
    location,
    participantIDs,
    startDate,
    endDate,
  ]);

  const handleVisibilityChange = (visibility: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVisibility(visibility);
    // Additional logic for handling changes in event visibility
  };

  const searchFriends = (value: string) => {
    setSearchInput(value);
    if (value.trim() === "") {
      setFilteredFriends(friendsList);
    } else {
      const lowercasedValue = value.toLowerCase();
      const filtered = friendsList.filter(
        (friend) =>
          (friend.first_name &&
            friend.first_name.toLowerCase().includes(lowercasedValue)) ||
          (friend.last_name &&
            friend.last_name.toLowerCase().includes(lowercasedValue))
      );
      setFilteredFriends(filtered);
    }
  };
  //handling date change in ios
  const onChangeStartDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);

    // Check if the end date is before the new start date
    if (endDate < currentDate) {
      // Set the end date to the new start date if it's before the new start date
      setEndDate(currentDate);
    }
  };

  const onChangeEndDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  //handling date change in android
  const [mode, setMode] = useState<any>("date");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const showMode = (currentMode: any, picker: any) => {
    if (picker === "start") {
      setShowStartPicker(true);
      setShowEndPicker(false);
    } else {
      setShowEndPicker(true);
      setShowStartPicker(false);
    }
    setMode(currentMode);
  };

  const onChangeStart = (event: any, selectedDate: any) => {
    setShowStartPicker(Platform.OS === "ios");
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
    if (endDate < currentDate) {
      setEndDate(currentDate);
    }

    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (mode === "date") {
        showMode("time", "start");
      } else {
        setMode("date");
      }
    }
  };

  const onChangeEnd = (event: any, selectedDate: any) => {
    setShowEndPicker(Platform.OS === "ios"); // For iOS, keep the picker open.
    setEndDate(selectedDate || endDate);

    if (Platform.OS === "android") {
      setShowEndPicker(false); // Always hide after picking
      if (mode === "date") {
        showMode("time", "end"); // Automatically switch to time after date
      } else {
        setMode("date"); // Reset mode after time
      }
    }
  };

  const showDatePicker = (picker: any) => {
    showMode("date", picker);
  };

  const showTimePicker = (picker: any) => {
    showMode("time", picker);
  };

  useEffect(() => {
    // Fetch friends list when the component mounts or when currentUser changes
    const fetchFriends = async () => {
      if (currentUser?.token && currentUser?.friends) {
        const friends = await fetchAllUsers(currentUser.token);
        setFriendsList(friends);
        setFilteredFriends(friends);
        const uris = friends.reduce(
          (acc, friend) => ({
            ...acc,
            [friend._id]: friend.profile || standardProfileImage,
          }),
          {}
        );
        setImageUris(uris);
      }
    };

    fetchFriends();
  }, [currentUser]);

  const handleSelectedFriends = (friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selectedFriends.includes(friend)) {
      setSelectedFriends((prev) =>
        prev.filter((prev) => prev._id !== friend._id)
      );
    } else {
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };

  useEffect(() => {
    // Map selectedFriends to their IDs and update participantIDs state
    const selectedIDs = selectedFriends.map((friend) => friend._id);
    setParticipantIDs(selectedIDs);
  }, [selectedFriends]);

  const createEvent = async () => {
    try {
      setIsLoading(true);
      let eventImageUrl;
      if (selectedImage !== "" && selectedImage != standardEventImage) {
        eventImageUrl = await uploadImageTos3(selectedImage);
      } else {
        eventImageUrl = standardEventImage;
      }

      const formattedStartDate = startDate.toISOString().slice(0, -5);
      const formattedEndDate = endDate.toISOString().slice(0, -5);

      const eventData = {
        name: eventTitle,
        event_type: eventType,
        event_visibility: visibility,
        event_image: eventImageUrl,
        location: location,
        participants: participantIDs,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      const response = await createEventHandler(
        eventData,
        currentUser?.token || ""
      );
      if (response?.success) {
        resetAndClose(`event/${response.result._id}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleImageError = (friendId: any) => {
    setImageUris((prevUris) => ({
      ...prevUris,
      [friendId]: standardProfileImage,
    }));
  };
  const renderFriendItem = ({
    item,
    index,
  }: {
    item: Friend;
    index: number;
  }) => {
    const profileImage = item.profile || standardProfileImage;
    return (
      <View
        style={[
          styles.friendItem,
          index === filteredFriends.length - 1 && { paddingBottom: 100 },
        ]}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => handleSelectedFriends(item)}
        >
          <Image
            source={{ uri: imageUris[item._id] }}
            onError={() => handleImageError(item._id)}
            style={styles.friendImage}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{`${item.first_name}`}</Text>
            <Text style={styles.friendUsername}>@{item.user_name}</Text>
          </View>
          <View
            style={[
              styles.checkbox,
              selectedFriends.includes(item) && {
                backgroundColor: colors.__amico_blue,
                borderColor: "transparent",
              },
            ]}
          ></View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectedFriendItem = ({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        style={{ alignContent: "center", top: 3 }}
        onPress={() => handleSelectedFriends(item)}
      >
        <Image
          source={{ uri: imageUris[item._id] }}
          onError={() => handleImageError(item._id)}
          style={styles.selectedFriendImage}
        />
        <Text style={styles.friendUsername}>{item.first_name}</Text>
        <View style={{ position: "absolute", right: 5, top: -5 }}>
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={colors.__main_text}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {isLoading && <Loading backgroundColor="rgba(256,256,256,0.5)" />}
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <GestureHandlerRootView>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => resetAndClose("myeventsrevisited")}
              >
                <AntDesign
                  name="close"
                  size={24}
                  color={colors.__main_text_color}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Create an Event</Text>
              {activeSection === "invitefriends" ? (
                <TouchableOpacity
                  onPress={() =>
                    participantIDs.length > 0
                      ? setActiveSection("otherdetails")
                      : undefined
                  }
                >
                  <Text
                    style={[
                      participantIDs.length > 0
                        ? styles.headerRightText
                        : styles.headerRightTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => createEvent()}
                  disabled={!isFormValid}
                >
                  <Text
                    style={[
                      isFormValid
                        ? styles.headerRightText
                        : styles.headerRightTextDisabled,
                    ]}
                  >
                    Create
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {activeSection === "otherdetails" && (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View>
                  <View style={styles.photoName}>
                    <ProfileImage
                      selectedImage={selectedImage}
                      setSelectedImage={setSelectedImage}
                    />
                    <CustomInput
                      name={"e.g., Antonio's birthday.."}
                      onChangeText={setEventTitle}
                    />
                  </View>
                  <View style={styles.titleGroup}>
                    <View>
                      <EventAccessibility
                        onVisibilityChange={handleVisibilityChange}
                        selectedVisibility={visibility}
                      />
                      <Text style={styles.visibilityDescription}>
                        {handleDescription(visibility)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.titleGroup]}>
                    <View style={styles.eventTypeContainer}>
                      {eventTypes.map((type, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.eventTypeOption,
                            eventType === type && styles.selectedOption,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Medium
                            );
                            setEventType(type);
                          }}
                        >
                          <Text
                            style={[
                              styles.eventTypeText,
                              eventType === type && styles.selectedText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.titleGroup}>
                    <Text style={styles.titleGroupText}>Location</Text>
                    <View>
                      <GooglePlacesAutocomplete
                        placeholder="Search for a location"
                        listViewDisplayed="auto"
                        minLength={1}
                        fetchDetails={true}
                        disableScroll={true}
                        onPress={(data, details = null) => {
                          // Check if details is not null before using it
                          if (details) {
                            setLocation(details.formatted_address); // Use the formatted_address from details
                          } else {
                            // Handle the case when details is null
                            console.log(
                              "No details available for the selected place"
                            );
                          }
                        }}
                        query={{
                          key: "AIzaSyDvahN0z3W8WndCw_X_0AwbZFL0nPvzQLM",
                          language: "en",
                          // types: "establishment",
                          // components: "country:us",
                        }}
                        styles={{
                          textInput: styles.googleInputText,
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.dateSelection}>
                    <View style={styles.titleGroup}>
                      <Text style={styles.titleGroupText}>Start Date</Text>
                      {Platform.OS === "ios" && (
                        <DateTimePicker
                          value={startDate}
                          mode="datetime"
                          display="default"
                          onChange={onChangeStartDate}
                          minimumDate={new Date()}
                          style={styles.datePickerButton}
                          minuteInterval={15}
                          themeVariant="dark"
                        />
                      )}
                      {Platform.OS === "android" && (
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity
                            onPress={() => showDatePicker("start")}
                          >
                            <Text style={styles.eventTypeOption}>
                              {startDate.toDateString()}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => showTimePicker("start")}
                          >
                            <Text style={styles.eventTypeOption}>
                              {startDate.toTimeString().slice(0, 5)}
                            </Text>
                          </TouchableOpacity>
                          {showStartPicker && (
                            <DateTimePicker
                              value={startDate}
                              mode={mode}
                              display="default"
                              onChange={onChangeStart}
                              minimumDate={new Date()}
                            />
                          )}
                        </View>
                      )}
                    </View>

                    <View style={styles.titleGroup}>
                      <Text style={styles.titleGroupText}>End Date</Text>
                      {Platform.OS === "ios" && (
                        <DateTimePicker
                          value={endDate}
                          mode="datetime"
                          display="default"
                          onChange={onChangeEndDate}
                          minimumDate={new Date()}
                          style={styles.datePickerButton}
                          minuteInterval={15}
                          themeVariant="dark"
                        />
                      )}
                      {Platform.OS === "android" && (
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity
                            onPress={() => showDatePicker("end")}
                          >
                            <Text style={styles.eventTypeOption}>
                              {endDate.toDateString()}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => showTimePicker("end")}
                          >
                            <Text style={styles.eventTypeOption}>
                              {endDate.toTimeString().slice(0, 5)}
                            </Text>
                          </TouchableOpacity>
                          {showEndPicker && (
                            <DateTimePicker
                              value={endDate}
                              mode={mode}
                              display="default"
                              onChange={onChangeEnd}
                              minimumDate={startDate} // Ensure end date is not before start date
                            />
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {activeSection === "invitefriends" && (
              <View style={styles.titleGroupNoPadding}>
                <View style={{ paddingHorizontal: 15 }}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Select the friends you want to invite.."
                    placeholderTextColor={colors.__secondary_text_color}
                    onChangeText={searchFriends}
                    value={searchInput}
                  />

                  <View
                    style={{
                      marginBottom: 15,
                      padding: 12,
                      rowGap: 10,
                      backgroundColor: colors.__secondary_background,
                      borderRadius: 10,
                      height: 120,
                    }}
                  >
                    <Text style={styles.friendUsername}>
                      Selected Participants
                    </Text>
                    <FlatList
                      data={selectedFriends}
                      keyExtractor={(item) => item._id}
                      renderItem={renderSelectedFriendItem}
                      horizontal={true}
                    />
                  </View>
                </View>
                {/* )} */}
                <View
                  style={{
                    height: "68%",
                    backgroundColor: colors.__secondary_background,
                    borderRadius: 10,
                  }}
                >
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={filteredFriends}
                    keyExtractor={(item) => item._id}
                    renderItem={renderFriendItem}
                  />
                </View>
              </View>
            )}
          </GestureHandlerRootView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

type CustomInputProps = {
  name: string;
  value?: string;
  onChangeText: (value: string) => void;
};

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  value,
  onChangeText,
}) => {
  return (
    <TextInput
      placeholder={name}
      style={styles.input}
      onChangeText={onChangeText}
      value={value}
      placeholderTextColor={"#5C7082"}
    />
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
    let result;
    result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
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
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleSelectImage}
      >
        <MaterialIcons name="photo-camera" size={24} color="#5C7082" />
      </TouchableOpacity>
      {selectedImage && (
        <Image
          source={{
            uri: selectedImage,
          }}
          contentFit="cover"
          style={styles.photo}
        />
      )}
    </View>
  );
};

type EventAccessibility = "public" | "friends" | "private";

const EventAccessibility: React.FC<{
  onVisibilityChange: (visibility: string) => void;
  selectedVisibility: string;
}> = ({ onVisibilityChange, selectedVisibility }) => {
  return (
    <View style={styles.eventAccessibiliy}>
      <TouchableOpacity
        style={[
          styles.visibility_container,
          selectedVisibility === "public" && styles.visibilitySelected,
        ]}
        onPress={() => onVisibilityChange("public")}
      >
        <Text
          style={[
            styles.visibility_text,
            selectedVisibility === "public" && styles.visibilityTextSelected,
          ]}
        >
          Public
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.visibility_container,
          selectedVisibility === "friends" && styles.visibilitySelected,
        ]}
        onPress={() => onVisibilityChange("friends")}
      >
        <Text
          style={[
            styles.visibility_text,
            selectedVisibility === "friends" && styles.visibilityTextSelected,
          ]}
        >
          Friends
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.visibility_container,
          selectedVisibility === "private" && styles.visibilitySelected,
        ]}
        onPress={() => onVisibilityChange("private")}
      >
        <Text
          style={[
            styles.visibility_text,
            selectedVisibility === "private" && styles.visibilityTextSelected,
          ]}
        >
          Private
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "column",
    // padding: 15,
    rowGap: 10,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.__main_background,
    paddingTop: Platform.OS === "android" ? "8%" : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: typography.appFont[700],
    textAlign: "center",
    fontSize: 18,
    color: colors.__main_text_color,
  },
  headerRightText: {
    fontFamily: typography.appFont[700],
    textAlign: "center",
    fontSize: 16,
    color: colors.__main_text_color,
  },
  headerRightTextDisabled: {
    fontFamily: typography.appFont[400],
    textAlign: "center",
    fontSize: 16,
    color: colors.__01_light_n,
  },
  photoName: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.__secondary_background,
    borderRadius: 9,
    alignItems: "center",
    padding: 9,
    height: "12%",
  },
  eventAccessibiliy: {
    marginTop: 10,
    padding: 4,
    flexDirection: "row",
    width: "100%",
    backgroundColor: colors.__secondary_background,
    borderRadius: 20,
    justifyContent: "space-around",
  },
  visibility_container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    width: "30%",
    alignItems: "center",
  },
  visibility_text: {
    fontFamily: typography.appFont[500],
    color: colors.__blue_dark,
  },
  visibilitySelected: {
    backgroundColor: colors.__amico_blue,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: "30%",
    alignItems: "center",
  },
  visibilityTextSelected: {
    fontFamily: typography.appFont[500],
    color: "#fff",
    fontSize: 14,
  },
  input: {
    // borderColor: "#acacac",
    padding: 9,
    color: "#fff",
  },
  googleInputText: {
    backgroundColor: colors.__secondary_background,
    borderWidth: 1,
    borderColor: "#D1D9DE",
    borderRadius: 4,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.__01_light_n,
    paddingHorizontal: Platform.OS === "web" ? 8 : 0,
  },
  buttonEnabled: {
    backgroundColor: colors.p__logo_color,
    paddingHorizontal: Platform.OS === "web" ? 8 : 0,
  },
  textButton: {
    fontFamily: typography.appFont[600],
  },
  textButtonDisabled: {
    color: "white",
    fontFamily: typography.appFont[600],
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: "center",
    width: "100%",
    marginBottom: 20,
  },
  dateSelection: {
    flexDirection: "column",
  },
  titleGroup: {
    flexDirection: "column",
    marginVertical: 10,
    gap: 5,
    paddingHorizontal: 15,
  },
  titleGroupNoPadding: {
    flexDirection: "column",
    marginVertical: 10,
    gap: 5,
  },
  titleGroupText: {
    fontFamily: typography.appFont[500],
    color: colors.__main_text_color,
  },
  profileImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: colors.__background_input,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 5,
    // alignSelf: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  photo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 50,
    zIndex: -1,
  },
  datePickerButton: {
    alignSelf: "flex-start",
    left: -10,
  },
  searchInput: {
    backgroundColor: colors.__secondary_background,
    color: "#000",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  friendContainer: {
    flexDirection: "column",
    marginVertical: 8,
    marginHorizontal: 16,
    alignContent: "center",
  },
  friendListItem: {},
  friend: {
    borderColor: colors.__main_blue,
    borderWidth: 1,
    padding: 5,
    borderRadius: 4,
    marginTop: 5,
  },
  friendSelectedContainer: {
    flexDirection: "row",
    gap: 3,
  },
  friendSelected: {
    borderColor: colors.__main_blue,
    borderWidth: 1,
    padding: 5,
    borderRadius: 4,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  friendSelectedRemoveText: {
    flexDirection: "row",
    fontSize: 14,
    fontWeight: "bold",
  },
  eventTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  eventTypeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    fontFamily: typography.appFont[500],
    backgroundColor: colors.__secondary_background,
  },
  selectedOption: {
    // Additional style for the selected option
    backgroundColor: colors.__amico_blue,
  },
  eventTypeText: {
    // Text style inside each option
    fontSize: 14,
  },
  selectedText: {
    // Additional style for the text of the selected option
    color: "#ffffff",
  },
  friendItem: {
    flexDirection: "column",
    marginVertical: 8,
    marginHorizontal: 16,
    alignContent: "center",
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 16,
  },
  selectedFriendImage: {
    width: 50,
    height: 50,
    borderRadius: 60,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.__main_text,
    fontSize: 14,
    fontFamily: typography.appFont[400],
  },
  friendUsername: {
    color: colors.__secondary_text_color,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  visibilityDescription: {
    fontSize: 12,
    alignSelf: "center",
    marginTop: 5,
    color: colors.w_contrast,
  },
});



  export default CreateEvent;