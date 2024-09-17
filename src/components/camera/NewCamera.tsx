import React, { useEffect, useState, useRef, FC } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  Linking,
} from "react-native";
import { Camera, CameraType, FlashMode } from "expo-camera";
import { Video, ResizeMode, Audio } from "expo-av";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import createMemory from "@/hooks/events/createMemory";
import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
import {
  uploadMediaTos3,
  uploadMediaTos3WithSource,
} from "@/services/uploadMediaTos3 ";
import SignupInput from "../buttons&inputs/SignupInput";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";
import { Keyboard } from "react-native";
import Loading from "../Loading/Loading";
import selectMedia from "@/services/selectMediaFile";
import getFileType from "@/services/getFileType";
import GalleryDisplay from "./GalleryDisplay";
import colors from "@/config/colors";
import typography from "@/config/typography";

interface CameraComponentProps {
  setIsCameraOpen: (isOpen: boolean) => void;
  eventId: string;
  setShouldScrollToLast: any;
  eventData: any;
}

const CameraComponent: FC<CameraComponentProps> = ({
  setIsCameraOpen,
  eventId,
  setShouldScrollToLast,
  eventData,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(
    null
  );
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | null
  >(null);

  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [isPhotoMode, setIsPhotoMode] = useState<boolean>(true);
  const [isFlash, setIsFlash] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [capturedMediaUri, setCapturedMediaUri] = useState<string | null>(null);
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaType = isVideoMode ? "video" : "image";
  const cameraRef = useRef<Camera>(null);
  const currentUser = useFetchUserDataAsync();
  const [bottomPadding, setBottomPadding] = useState(new Animated.Value(30));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");
  const [focusMode, setFocusMode] = useState(true);
  const [zoom, setZoom] = useState<number>(0);
  const [isSelectingMedia, setIsSelectingMedia] = useState<boolean>(false);
  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Camera.requestCameraPermissionsAsync();
  //     setHasPermission(status === "granted");
  //     const audioStatus = await Audio.getPermissionsAsync();
  //     setHasAudioPermission(audioStatus.status === "granted");
  //   })();
  // }, []);
  useEffect(() => {
    const requestPermissions = async () => {
      // Requesting Camera Permission
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === "granted");

      // Requesting Audio Permission
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus === "granted");
      // Requesting Media Library Permission
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus === "granted");
    };

    requestPermissions();
  }, []);

  const handleCameraType = () => {
    setCameraType(
      cameraType === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      if (isRecording) setIsRecording(!isRecording);
      if (isPhotoMode) {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedMediaUri(photo.uri);
      } else {
        if (isRecording) {
          cameraRef.current.stopRecording();
        } else {
          try {
            setIsRecording(true);
            const video = await cameraRef.current.recordAsync();
            setCapturedMediaUri(video.uri);
          } catch (error) {
            if (error instanceof Error) {
              console.log("Error recording:", error.message);
            } else {
              // Handle any other types of unknown errors
              console.log("Unknown error occurred while recording:", error);
            }
          }
        }
      }
    }
  };

  const handleConfirmMedia = async () => {
    const source = capturedMediaUri ? "camera" : "library";
    const mediaUri = capturedMediaUri || selectedMediaUri;

    if (mediaUri && currentUser && eventId) {
      setIsLoading(true);
      const cloudfrontURL = await uploadMediaTos3WithSource(
        mediaUri,
        mediaType,
        source
      );

      if (cloudfrontURL) {
        try {
          const createMemoryResponse = await createMemory(
            eventId,
            cloudfrontURL,
            mediaType,
            caption,
            currentUser.token
          );
          if (createMemoryResponse && createMemoryResponse.success) {
            setIsLoading(false);
            setIsCameraOpen(false);
          }
        } catch (error: any) {
          console.log("Something went wrong creating the memory");
        }
      }
    }
  };

  const handleRetakeMedia = () => {
    setCapturedMediaUri(null);
    setSelectedMediaUri(null);
  };

  //recording duration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isRecording && isVideoMode) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, isVideoMode]);
  useEffect(() => {
    if (
      isRecording &&
      isVideoMode &&
      cameraRef.current &&
      recordingDuration === 40
    ) {
      if (isRecording) setIsRecording(!isRecording);
      cameraRef.current.stopRecording();
    }
  }, [recordingDuration]);
  // Convert the recording duration (in seconds) to mm:ss format
  const formatRecordingDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        Animated.timing(bottomPadding, {
          toValue: 150,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // setBottomPadding(new Animated.Value(0));
        Animated.timing(bottomPadding, {
          toValue: 40,
          duration: 200, // Match this to the keyboard hide animation speed as well
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const closeKeyboard = () => {
    Animated.timing(bottomPadding, {
      toValue: 40,
      duration: 350, // Match this to the keyboard hide animation speed as well
      useNativeDriver: false,
    }).start();
    setTimeout(() => {
      Keyboard.dismiss();
    }, 70);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };
  const selectMediaFile = async () => {
    const imageUri = await selectMedia(setIsSelectingMedia);
    if (imageUri) {
      setCapturedMediaUri(imageUri);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false || hasAudioPermission === false) {
    return (
      <View style={styles.containerNoPermissions}>
        <Text style={{ fontSize: 16, fontFamily: typography.appFont[600] }}>
          Permissions needed
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Let's get started! 🎉 Please allow access to your camera, microphone,
          and media to share your moments on Amico.
        </Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openSettings();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  return (
    <Pressable style={styles.cameraWrapper} onPress={() => closeKeyboard()}>
      {isLoading || (isSelectingMedia && <Loading />)}
      <View style={styles.cameraOuterContainer}>
        {!capturedMediaUri && !selectedMediaUri && (
          <Camera
            style={styles.camera}
            type={cameraType}
            ref={cameraRef}
            flashMode={isFlash ? FlashMode.torch : FlashMode.off}
            focusDepth={1}
            autoFocus={focusMode}
            zoom={zoom}
          >
            <View style={styles.eventTextContainer}>
              <Text style={styles.eventText}>
                Make {eventData?.name} unforgettable, share the best memories
                with your friends!
              </Text>
            </View>
            <Pressable style={styles.cameraContainer} onPress={toggleFocusMode}>
              <TouchableOpacity
                onPress={() => setIsFlash(!isFlash)}
                style={styles.flash}
              >
                <Ionicons
                  name={isFlash ? "flash-outline" : "flash-off-outline"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCloseCamera}
                style={styles.closeIcon}
              >
                <AntDesign name="close" size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.zoomOptions}>
                <TouchableOpacity onPress={() => setZoom(0)}>
                  <Text
                    style={[
                      styles.zoomText,
                      zoom === 0 && styles.selectedZoomText,
                    ]}
                  >
                    {zoom === 0 ? "1x" : "1.0"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setZoom(0.003)}>
                  <Text
                    style={[
                      styles.zoomText,
                      zoom === 0.003 && styles.selectedZoomText,
                    ]}
                  >
                    {zoom === 0.003 ? "2x" : "2.0"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setZoom(0.007)}>
                  <Text
                    style={[
                      styles.zoomText,
                      zoom === 0.007 && styles.selectedZoomText,
                    ]}
                  >
                    {zoom === 0.007 ? "3x" : "3.0"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Camera>
        )}

        {capturedMediaUri && currentUser && (
          <View style={styles.previewContainer}>
            {getFileType(capturedMediaUri) === "image" ? (
              <Image
                style={styles.previewImage}
                source={{ uri: capturedMediaUri }}
              />
            ) : (
              <Video
                source={{ uri: capturedMediaUri }}
                style={styles.previewVideo}
                shouldPlay
                useNativeControls={true}
                resizeMode={ResizeMode.COVER}
              />
            )}

            <View style={styles.closeIconContainer}>
              <TouchableOpacity onPress={handleRetakeMedia}>
                <AntDesign name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.confirmButtonsContainer2,
                { bottom: bottomPadding },
              ]}
            >
              <SignupInput
                placeholder="add a caption..."
                placeholderColor="#999"
                style={{
                  width: "92%",
                  paddingHorizontal: 0,
                  backgroundColor: "transparent",
                  height: 45,
                  color: "white",
                  borderColor: "transparent",
                }}
                onChangeText={(value) => setCaption(value)}
              />
              <TouchableOpacity onPress={handleConfirmMedia}>
                <Feather name="send" size={23} color={"white"} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
        {selectedMediaUri && currentUser && (
          <View style={styles.previewContainer}>
            <Image
              style={styles.previewImage}
              source={{ uri: selectedMediaUri }}
            />
            <View style={styles.closeIconContainer}>
              <TouchableOpacity onPress={handleRetakeMedia}>
                <AntDesign name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.confirmButtonsContainer2,
                { bottom: bottomPadding },
              ]}
            >
              <SignupInput
                placeholder="add a caption..."
                placeholderColor="#999"
                style={{
                  width: "92%",
                  paddingHorizontal: 0,
                  backgroundColor: "transparent",
                  height: 45,
                  color: "white",
                  borderColor: "transparent",
                }}
                onChangeText={(value) => setCaption(value)}
              />
              <TouchableOpacity onPress={handleConfirmMedia}>
                <Feather name="send" size={23} color={"white"} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
      <View
        style={[
          { marginTop: 15, rowGap: 10 },
          hasMediaLibraryPermission ? { height: 250 } : { height: 150 },
        ]}
      >
        <View>
          <GalleryDisplay
            setSelectedMediaUri={setSelectedMediaUri}
            selectedMediaUri={selectedMediaUri}
          />
        </View>

        <View style={styles.cameraControlsContainer}>
          <TouchableOpacity
            style={styles.switchModeIcon}
            onPress={() => selectMediaFile()}
          >
            <Ionicons name={"images-outline"} size={35} color="white" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={handleCapture}>
              <View style={styles.captureBorder}>
                <View
                  style={[
                    isPhotoMode
                      ? styles.shoot
                      : isRecording
                        ? styles.isRecording
                        : styles.record,
                  ]}
                ></View>
              </View>
              {isRecording && isVideoMode && (
                <Text style={styles.recordingTimer}>
                  {formatRecordingDuration(recordingDuration)}
                </Text>
              )}
            </TouchableOpacity>
            <View
              style={{
                position: "absolute",
                bottom: "-50%",
                flexDirection: "row",
                columnGap: 15,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setIsPhotoMode((prev) => !prev);
                  setIsVideoMode((prev) => !prev);
                }}
              >
                <Text
                  style={[
                    styles.modeText,
                    isVideoMode && styles.selectedModeText,
                  ]}
                >
                  Video
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsPhotoMode((prev) => !prev);
                  setIsVideoMode((prev) => !prev);
                }}
              >
                <Text
                  style={[
                    styles.modeText,
                    isPhotoMode && styles.selectedModeText,
                  ]}
                >
                  Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.switchCameraIcon}
            onPress={handleCameraType}
          >
            <Ionicons name="camera-reverse-outline" size={35} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 20,
  },
  cameraWrapper: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cameraOuterContainer: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "black",
  },
  closeIcon: {
    position: "absolute",
    top: "9%",
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 100,
  },
  flash: {
    position: "absolute",
    top: "9%",
    left: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 100,
  },
  cameraControlsContainer: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#000",
  },
  switchModeIcon: {
    backgroundColor: "rgba(256,256,256,0.1)",
    padding: 10,
    borderRadius: 100,
  },
  // captureIcon: {
  //   // padding: 30,
  // },
  switchCameraIcon: {
    backgroundColor: "rgba(256,256,256,0.1)",
    padding: 10,
    borderRadius: 100,
  },
  captureBorder: {
    width: 77,
    height: 77,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 100,
    borderColor: "#fff",
    borderWidth: 1,
  },
  shoot: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: "#fff",
  },
  record: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: "red",
  },
  isRecording: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "red",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewVideo: {
    width: "100%",
    height: "100%",
  },
  confirmButtonsContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  confirmButtonsContainer2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "92%",
    marginHorizontal: "4%",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 100,
    marginRight: 30,
  },
  retakeButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 100,
  },
  recordingTimer: {
    position: "absolute",
    top: -19,
    alignSelf: "center",
    color: "#fff",
    fontSize: 15,
    bottom: 8,
  },
  closeIconContainer: {
    position: "absolute",
    top: "9%",
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 100,
  },
  keyboardAvoidView: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  zoomOptions: {
    alignSelf: "center",
    flexDirection: "row",
    columnGap: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
  },
  zoomText: {
    color: "#fff",
    fontSize: 15,
  },
  selectedZoomText: {
    color: "yellow",
    fontSize: 16,
  },
  eventTextContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: "10%",
  },
  eventText: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    color: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 5,
  },
  modeText: {
    color: "white",
    fontSize: 16,
  },
  selectedModeText: {
    color: "yellow",
  },

  button: {
    backgroundColor: colors.__amico_blue,
    padding: 10,

    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  containerNoPermissions: {
    top: "40%",
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.__secondary_background,
    borderRadius: 10,
    padding: 15,
    rowGap: 20,
  },
});

export default CameraComponent;
