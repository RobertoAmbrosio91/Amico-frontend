import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";
import { EventType } from "@/types";
import typography from "src/config/typography";
import * as ImagePicker from "expo-image-picker";
import EditableInput from "@/components/buttons&inputs/EditableInput";
import { Feather, AntDesign, Entypo } from "@expo/vector-icons";
import updateEvent from "@/hooks/events/updateEvent";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import { uploadImageTos3 } from "@/services/uploadImageTos3";
import colors from "src/config/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import AddParticipant from "./addparticipant";
import { Image } from "expo-image";
import deleteEvent from "@/hooks/events/deleteevent";
import * as Haptics from "expo-haptics";

const EventDetails: React.FC<any> = () => {
  const router = useRouter();
  const { event_id, prevRoute } = useLocalSearchParams();
  console.log(prevRoute);
  const eventid = Array.isArray(event_id) ? event_id[0] : event_id;
  const currentUser = useFetchUserDataAsync();
  const [eventData, setEventData] = useState<EventType>();
  const [edit, setEdit] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [eventDetails, setEventDetails] = useState<any>({
    description: "",
    name: "",
    location: "",
    participants: [],
    removeParticipants: [],
    event_id: "",
    event_image: "",
  });
  const updateButtonIsVisible = edit && hasChanged;
  const image =
    eventData?.event_image === eventDetails.event_image
      ? eventData?.event_image
      : eventDetails.event_image;

  const handleRemoveParticipants = (participant: any) => {
    const { removeParticipants } = eventDetails;
    if (removeParticipants.includes(participant._id)) {
      const newRemoveParticipants = removeParticipants.filter(
        (id: any) => id !== participant._id
      );
      setEventDetails({
        ...eventDetails,
        removeParticipants: newRemoveParticipants,
      });
      setHasChanged(true);
    } else {
      const newRemoveParticipants = [...removeParticipants, participant._id];
      setEventDetails({
        ...eventDetails,
        removeParticipants: newRemoveParticipants,
      });
      setHasChanged(true);
    }
  };
  useEffect(() => {
    if (currentUser && eventid) {
      const fetchEventData = async () => {
        const fetchedEventData = await fetchSingleEvent(
          eventid,
          currentUser.token
        );
        if (fetchedEventData) {
          setEventData(fetchedEventData);
          let participants_ids: string[] = [];
          fetchedEventData.participants.forEach((participant: any) => {
            participants_ids.push(participant._id);
          });
          setEventDetails({
            ...eventDetails,
            description: fetchedEventData.description,
            name: fetchedEventData.name,
            location: fetchedEventData.location,
            participants: participants_ids,
            event_id: fetchedEventData._id,
            event_image: fetchedEventData.event_image,
          });
        }
      };
      fetchEventData();
    }
  }, [currentUser]);

  const handleSelectImage = async () => {
    if (edit) {
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
          setEventDetails({ ...eventDetails, event_image: selectedUri });
          setHasChanged(true);
        }
      }
    }
  };
  const updateEventDetails = async () => {
    try {
      if (currentUser && eventid) {
        const token = currentUser.token;
        if (eventDetails.event_image !== eventData?.event_image) {
          eventDetails.event_image = await uploadImageTos3(
            eventDetails.event_image
          );
        }
        const updatedEventDetails = await updateEvent(token, eventDetails);
        if (updatedEventDetails.success) {
          router.back();
        }
      }
    } catch (error) {}
  };

  //bottomSheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  function handlePresentModal() {
    bottomSheetModalRef.current?.present();
  }

  const handleDeleteEvent = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentUser && eventData) {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this event?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              const token = currentUser.token;
              const eventId = eventData._id;
              try {
                const delete_event = await deleteEvent(token, eventId);
                if (delete_event && delete_event.success) {
                  router.replace(`${prevRoute}`);
                }
              } catch (error) {
                console.error("Event not deleted:", error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ScrollView style={styles.container}>
            {eventData && (
              <View style={styles.dataContainer}>
                <View style={styles.header}>
                  {Platform.OS === "android" && (
                    <TouchableOpacity onPress={() => router.back()}>
                      <Entypo
                        name="chevron-left"
                        size={26}
                        color={colors.__main_background}
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={styles.title}>Event Details</Text>
                  <View style={{ flexDirection: "row", columnGap: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setEdit(!edit);
                        if (hasChanged) setHasChanged(false);
                        setEventDetails({
                          ...eventDetails,
                          removeParticipants: [],
                        });
                      }}
                    >
                      <Feather
                        name={edit ? "x-circle" : "edit"}
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteEvent}>
                      <AntDesign name="delete" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={handleSelectImage}>
                  <Image
                    style={styles.eventImage}
                    source={{ uri: image ? image : null }}
                  />
                </TouchableOpacity>

                <View>
                  <Text style={styles.text}>Name</Text>
                  <EditableInput
                    value={!edit ? eventData.name : undefined}
                    placeholder={edit ? eventData.name : ""}
                    editable={edit}
                    onChangeText={(value) => {
                      setEventDetails({ ...eventDetails, name: value });
                      if (!hasChanged) setHasChanged(true);
                    }}
                  />
                </View>
                {/* <View>
                  <Text style={styles.text}>Description</Text>
                  <EditableInput
                    value={!edit ? eventData.description : undefined}
                    placeholder={edit ? eventData.description : ""}
                    editable={edit}
                    onChangeText={(value) => {
                      setEventDetails({ ...eventDetails, description: value });
                      if (!hasChanged) setHasChanged(true);
                    }}
                  />
                </View> */}
                <View>
                  <Text style={styles.text}>Location</Text>
                  <EditableInput
                    value={!edit ? eventData.location : undefined}
                    placeholder={edit ? eventData.location : ""}
                    editable={edit}
                    onChangeText={(value) => {
                      setEventDetails({ ...eventDetails, location: value });
                      if (!hasChanged) setHasChanged(true);
                    }}
                  />
                </View>

                <Text style={styles.text}>Participants</Text>
                {edit && (
                  <TouchableOpacity
                    onPress={() => handlePresentModal()}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      columnGap: 10,
                      paddingLeft: 10,
                    }}
                  >
                    <Feather name="user-plus" size={28} color="#808080" />
                    <Text style={{ color: "#808080" }}>add more</Text>
                  </TouchableOpacity>
                )}

                <ScrollView
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={false}
                >
                  {eventData.participants.map(
                    (participant: any, index: number) => {
                      return (
                        <Participant
                          participant={participant}
                          key={index}
                          edit={edit}
                          eventDetails={eventDetails}
                          handleRemoveParticipants={handleRemoveParticipants}
                        />
                      );
                    }
                  )}
                </ScrollView>
                {updateButtonIsVisible && (
                  <View style={{ marginTop: 20, marginBottom: 60 }}>
                    <CustomButton
                      text="Update Event"
                      onPress={updateEventDetails}
                      borderStyle={{ backgroundColor: colors.__logo_color }}
                      textStyle={{ color: "white", fontWeight: "600" }}
                    />
                  </View>
                )}
              </View>
            )}
            <AddParticipant
              bottomSheetModalRef={bottomSheetModalRef}
              eventData={eventData}
              setEventData={setEventData}
              setHasChanged={setHasChanged}
              setEventDetails={setEventDetails}
              eventDetails={eventDetails}
            />
          </ScrollView>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </View>
  );
};

