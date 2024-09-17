import React from "react";
import * as Progress from "react-native-progress";
import colors from "../../config/colors";

const OnBoardingProgressBar = (props) => {
  const { progress } = props;
  return (
    <Progress.Bar
      progress={progress}
      width={null}
      height={2}
      useNativeDriver={true}
      color={colors.__teal_light}
      borderRadius={4}
      borderColor="transparent"
      unfilledColor="#344C68"
      marginTop={30}
    />
  );
};

export default OnBoardingProgressBar;
