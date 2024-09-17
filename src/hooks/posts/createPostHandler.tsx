import axios from "../axios/axiosConfig";
import { Storage } from "aws-amplify";
import * as Sentry from "@sentry/react-native";

export const uriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error("uriToBlob failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

export const uploadToS3 = async (
  uri: string,
  mediaType: "image" | "video"
): Promise<string> => {
  try {
    const fileType = uri.split(".").pop();
    const fileName = `${new Date().getTime()}.${fileType}`;
    const blob = await uriToBlob(uri);
    const result = await Storage.put(fileName, blob, {
      contentType: mediaType === "image" ? "image/jpeg" : "video/mp4",
      acl: "public-read",
    });
    const cloudFrontURL = `https://dijtywqe2wqrv.cloudfront.net/public/${result.key}`;
    return cloudFrontURL;
  } catch (error: any) {
    // Consider using a more specific error type if available
    console.error("Error uploading file:", error);
    Sentry.captureException(error);
    return "";
  }
};

// Assuming the types for mediaPost and currentUser are defined elsewhere in your code
export const createPost = async (
  mediaPost: any, 
  currentUser: any, 
  
): Promise<any> => {
  
  if (mediaPost.media_type === "image" && mediaPost.imageUri) {
    const cloudFrontURL = await uploadToS3(mediaPost.imageUri, "image");
    // s3URL = `https://${config.aws_user_files_s3_bucket}.s3.${config.aws_user_files_s3_bucket_region}.amazonaws.com/public/${uploadedData.key}`;
    mediaPost.imageUri = cloudFrontURL;
  } else if (mediaPost.media_type === "video" && mediaPost.videoUri) {
    const cloudFrontURL = await uploadToS3(mediaPost.videoUri, "video");
    // s3URL = `https://${config.aws_user_files_s3_bucket}.s3.${config.aws_user_files_s3_bucket_region}.amazonaws.com/public/${uploadedData.key}`;
    mediaPost.videoUri = cloudFrontURL;
  }
  try {
    const response = await axios.post(
      "/user/create-post",
      {
        type: mediaPost.media_type,
        title: mediaPost.title,
        description: mediaPost.description,
        category_id: mediaPost.category,
        subcategory_id: mediaPost.sub_category,
        images: [mediaPost.imageUri],
        videos: [mediaPost.videoUri],
        request_id: mediaPost.request_id,
        background_color: mediaPost.backgroundColor,
        type_of_post: mediaPost.type_of_post,
      },
      {
        headers: { "x-access-token": currentUser.token },
      }
    );
    if (response.data && response.data.success) {
      const responseDataJson = JSON.stringify(response.data);
      // console.log("Post created successfully : ", responseDataJson);
      return true; // Return true on success
    } else {
      // Handle other cases where response.data.success is false or undefined
      const responseDataJson = JSON.stringify(response.data);
      console.log("Something went wrong or no data returned: ", responseDataJson);
      return false; // Return false on failure or no data
    }
  } catch (error: any) {
    // Handle errors
    if (error.response && error.response.data && error.response.message) {
      console.log(error.response.data.message);
    } else {
      console.error("Error creating post", error);
    }
    Sentry.captureException(error);
    return false; // Return false on error
  }
};


