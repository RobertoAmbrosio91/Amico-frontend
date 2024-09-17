import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";

const NoEvents = () => {
  return (
    <View
      style={[
        styles.eventContainer,
        { width: Dimensions.get("window").width - 30 },
      ]}
    >
      <Text style={styles.text}>
        {`You don’t have a live event right now.\nCheck your upcoming ones`}
      </Text>
    </View>
  );
};

export default NoEvents;

const styles = StyleSheet.create({
  eventContainer: {
    height: 247,
    flexDirection: "column",
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: "#FFFBF2",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9E2D1",
  },
  text: {
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
  },
});
