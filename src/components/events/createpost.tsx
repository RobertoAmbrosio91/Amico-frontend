import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useState } from "react";
import { EvilIcons, AntDesign } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Memorytype } from "@/types";
import CustomButton from "../buttons&inputs/CustomButton";
import colors from "src/config/colors";
import { ResizeMode, Video } from "expo-av";
import createEventPost from "@/hooks/events/createEventPost";
import SignupInput from "../buttons&inputs/SignupInput";
import { Image } from "expo-image";

const Createpost: React.FC<any> = ({
  bottomSheetModalRef,
  memories,
  token,
}) => {
  const [imageMemories, setImageMemories] = React.useState<string[]>([]);
  const [videoMemories, setVideoMemories] = React.useState<string[]>([]);
  const [selectedMemories, setSelectedMemories] = useState<Memorytype[]>([]);
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [steps, setSteps] = React.useState<number>(1);
  const isDisabled = imageMemories.length === 0 && videoMemories.length === 0;
  const [shouldPlay, setShouldPlay] = useState<any>(null);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get("window").width;

  const handleSelectMemories = (memory: Memorytype) => {
    if (selectedMemories.includes(memory)) {
      setSelectedMemories((prev) => prev.filter((prev) => prev !== memory));
    } else {
      setSelectedMemories((prev) => [...prev, memory]);
    }
    if (memory.memory_type === "image") {
      if (imageMemories.includes(memory.media_file)) {
        setImageMemories((prev) =>
          prev.filter((prev) => prev !== memory.media_file)
        );
      } else {
        setImageMemories((prev) => [...prev, memory.media_file]);
      }
    } else {
      if (videoMemories.includes(memory.media_file)) {
        setVideoMemories((prev) =>
          prev.filter((prev) => prev !== memory.media_file)
        );
      } else {
        setVideoMemories((prev) => [...prev, memory.media_file]);
      }
    }
  };
  const createPost = async () => {
    const parameters = {
      title: title,
      description: description,
      images: imageMemories,
      videos: videoMemories,
      type: "event",
      event_id: memories[0].event_id,
    };

    if (token && parameters) {
      const response = await createEventPost(parameters, token);
      if (response) {
        bottomSheetModalRef.current?.dismiss();
        setSteps(1);
        setSelectedMemories([]);
      }
    }
  };

  const renderMyItem = ({ item, index }: { item: any; index: number }) => {
    const handlePlayPause = () => {
      shouldPlay === index ? setShouldPlay(null) : setShouldPlay(index);
    };
    return item.memory_type === "image" ? (
      <View style={{ flex: 1 }}>
        <Image
          contentFit="cover"
          style={styles.imageMedia}
          source={{ uri: item.media_file }}
        />
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={[styles.playButton]} onPress={handlePlayPause}>
          <AntDesign
            name={shouldPlay === index ? "pausecircleo" : "playcircleo"}
            size={44}
            color="white"
          />
        </TouchableOpacity>
        <Video
          source={{ uri: `${item.media_file}` }}
          style={styles.imageMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldPlay === index ? true : false}
          isLooping={true}
        />
      </View>
    );
  };

  const slideToStep2 = () => {
    // Slide in from  right to left
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideToStep1 = () => {
    // Slide out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const goToStep2 = () => {
    setSteps(2);
    slideToStep2();
  };

  const goToStep1 = () => {
    setSteps(1);
    setShouldPlay(null);
    slideToStep1();
  };

  const handleCloseModal = () => {
    bottomSheetModalRef.current?.close();
    setSelectedMemories([]);
    setImageMemories([]);
    setVideoMemories([]);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={["86%"]}
      handleStyle={{
        backgroundColor: colors.__main_background,
      }}
      handleIndicatorStyle={{
        backgroundColor: "black",
      }}
    >
      {/* step 1 view */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -windowWidth],
                }),
              },
            ],

            position: "absolute",
            width: "100%",
            height: "100%",
          },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCloseModal}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.text}>Select you favourite memories</Text>
            <Text></Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.innerContainer}>
              {memories &&
                memories.map((memory: Memorytype, index: number) => {
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelectMemories(memory)}
                      key={index}
                      style={{ width: "33%" }}
                    >
                      {memory.memory_type === "image" ? (
                        <Image
                          source={{ uri: memory.media_file }}
                          style={styles.image}
                        />
                      ) : (
                        <Video
                          source={{ uri: memory.media_file }}
                          style={styles.image}
                          resizeMode={ResizeMode.COVER}
                          isMuted={true}
                          shouldPlay={false}
                        />
                      )}

                      {(videoMemories.includes(memory.media_file) ||
                        imageMemories.includes(memory.media_file)) && (
                        <View style={styles.selected}>
                          <EvilIcons name="check" size={26} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          </ScrollView>

          <View style={styles.createPostContainer}>
            <CustomButton
              onPress={goToStep2}
              text={"Next"}
              borderStyle={{
                backgroundColor: isDisabled
                  ? colors.__disabled_button
                  : colors.primary_contrast,
                marginBottom: 10,
                borderRadius: 10,
              }}
              textStyle={{ fontWeight: "600", color: "white" }}
            />
          </View>
        </View>
      </Animated.View>

      {/* step 2 view */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [windowWidth, 0],
                }),
              },
            ],
            position: "absolute",
            width: "100%",
            height: "100%",
          },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goToStep1}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.text}>Post preview</Text>
            <Text></Text>
          </View>

          <View>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              data={selectedMemories}
              keyExtractor={(item) => item._id.toString()}
              renderItem={renderMyItem}
            />
          </View>

          <View style={{ paddingHorizontal: 15, rowGap: 15, marginTop: 20 }}>
            <View style={{ rowGap: 10 }}>
              <Text>Name your post</Text>
              <SignupInput
                style={styles.input}
                onChangeText={(value) => setTitle(value)}
                placeholder="Give it a name (optional)"
              />
            </View>
            <View style={{ rowGap: 10 }}>
              <Text>Add a caption</Text>
              <SignupInput
                onChangeText={(value) => setDescription(value)}
                style={styles.inputCaption}
                placeholder="Add a caption  (optional)"
                multiline={true}
              />
            </View>
          </View>
          <View style={[styles.createPostContainer, { marginTop: 20 }]}>
            <CustomButton
              onPress={createPost}
              text={"Share"}
              disabled={isDisabled}
              borderStyle={
                isDisabled
                  ? {
                      backgroundColor: colors.__disabled_button,
                      borderRadius: 10,
                    }
                  : { borderRadius: 10 }
              }
              textStyle={{ fontWeight: "600", color: "white" }}
            />
          </View>
        </View>
      </Animated.View>
    </BottomSheetModal>
  );
};

export default memo(Createpost);

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 120,
  },
  selected: {
    position: "absolute",
    top: 7,
    right: 7,
    zIndex: 10,
  },
  createPostContainer: {
    paddingHorizontal: 15,
    rowGap: 10,
    alignItems: "center",
  },
  text: {
    color: colors.__main_text_color,
    fontSize: 16,
    alignSelf: "center",
    paddingVertical: 10,
    fontWeight: "600",
  },
  inputText: {
    color: colors.__main_text_color,
    fontSize: 16,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: colors.__background_input,
    borderColor: "transparent",
    color: colors.__main_text_color,
    borderRadius: 10,
  },
  inputCaption: {
    backgroundColor: colors.__background_input,
    borderColor: "transparent",
    color: colors.__main_text_color,
    borderRadius: 10,
    height: 150,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: colors.__main_background,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.__main_background,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 50,
  },
  imageMedia: {
    width: 140,
    height: 200,
    borderRadius: 10,
    marginLeft: 10,
  },
  playButton: {
    position: "absolute",
    left: 58,
    top: "40%",
    zIndex: 10000,
  },
});