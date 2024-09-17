import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import colors from "src/config/colors";
import LottieView from "lottie-react-native";
import CustomButton from "../buttons&inputs/CustomButton";
type DownloadProgressComponentProps = {
  progress: number;
  error: boolean;
  onRetry: () => void;
};

const DownloadProgressComponent = ({
  progress,
  error,
  onRetry,
}: DownloadProgressComponentProps) => {
  return (
    <View style={styles.downloadContainer}>
      {progress === 1 && !error && (
        <View style={styles.progressContainer}>
          <LottieView
            source={require("../../../assets/lottie/check.json")}
            autoPlay
            loop={false}
            style={{
              width: 90,
              height: 90,
            }}
          />
          <Text>Download completed successfully</Text>
        </View>
      )}
      {progress < 1 && !error && (
        <View style={styles.progressContainer}>
          <LottieView
            source={require("../../../assets/lottie/loading.json")}
            autoPlay
            loop={true}
            style={{
              width: 90,
              height: 90,
            }}
          />
          <Progress.Bar
            progress={progress}
            width={200}
            color={colors.__logo_color}
            borderColor="#E1E1E1"
          />
          <Text>Downloading</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={60} color={colors.__logo_color} />
          <Text style={{ textAlign: "center" }}>
            Oops, an error occurred during the download, please try again..
          </Text>
          <CustomButton
            text={"Download again"}
            onPress={onRetry}
            borderStyle={styles.buttonStyle}
            textStyle={styles.buttonText}
          />
        </View>
      )}
    </View>
  );
};

export default DownloadProgressComponent;

const styles = StyleSheet.create({
  progressContainer: {
    rowGap: 15,
    alignContent: "center",
    alignItems: "center",
  },
  downloadContainer: {
    padding: 30,
    borderColor: "#E1E1E1",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "80%",
    alignSelf: "center",
    top: -20,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    rowGap: 15,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  buttonStyle: {
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
