import React, { memo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { PostType } from "../../types";
import typography from "src/config/typography";
import Carousel from "react-native-reanimated-carousel";
import { ResizeMode, Video } from "expo-av";
import colors from "src/config/colors";
import { AntDesign, Feather } from "@expo/vector-icons";
import { toggleLikeUnlike } from "@/hooks/posts/toggleLikeUnlike";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

type Props = {
  post: PostType;
  token: string;
  onPresentModal: (
    postId: string,
    postCreator: string,
    eventType: string
  ) => void;
  isCarouselVisible: boolean;
};

const EventPost: React.FC<Props> = ({
  post,
  token,
  onPresentModal,
  isCarouselVisible,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const mediaItems =
    post.images &&
    post.videos &&
    post.images
      .filter((image: any) => image.trim() !== "")
      .map((image: any) => ({ type: "image", url: image }))
      .concat(
        post.videos
          .filter((video: any) => video.trim() !== "")
          .map((video: any) => ({ type: "video", url: video }))
      );

  const renderItem = ({ item, index }: any) => {
    const shouldPlay = activeSlide === index && isCarouselVisible;

    const isVideo = item.type === "video";
    return (
      <Pressable
        style={{ width: screenWidth, height: 400 }}
        onPress={() => isVideo && setIsMuted(!isMuted)}
      >
        {isVideo ? (
          <Video
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={shouldPlay}
            isMuted={isMuted}
            isLooping
          />
        ) : (
          <Image source={{ uri: item.url }} style={styles.media} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.postContainer}>
      <Header post={post} />
      <Carousel
        data={mediaItems!}
        renderItem={renderItem}
        width={screenWidth - 32}
        height={400}
        onSnapToItem={setActiveSlide}
        loop={false}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
      />
      {mediaItems!.length > 1 && (
        <CustomPagination
          totalItems={mediaItems!.length}
          activeIndex={activeSlide}
        />
      )}

      <View style={styles.actionsContainer}>
        <LikeButton post={post} token={token} onPresentModal={onPresentModal} />
      </View>
    </View>
  );
};

const Header: React.FC<{ post: PostType }> = ({ post }) => {
  const router = useRouter();
  const postCreator =
    post.post_by_data[0]?.user_name ||
    `${post.post_by_data[0]?.first_name} ${post.post_by_data[0]?.last_name}`;
  const profilePhoto =
    post.post_by_data[0]?.profile ||
    "https://dijtywqe2wqrv.cloudfront.net/public/default_profile.png";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/user/${post.post_by_data[0]._id}`)}
      style={styles.headerContainer}
    >
      <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
      <View>
        {/* <Text style={styles.creatorName}>{postCreator}</Text> */}
        <Text style={styles.creatorName}>{post.title}</Text>
        <Text style={[styles.creatorName, { color: "#666666", fontSize: 12 }]}>
          {post.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CustomPagination: React.FC<any> = ({ totalItems, activeIndex }) => {
  const maxVisibleDots = 3;

  const showMoreIndicator = totalItems > maxVisibleDots + 1;

  const visibleDots = showMoreIndicator ? maxVisibleDots + 1 : totalItems;

  return (
    <View style={styles.paginationContainer}>
      {[...Array(visibleDots)].map((_, index) => {
        let isMoreIndicator = index === maxVisibleDots && showMoreIndicator;
        let isActive = isMoreIndicator
          ? activeIndex >= maxVisibleDots
          : activeIndex === index;

        let dotSize = 6;
        if (isMoreIndicator) {
          dotSize = activeIndex === totalItems - 1 ? 6 : 4;
        }

        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: isActive ? "#000" : colors.__01_light_n,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const LikeButton: React.FC<{
  post: PostType;
  token: string;

  onPresentModal: (
    postId: string,
    postCreator: string,
    eventType: string
  ) => void;
}> = ({ post, token, onPresentModal }) => {
  const [isLiked, setIsLiked] = useState(post.liked_by_me);

  const handleLikePress = async () => {
    setIsLiked(!isLiked);
    post.total_likes = post.total_likes + (isLiked ? -1 : 1);
    try {
      await toggleLikeUnlike(post._id, token!);
    } catch (error) {
      console.log("There was an error toggling the like/unlike state:", error);
    }
  };

  return (
    <View style={[styles.likeButtonContainer]}>
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={handleLikePress}>
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={20}
            color={isLiked ? "red" : colors.__01_light_n}
          />
        </TouchableOpacity>
        {post.total_likes > 0 && (
          <Text style={styles.likesCount}>{post.total_likes}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onPresentModal(post._id, post.post_by, "post")}
      >
        <Feather name="alert-triangle" size={20} color={colors.__01_light_n} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    height: 500,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5,
  },
  creatorName: {
    fontFamily: typography.appFont[400],
    color: colors.__main_text,
  },
  media: {
    width: "92%",
    height: "100%",
    borderRadius: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  paginationContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    // backgroundColor: colors.__main_text,
  },

  likeButtonContainer: {
    flex: 1,
    // marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  likesCount: {
    color: colors.__main_text,
    marginLeft: 8,
    fontFamily: typography.appFont[500], // Adjust as per your typographic scale
  },
});

export default memo(EventPost);
