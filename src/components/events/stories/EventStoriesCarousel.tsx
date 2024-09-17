import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { EventType } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import UserInteraction from "./UserInteraction";
import { Image } from 'expo-image';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const EventStoriesCarousel: React.FC<any> = ({
  event,
  next,
  prev,
  setStoriesVisible,
  onPresentModal,
  isActive,
  isLastItem,
}: {
  event: EventType;
  next: any;
  prev: any;
  setStoriesVisible: any;
  onPresentModal: (
    postId: string,
    postCreator: string,
    report_type: string
  ) => void;
  isActive: boolean;
  isLastItem: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const memories = event.memories;
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const closingAnimation = useRef(new Animated.Value(1)).current;

  const openStories = () => {
    setIsClosing(false); // Ensure the closing state is reset
    Animated.timing(closingAnimation, {
      toValue: 0, // Animate to open state
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    openStories(); // Animate in when the component mounts
  }, []);

  //handling swipe detection for next,prev and close stories
  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY, velocityY } = event.nativeEvent;
    // Handle vertical swipe to close
    if (translationY > 100 && velocityY > 10 && !isClosing) {
      closeStoriesAnimation();
    } else {
      // Horizontal swipe thresholds
      const horizontalSwipeThreshold = 150;
      const velocityThreshold = 100;
      // Swipe right to go to prev item
      if (
        translationX > horizontalSwipeThreshold &&
        Math.abs(event.nativeEvent.velocityX) > velocityThreshold
      ) {
        prev();
      }
      // Swipe left to go to next item
      else if (
        translationX < -horizontalSwipeThreshold &&
        Math.abs(event.nativeEvent.velocityX) > velocityThreshold
      ) {
        next();
      }
    }
  };

  const closeStoriesAnimation = () => {
    setIsClosing(true);
    Animated.timing(closingAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setStoriesVisible(false);
        router.setParams({
          is_story: "no",
        });
      }
    });
  };

  const closeStories = () => {
    setIsClosing(true);
    Animated.timing(closingAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setStoriesVisible(false);
        router.setParams({
          is_story: "no",
        });
      }
    });
  };

  const transform = [
    {
      translateY: closingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenHeight],
      }),
    },
    {
      scale: closingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.001],
      }),
    },
  ];

  const goToNextItem = () => {
    if (activeIndex === memories.length - 1) {
      if (!isLastItem) {
        next();
      } else {
        closeStoriesAnimation();
      }
    }
    carouselRef.current?.next();
  };
  const goToPrevItem = () => {
    if (activeIndex === 0) {
      prev();
    }
    carouselRef.current?.prev();
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return item.memory_type === "image" ? (
      <View style={{ flex: 1 }}>
        <Header
          item={item}
          setStoriesVisible={setStoriesVisible}
          closeStories={closeStories}
        />
        <Image
          contentFit="cover"
          style={styles.imageMedia}
          source={{ uri: item.media_file }}
        />
        <View style={styles.userInteractionBar}>
          <UserInteraction onPresentModal={onPresentModal} item={item} />
        </View>
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <Header
          item={item}
          setStoriesVisible={setStoriesVisible}
          closeStories={closeStories}
        />
        <Video
          source={{ uri: `${item.media_file}` }}
          style={styles.imageMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive && index === activeIndex}
          isLooping={true}
        />
        <View style={styles.userInteractionBar}>
          <UserInteraction onPresentModal={onPresentModal} item={item} />
        </View>
      </View>
    );
  };
  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: transform,
          },
        ]}
      >
        <Pressable style={styles.goPrevious} onPress={goToPrevItem}></Pressable>
        <Pressable style={styles.goNext} onPress={goToNextItem}></Pressable>
        <Carousel
          ref={carouselRef}
          loop={false}
          autoPlay={false}
          data={memories}
          renderItem={renderItem}
          width={screenWidth}
          height={screenHeight}
          panGestureHandlerProps={{
            activeOffsetY: [-300, 300],
            activeOffsetX: [-300, 300],
          }}
          onSnapToItem={(index) => setActiveIndex(index)}
        />
        <Pagination totalItems={memories.length} activeIndex={activeIndex} />
      </Animated.View>
    </PanGestureHandler>
  );
};

export default EventStoriesCarousel;

const Pagination = ({
  totalItems,
  activeIndex,
}: {
  totalItems: number;
  activeIndex: number;
}) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalItems }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const Header = ({ item, setStoriesVisible, closeStories }: any) => {
  const router = useRouter();

  const creator = item.created_by.user_name
    ? item.created_by.user_name
    : item.created_by.first_name + " " + item.created_by.last_name;
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileView}
        onPress={() => router.push(`/user/${item.created_by._id}`)}
      >
        <Image
          source={{ uri: item.created_by.profile }}
          style={styles.profileImage}
        />
        <Text style={{ color: "#fff", fontWeight: "500" }}>{creator}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          closeStories();
        }}
      >
        <AntDesign name="close" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  imageMedia: {
    top: "8%",
    left: "1%",
    right: "1%",
    width: "98%",
    height: "82%",
    borderRadius: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    position: "absolute",
    top: "9%",
    zIndex: 1000,
  },

  paginationDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  inactiveDot: {
    backgroundColor: "rgba(256,256,256,0.3)",
  },
  goPrevious: {
    backgroundColor: "transparent",
    width: screenWidth / 2.5,
    height: screenHeight / 1.4,
    position: "absolute",
    top: "17%",
    left: 0,

    zIndex: 100,
  },
  goNext: {
    backgroundColor: "transparent",
    width: screenWidth / 2.5,
    height: screenHeight / 1.4,
    position: "absolute",
    top: "17%",
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    height: 60,
    width: "100%",
    position: "absolute",
    top: "10%",
    zIndex: 10000,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 40,
  },
  profileView: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  userInteractionBar: {
    width: "100%",
    position: "absolute",
    bottom: "4%",
    zIndex: 100000,
  },
});
