import React, { useRef, useEffect, FC } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import colors from "../../config/colors";
import Header from "../header/header";
import typography from "../../config/typography";
import { LinearGradient } from "expo-linear-gradient";

const ProfileLoadingScreen: FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Define the fade in-out animation
  const fadeInOut = () => {
    // This will fade in the view
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      // This will fade out the view after the fade in is done
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    fadeInOut();
    const intervalId = setInterval(fadeInOut, 1600); // repeats every 4 seconds
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  const CustomGradient2 = () => {
    return (
      <LinearGradient
        // colors={["#19191a", "#49494d"]}
        colors={["#B0B0B0", colors.__01_light_n]}
        start={[1, 0]}
        end={[0, 1]}
        style={[styles.gradient]}
      />
    );
  };
  const CustomGradientImage = () => {
    return (
      <LinearGradient
        // colors={["#19191a", "#49494d"]}
        colors={["#B0B0B0", colors.__01_light_n]}
        start={[1, 0]}
        end={[0, 1]}
        style={[styles.gradient, { borderRadius: 100 }]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.my_topic_container, { opacity: fadeAnim }]}
        >
          <View>
            <Text style={styles.text}>Give us a minute</Text>
          </View>
          <View>
            <View style={styles.profileImage}>
              <CustomGradientImage />
            </View>
          </View>
          <View style={styles.userDataContainer}>
            <View style={styles.userData}>
              <CustomGradient2 />
            </View>
            <View style={styles.userData}>
              <CustomGradient2 />
            </View>
          </View>
          <View style={{ rowGap: 15 }}>
            <View style={styles.events}>
              <CustomGradient2 />
            </View>
            <View style={styles.events}>
              <CustomGradient2 />
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.__main_background,
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    rowGap: 25,
  },
  profileImage: {
    width: 138,
    height: 138,
    borderRadius: 100,
    alignSelf: "center",
    marginTop: 20,
  },
  text: {
    textAlign: "center",
    color: "#B0B0B0",
    fontSize: 20,
    fontFamily: typography.appFont[700],
  },
  gradient: {
    flex: 1,
    borderRadius: 10,
  },
  userData: {
    width: 80,
    height: 30,
  },

  //   shortVideo: {
  //     width: 60,
  //     height: 80,
  //     borderRadius: 4,
  //   },
  my_topic_container: {
    rowGap: 20,
  },
  events: {
    marginTop: 15,
    height: 247,
  },
  userDataContainer: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 50,
  },
});

export default ProfileLoadingScreen;
