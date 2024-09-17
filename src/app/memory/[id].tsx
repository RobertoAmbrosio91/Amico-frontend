import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";
  import React, { memo, useEffect, useRef, useState } from "react";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import useFetchUserDataAsync from "@/hooks/async_storage/useFetchUserDataAsync";
  import { EventType, Memorytype } from "@/types";
  import { Entypo, AntDesign, Fontisto, Ionicons } from "@expo/vector-icons";
  import fetchSingleEvent from "@/hooks/events/fetchSingleEvent";
  import typography from "src/config/typography";
  import MemoriesContents from "@/components/events/MemoriesContents";
  import colors from "src/config/colors";
  import { GestureHandlerRootView } from "react-native-gesture-handler";
  import useEventMemoriesSocket from "@/hooks/sockets/useEventMemoriesSocket";
  import {
    BottomSheetModal,
    BottomSheetModalProvider,
  } from "@gorhom/bottom-sheet";
  import { Image } from "expo-image";
  import { Video, ResizeMode } from "expo-av";
  import UserInteraction from "@/components/events/stories/UserInteraction";
import Loading from "@/components/Loading/Loading";
import UsersReactions from "@/components/events/UsersReactions";
import fetchMemory from "@/hooks/events/fetchSingleMemory";

const SingleMemory: React.FC = () => {
  const router = useRouter();
  const { id, memory_id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const memoryId = Array.isArray(memory_id) ? memory_id[0] : memory_id;
  const currentUser = useFetchUserDataAsync();
  const [eventData, setEventData] = useState<EventType>();
  const [memory, setMemory] = useState<Memorytype>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchSingleMemory = async () => {
      if (currentUser && memoryId) {
        try {
          const memory = await fetchMemory(currentUser.token, memoryId);
          if (memory) {
            setMemory(memory);
          }
        } catch (error: any) {
          console.error("Something went wrong fetching the memory");
          setError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSingleMemory();
  }, [currentUser, memoryId]);

  if (isLoading) {
    return (
      <View>
        <Loading />
      </View>
    );
  }

  const headerContent = (
    <View style={styles.headerWrapper}>
      <TouchableOpacity style={styles.gobackIcon} onPress={() => router.back()}>
        <Entypo name="chevron-left" size={26} color={colors.w_contrast} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: `event/${memory?.event_id}`,
          })
        }
        style={styles.eventNameContainer}
      >
        <Text style={styles.eventName}>
          {memory?.eventData && memory?.eventData.name.length > 50
            ? memory.eventData.name.slice(0, 50) + "..."
            : memory?.eventData?.name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: `event/${memory?.event_id}`,
          })
        }
      >
        <Image
          style={styles.eventImage}
          source={{ uri: memory?.eventData.image }}
        />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View>
        <Loading />
      </View>
    );
  }

  return memory && memory.type === "image" ? (
    <SafeAreaView style={styles.singleMemoryWrapper}>
      {headerContent}
      <Image
        contentFit="cover"
        style={styles.imageMedia}
        source={{ uri: memory.media_file }}
      />
      <View style={styles.userInteractionBar}>
        {memory.reactions_summary && <UsersReactions memory={memory} />}
      </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.singleMemoryWrapper}>
      {headerContent}
      <Video
        source={{ uri: `${memory?.media_file}` }}
        style={styles.imageMedia}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
      />
      <View style={styles.userInteractionBar}>
        {memory?.reactions_summary && <UsersReactions memory={memory} />}
      </View>
    </SafeAreaView>
  );
};

export default memo(SingleMemory);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__main_background,
  },
  singleMemoryWrapper: {
    flex: 1,
    backgroundColor: colors.__main_background,
  },
  eventName: {
    color: colors.w_contrast,
    fontFamily: typography.appFont[600],
    fontSize: 16,
    maxWidth: 220,
  },
  eventDescr: {
    color: colors.__main_text,
    fontFamily: typography.appFont[400],
    fontSize: 13,
  },
  eventImage: {
    width: 42,
    height: 42,
    borderRadius: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    paddingRight: 15,
    justifyContent: "space-between",
    flex: 1,
  },
  headerWrapper: {
    flexDirection: "row",
    width: "100%",
    padding: 5,
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 10,
  },
  userInteractionBar: {
    width: "100%",
    position: "absolute",
    bottom: "4%",
    zIndex: 100000,
  },
  imageMedia: {
    top: "3%",
    left: "1%",
    right: "1%",
    width: "98%",
    height: "82%",
    borderRadius: 10,
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
  gobackIcon: {
    padding: 5,
    zIndex: 1,
  },
  eventNameContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
































