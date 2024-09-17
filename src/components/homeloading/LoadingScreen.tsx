import React, { useRef, useEffect, FC } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Animated, Platform } from 'react-native';
import colors from '../../config/colors';
import Header from '../header/header';
import typography from '../../config/typography';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingScreen: FC = () => {
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
        style={[styles.gradient, { borderRadius: 10 }]}
      />
    );
  };

  const lives = [];
  for (let i = 0; i < 4; i++) {
    lives.push(
      <View style={styles.innerTop} key={i}>
        <CustomGradient2 />
      </View>
    );
  }
  const myEvents = [];
  for (let i = 0; i < 1; i++) {
    myEvents.push(
      <View style={styles.left_inner} key={i}>
        <CustomGradient2 />
      </View>
    );
  }

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
            <Text
              style={{
                color: "#B0B0B0",
                marginBottom: 5,
                fontSize: 16,
              }}
            >
              Live events
            </Text>
            <View style={styles.topContainer}>{lives}</View>
          </View>
          <Text style={{ color: colors.__01_light_n, fontSize: 16 }}>
            Your Events
          </Text>
          <View>{myEvents}</View>
          <Text style={{ color: colors.__01_light_n, fontSize: 16 }}>
            Upcoming Events
          </Text>
          <View style={styles.upcoming}>
            <CustomGradient2 />
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
  text: {
    textAlign: "center",
    color: "#B0B0B0",
    fontSize: 20,
    fontFamily: typography.appFont[700],
  },

  shortVideo: {
    width: 60,
    height: 80,
    borderRadius: 4,
  },
  gradient: {
    flex: 1,
    borderRadius: 4,
  },
  my_topic_container: {
    rowGap: 20,
  },

  my_topic_left: {
    flex: 1,
    rowGap: 15,
  },
  left_inner: {
    height: 247,
    borderRadius: 10,
  },
  my_topic_right: {
    flex: 1,
    rowGap: 15,

    width: 150,
  },
  right_inner: {
    height: 170,
    borderRadius: 10,
  },
  innerTop: {
    width: 96,
    height: 130,
  },
  topContainer: {
    flexDirection: "row",
    columnGap: 15,
  },
  upcoming: {
    height: 100,
  },
});

export default LoadingScreen;
