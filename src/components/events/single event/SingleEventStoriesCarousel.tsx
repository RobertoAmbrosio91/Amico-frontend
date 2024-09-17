import React, { useRef, useState } from "react";
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
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel"; // Import your carousel library
import { EventType } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import UserInteraction from "../stories/UserInteraction";
import { Image } from "expo-image";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const SingleEventStoriesCarousel: React.FC<any> = ({
  event,
  setStoriesVisible,
  onPresentModal,
  startingIndex,
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
  startingIndex: number;
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(startingIndex);
  const carouselRef = useRef<ICarouselInstance>(null);
  const memories = event.memories;
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const closingAnimation = useRef(new Animated.Value(0)).current;
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return item.memory_type === "image" ? (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Header item={item} setStoriesVisible={setStoriesVisible} />
        <Image
          contentFit="contain"
          style={styles.imageMedia}
          source={{ uri: item.media_file }}
        />
        <View
          style={{
            width: "100%",
            position: "absolute",
            bottom: 100,
            zIndex: 100000,
          }}
        >
          <View style={{ top: 50 }}>
            <UserInteraction onPresentModal={onPresentModal} item={item} />
          </View>
        </View>
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <Header item={item} setStoriesVisible={setStoriesVisible} />

        <Video
          source={{ uri: `${item.media_file}` }}
          style={styles.imageMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay={index === activeIndex}
          isLooping={true}
        />
        <View
          style={{
            width: "100%",
            position: "absolute",
            bottom: 100,
            zIndex: 100000,
          }}
        >
          <View style={{ top: 50 }}>
            <UserInteraction onPresentModal={onPresentModal} item={item} />
          </View>
        </View>
      </View>
    );
  };
  //closing with swipe
  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationY, velocityY } = event.nativeEvent;
    if (translationY > 100 && velocityY > 10 && !isClosing) {
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
  const transform = [
    {
      translateY: closingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenHeight], // slide down by screenHeight
      }),
    },
    {
      scale: closingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.001], // scale down to 80% of original size
      }),
    },
  ];
  const goNext = () => {
    if (activeIndex === memories.length - 1) {
      closeStoriesAnimation();
    }
    carouselRef.current?.next();
  };
  const goPrev = () => {
    carouselRef.current?.prev();
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <Animated.View
        style={[
          styles.container,
          isClosing && {
            transform: transform,
          },
        ]}
      >
        <Pressable
          style={styles.goPrevious}
          onPress={() => goPrev()}
        ></Pressable>
        <Pressable style={styles.goNext} onPress={() => goNext()}></Pressable>
        <Carousel
          ref={carouselRef}
          loop={false}
          autoPlay={false}
          data={memories}
          defaultIndex={startingIndex}
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

export default SingleEventStoriesCarousel;

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

const Header = ({ item, setStoriesVisible }: any) => {
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
          setStoriesVisible(false);
          router.setParams({
            is_story: "no",
          });
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
    zIndex: 0,
    borderRadius: 10,
  },
  imageMedia: {
    width: screenWidth,
    height: screenHeight,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    position: "absolute",
    top: 60,
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
    height: screenHeight / 1.35,
    position: "absolute",
    top: 150,
    left: 0,
    zIndex: 100,
  },
  goNext: {
    backgroundColor: "transparent",
    width: screenWidth / 2.5,
    height: screenHeight / 1.35,
    position: "absolute",
    top: 150,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    height: 60,
    width: "100%",
    position: "absolute",
    top: 70,
    zIndex: 10000,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
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
});
