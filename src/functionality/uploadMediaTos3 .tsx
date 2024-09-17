import { Amplify, Storage } from "aws-amplify";
import config from "../../aws_export/aws-exports.js";
import * as Sentry from "@sentry/react-native";

Amplify.configure(config);


const uploadMediaTos3 = async (uri: string, mediaType: "image" | "video") => {
  // URI to Blob function
  const uriToBlob = (uri: string) => {
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

  // Upload to S3
  try {
    const fileType = uri.split(".").pop();
    const fileName = `${new Date().getTime()}.${fileType}`;
    const blob = await uriToBlob(uri);

    const configObj = {
      contentType: mediaType === "image" ? "image/jpeg" : "video/mp4",
      ACL: "public-read",
    };

    const result = await Storage.put(fileName, blob, configObj);

    const cloudFrontURL = `https://dijtywqe2wqrv.cloudfront.net/public/${result.key}`;
    return cloudFrontURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    Sentry.captureException(error);
  }
};
const uploadMediaTos3WithSource = async (
  uri: string,
  mediaType: "image" | "video",
  source: "camera" | "library"
) => {
  // URI to Blob function
  const uriToBlob = (uri: string) => {
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

  let fileType;
  if (source === "camera") {
    fileType = uri.split(".").pop();
  } else {
    fileType = mediaType === "image" ? "jpeg" : "mp4";
  }

  const fileName = `${new Date().getTime()}.${fileType}`;
  const blob = await uriToBlob(uri);

  const configObj = {
    contentType: mediaType === "image" ? "image/jpeg" : "video/mp4",
    ACL: "public-read",
  };

  try {
    const result = await Storage.put(fileName, blob, configObj);
    const cloudFrontURL = `https://dijtywqe2wqrv.cloudfront.net/public/${result.key}`;
    return cloudFrontURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    Sentry.captureException(error);
  }
};




export { uploadMediaTos3, uploadMediaTos3WithSource };
