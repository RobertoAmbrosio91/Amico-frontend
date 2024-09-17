import React, { ReactNode, useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Platform } from "react-native";
import colors from "../../config/colors";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import typography from "../../config/typography";
import { UserData, EventType } from "../../types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import EventComponent from "../events/EventItemNew";


interface UserContentNewProps {
  userData?: UserData;
  myEvents: EventType[];
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null; // Adjust type here
}


const UserContentNew: React.FC<UserContentNewProps> = ({ userData, myEvents, ListHeaderComponent  }) => {
  const currentUser = useFetchUserDataAsync();
  const router = useRouter();
  const [visibleEvents, setVisibleEvents] = useState<EventType[]>([]);
  const [displayCount, setDisplayCount] = useState(2);



  // Filter out past events
// Recalculate pastEvents only when myEvents changes
const pastEvents = useMemo(() => myEvents.filter(event => {
  const currentDate = new Date();
  const eventEndDate = new Date(event.end_date);
  return eventEndDate < currentDate;
}), [myEvents]);


  useEffect(() => {
    setVisibleEvents(pastEvents.slice(0, displayCount));
  }, [pastEvents, displayCount]);

  const handleLoadMore = () => {
    if (displayCount < pastEvents.length) {
      setDisplayCount(displayCount + 2);
    }
  };

  const renderEvent = ({ item: event }: { item: EventType }) => (
    <EventComponent events={event} navigationPath={(id) => `/album/${id}`}/>  // Rename the prop to match the expected prop in EventComponent
  );

  return (
    <View style={styles.profileContentContainer}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        data={visibleEvents} // Use the filtered past events array
        renderItem={renderEvent} 
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.profile_content}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};





  const styles = StyleSheet.create({
    profile_content: {
      
    },
    profileContentContainer:{
      flexDirection: "column",
      marginVertical: 30,
      marginHorizontal: 10, // Adjust as necessary
    },
    profileContentContainerText:{
      fontSize: 18, // Made slightly larger for emphasis
      fontFamily: typography.appFont[700], // Increased weight for boldness
      padding: 10,
      marginHorizontal: 5,
    },
  });

  export default UserContentNew;