export default EventDetails;
type ParticipantComp = {
  participant: any;
  key: any;
  edit: boolean;
  eventDetails: any;
  handleRemoveParticipants: (participant: any) => void;
};
const Participant: React.FC<ParticipantComp> = ({
  participant,
  edit,
  eventDetails,
  handleRemoveParticipants,
}) => {
  const participantName = participant.user_name
    ? participant.user_name
    : `${participant.first_name} ${participant.last_name}`;
  return (
    <View
      style={[
        styles.participantsContainer,
        { justifyContent: "space-between" },
      ]}
    >
      <View style={styles.participantsContainer}>
        <Image
          style={styles.participantImage}
          source={{ uri: participant.profile }}
        />
        <Text>{participantName}</Text>
      </View>
      {edit && (
        <TouchableOpacity
          onPress={() => handleRemoveParticipants(participant)}
          style={styles.removeButton}
        >
          <Text>
            {eventDetails.removeParticipants.includes(participant._id)
              ? "Undo"
              : "Remove"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
    paddingTop: Platform.OS === "android" ? "15%" : 15,
  },
  title: {
    fontFamily: typography.appFont[500],
    fontSize: 17,
    alignSelf: "center",
  },
  eventImage: {
    width: 65,
    height: 65,
    borderRadius: 60,
  },
  dataContainer: {
    rowGap: 15,
  },
  text: {
    fontFamily: typography.appFont[500],
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  participantsContainer: {
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  removeButton: {
    borderColor: "#292938",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
});
