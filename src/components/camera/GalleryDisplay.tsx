import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import colors from "src/config/colors";

const GalleryDisplay = ({
  setSelectedMediaUri,
  selectedMediaUri,
}: {
  setSelectedMediaUri: (uri: string) => void;
  selectedMediaUri: any;
}) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work! Please go to your settings and grant access.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
          { cancelable: false }
        );
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 10,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const imageURIs = media.assets.map((asset) => asset.uri);
      setImages(imageURIs);
    })();
  }, []);

  const handlePress = (uri: string) => {
    setSelectedMediaUri(uri);
  };

  return (
    <FlatList
      data={images}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)}>
          <Image
            source={{ uri: item }}
            style={[
              styles.image,
              item === selectedMediaUri && styles.selectedImage,
            ]}
          />
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => index.toString()}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 100,
    marginRight: 5,
    borderRadius: 8,
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: colors.__logo_color,
  },
});

export default GalleryDisplay;
