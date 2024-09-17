import * as ImagePicker from "expo-image-picker";
import { MediaPostType } from "src/types";

// Define the type for setMediaPost
type SetMediaPost = (value: MediaPostType | ((prevState: MediaPostType) => MediaPostType)) => void;


// Define the type for setFileIsTooBig
type SetFileIsTooBig = (value: React.SetStateAction<boolean>) => void;


export const handleSelectMedia = async (
  mediaType: string,
  setMediaPost: SetMediaPost,
  setFileIsTooBig: (isTooBig: boolean) => void
): Promise<void> => {
  let result: ImagePicker.ImagePickerResult | undefined;

  const maxFileSize = 70 * 1024 * 1024; // 70MB in bytes

  if (mediaType === "video") {
    result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.5,
      base64: true,
    });
  } else if (mediaType === "image") {
    result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
  } else if (mediaType === "text") {
    setMediaPost((prevState) => ({
      ...prevState,
      media_type: mediaType,
    }));
    return;
  }

  if (result?.assets && result.assets.length > 0) {
    const fileSize = result.assets[0].fileSize;

    if (fileSize && fileSize <= maxFileSize) {
      const selectedUri = result.assets[0].uri;
      setFileIsTooBig(false);
      setMediaPost((prevState) => ({
        ...prevState,
        [`${mediaType}Uri`]: selectedUri,
        media_type: mediaType,
      }));
    } else {
      console.log("Selected file is larger than 70MB.");
      setFileIsTooBig(true);
    }
  }
};
