import * as ImagePicker from "expo-image-picker";

const selectMedia = async (setIsSelectingMedia: any) => {
  setIsSelectingMedia(true);
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 1,
    base64: true,
  });
  if (result.canceled) {
    setIsSelectingMedia(false);
    return null;
  }
  if (result?.assets && result.assets.length > 0) {
    const selectedUri = result.assets[0].uri;
    const fileSize = result.assets[0].fileSize;
    if (fileSize && fileSize < 104857600) {
      setIsSelectingMedia(false);
      return selectedUri;
    } else {
      setIsSelectingMedia(false);
      alert("File size too large. Select file under 100MB");
      return null;
    }
  }
};

export default selectMedia;
