import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import colors from "@/config/colors";
interface CameraOptions {
  typeOfMemory: string;
  setTypeOfMemory: any;
}
const CameraOptions: React.FC<CameraOptions> = ({
  typeOfMemory,
  setTypeOfMemory,
}) => {
  const message = () => {
    if (typeOfMemory === "memory") {
      return "Create a Memory to share with your Friends";
    } else {
      return "Start a Snap Challenge with your Friends";
    }
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.optionsContainer}>
        <Pressable
          onPress={() => setTypeOfMemory("prompt")}
          style={[
            styles.selectionContainer,
            typeOfMemory === "prompt" && {
              backgroundColor: colors.__amico_blue,
            },
          ]}
        >
          <Text style={styles.text}>Snap Challenge</Text>
        </Pressable>
        <Pressable
          onPress={() => setTypeOfMemory("memory")}
          style={[
            styles.selectionContainer,
            typeOfMemory === "memory" && {
              backgroundColor: colors.__amico_blue,
            },
          ]}
        >
          <Text style={styles.text}>Memory</Text>
        </Pressable>
      </View>
      <Text style={[styles.text, { fontSize: 12 }]}>{message()}</Text>
    </View>
  );
};

export default CameraOptions;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 3,
  },
  optionsContainer: {
    flexDirection: "row",
    zIndex: 100,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    height: 40,
    borderRadius: 20,
    width: "70%",
    marginBottom: 5,
    alignSelf: "center",
    padding: 2,
  },
  selectionContainer: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
  },
  text: {
    color: colors.w_contrast,
  },
});
