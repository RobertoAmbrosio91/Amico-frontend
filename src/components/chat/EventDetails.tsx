import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
  } from "react-native";
import React, { useEffect, useState,  } from "react";
import colors from "../../config/colors";
import typography from "src/config/typography";
import { EventType } from "@/types";
import { useRouter } from "expo-router";

 type EventData={
  eventData:EventType
 }
  
  const EventDetails: React.FC<EventData> = ({eventData}) => {
    const router=useRouter()
    return (
      <View>
        {eventData && (
          <TouchableOpacity
            style={styles.event}
            onPress={() => router.push(`/event/${eventData._id}`)}
          >
            <Image
              source={{ uri: eventData.event_image }}
              style={styles.chatIcon}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventName}>{eventData.name}</Text>
              <View style={styles.eventDetailsBottom}>
                <Text style={styles.eventDescription}>
                  {eventData.description}
                </Text>
                {/* <Text style={styles.eventDescription}></Text> */}
                {/* <Text style={styles.eventDescription}>Time</Text> */}
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  

 
  const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      
      event: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        backgroundColor: 'transparent', 
      },
    
      eventDetails: {
        flex: 1,
        justifyContent: 'center',
        gap: 5,
      },
      chatIcon: {
        width: 70, 
        height: 70, 
        marginRight: 10,
        borderRadius: 10,
        borderColor: "white",
        borderWidth: 1,
      },
      chatSubcategory: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.__main_blue,
        marginBottom: 5,
      },
      eventName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: "white",
        marginBottom: 5,
      },
      eventDetailsBottom: {
        flexDirection: 'row',
        gap: 8,
      },
      eventDescription: {
        fontSize: 14,
        color: "white", 
      },
      chatTimestamp: {
        fontSize: 12,
        color: '#C7C7C7',
        alignSelf: 'flex-start', 
      },
      noDiscussions:{
        textAlign:"center",
        marginTop:"10%",
        fontFamily:typography.appFont[500]
      }
  });
  
  export default EventDetails;