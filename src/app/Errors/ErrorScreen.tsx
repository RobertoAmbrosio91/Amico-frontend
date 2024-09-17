import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, {FC} from "react";
import colors from "../../config/colors";
import { MaterialIcons } from "@expo/vector-icons";
import typography from "../../config/typography";
import CustomButton from "../../components/buttons&inputs/CustomButton";

interface ErrorScreenProps {
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean | null>>;
  onRefresh: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  state,
  setState,
  onRefresh,
}) => {
  const handleReload = () => {
    setState(!state);
    onRefresh();
  };
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons
          name="error-outline"
          size={60}
          color={colors.__blue_light}
        />
        <Text style={styles.message}>Oops! Something went wrong.</Text>
        <CustomButton
          text={"Reload"}
          borderStyle={styles.button}
          textStyle={styles.buttonText}
          onPress={handleReload}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.__main_background,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 15,
  },
  message: {
    color: colors.__blue_light,
    fontFamily: typography.appFont[400],
    fontSize: 18,
  },
  button: {
    width: "50%",
    backgroundColor: colors.__amico_blue,
  },
  buttonText: {
    fontFamily: typography.appFont[600],
    color: colors.w_contrast,
  },
});

export default ErrorScreen;
