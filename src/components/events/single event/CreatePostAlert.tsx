import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { Image } from "expo-image";
import colors from "src/config/colors";
import CustomButton from "@/components/buttons&inputs/CustomButton";
import typography from "src/config/typography";

const CreatePostAlert = ({ setShowAlert, handlePresentModal }: any) => {
  const image = require("../../../../assets/alert_Image.png");
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const animatedStyle = {
    transform: [{ scale: animation }],
  };
  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.alertWrapper, animatedStyle]}>
        <View style={styles.header}>
          <Text></Text>
          <Text style={styles.title}>Create a Post</Text>
          <TouchableOpacity onPress={() => setShowAlert(false)}>
            <Text>Skip</Text>
          </TouchableOpacity>
        </View>
        <Image source={image} style={styles.image} />
        <View style={styles.bottomContainer}>
          <Text style={styles.descriptionText}>
            This event is terminated, share the best memories with your friends!
          </Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              text={"Create post"}
              borderStyle={styles.button}
              textStyle={styles.textButton}
              onPress={() => {
                setShowAlert(false);
                handlePresentModal();
              }}
            />
            <CustomButton
              text={"Not now"}
              borderStyle={[
                styles.button,
                { backgroundColor: colors.__disabled_button },
              ]}
              onPress={() => setShowAlert(false)}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default CreatePostAlert;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(256,256,256,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertWrapper: {
    width: "80%",
    backgroundColor: colors.__main_background,
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 10,
  },
  header: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  image: {
    width: "100%",
    height: 350,
  },
  descriptionText: {
    textAlign: "center",
  },
  bottomContainer: {
    paddingVertical: 15,
    rowGap: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    columnGap: 15,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    borderRadius: 20,
  },
  textButton: {
    color: colors.__main_background,
  },
  title: {
    fontFamily: typography.appFont[600],
  },
});
