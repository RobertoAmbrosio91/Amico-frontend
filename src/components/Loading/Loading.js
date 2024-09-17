import { View, Text, SafeAreaView, StyleSheet, Image } from "react-native";
import React from "react";
import colors from "../../config/colors";

const Loading = () => {
  const loading = require("../../../assets/loading.gif");
  return (
    <View style={styles.wrapper}>
      <Image source={loading} style={{ width: 40, height: 40 }} />
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000000,
  },
});
export default Loading;
