import {
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import React, { useRef, useState } from "react";
import { EventType } from "@/types";
import EventStoriesCarousel from "./EventStoriesCarousel";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const StoriesContainer: React.FC<{
  events: EventType[];
  setStoriesVisible: (visible: boolean) => void;
  startingIndex: number;
  onPresentModal: (
    postId: string,
    postCreator: string,
    report_type: string
  ) => void;
}> = ({ events, setStoriesVisible, startingIndex, onPresentModal }) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const mainCarouselRef = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(startingIndex);
  const next = () => {
    mainCarouselRef.current?.next();
  };

  const prev = () => {
    mainCarouselRef.current?.prev();
  };

  const animationStyle = (value: number) => {
    "worklet";
    const rotateZ = `${value * 45}deg`;
    const translateX = value * screenHeight;
    return {
      transform: [{ rotateZ }, { translateX }],
      zIndex: 10,
    };
  };

  const renderItem = ({ item, index }: { item: EventType; index: number }) => {
    return (
      <View style={{ width: "100%", height: "100%" }}>
        <EventStoriesCarousel
          event={item}
          next={next}
          prev={prev}
          setStoriesVisible={setStoriesVisible}
          onPresentModal={onPresentModal}
          isActive={events.indexOf(item) === activeIndex ? true : false}
          isLastItem={index === events.length - 1}
        />
      </View>
    );
  };

  return (
    <View style={[styles.storyWrapper]}>
      <View style={styles.container}>
        <Carousel
          ref={mainCarouselRef}
          loop={false}
          data={events}
          renderItem={renderItem}
          defaultIndex={startingIndex}
          width={screenWidth}
          height={screenHeight}
          customAnimation={animationStyle}
          panGestureHandlerProps={{
            activeOffsetX: [-40, 40],
          }}
          onSnapToItem={(index) => {
            setActiveIndex(index);
          }}
        />
      </View>
    </View>
  );
};

export default StoriesContainer;

const styles = StyleSheet.create({
  storyWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    alignItems: "flex-end",
  },
  closeicon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
});
