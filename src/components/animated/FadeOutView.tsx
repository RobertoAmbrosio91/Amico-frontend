import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const FadeOutView = ({
  isVisible,
  children,
}: {
  isVisible: any;
  children: any;
}) => {
  const fadeAnim = useState(new Animated.Value(1))[0]; // Initial opacity: 1

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  return (
    <Animated.View
      style={{
        ...styles.fadeContainer,
        opacity: fadeAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default FadeOutView;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventText: {
    fontSize: 16,
    color: "black",
  },
  fadeContainer: {
    padding: 10,
  },
});
