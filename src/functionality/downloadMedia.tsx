import React, { useState, useEffect, useCallback } from "react";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

const useDownloadFiles = (urls: string[], albumName: string) => {
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<number>(0);

  // Reset the download process
  const resetDownloads = useCallback(() => {
    setProgress(0);
    setDownloaded(0);
    setError(false);
  }, []);

  useEffect(() => {
    resetDownloads();
  }, [urls, resetDownloads]);

  const downloadFile = async (
    url: string,
    index: number,
    totalFiles: number
  ) => {
    const urlParts = url.split(".");
    const extension = urlParts[urlParts.length - 1];
    const fileName = `download_${new Date().toISOString().replace(/[^0-9]/g, "")}.${extension}`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const callback = (downloadProgress: any) => {
      const individualProgress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setProgress((prevProgress) => {
        const progressIncrement = individualProgress / totalFiles;
        const updatedProgress = index / totalFiles + progressIncrement;
        return Math.min(updatedProgress, 1);
      });
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      callback
    );

    try {
      const permissionResult = await MediaLibrary.requestPermissionsAsync();
      if (permissionResult.status !== "granted") {
        console.error("Media Library permission not granted");
        return false;
      }

      const result = await downloadResumable.downloadAsync();
      const uri = (result as FileSystem.FileSystemDownloadResult).uri;

      if (Platform.OS === "ios" || Platform.OS === "android") {
        const asset = await MediaLibrary.createAssetAsync(uri);

        // Check if the album exists
        const albums = await MediaLibrary.getAlbumsAsync();
        const foundAlbum = albums.find((a) => a.title === albumName);

        if (foundAlbum) {
          await MediaLibrary.addAssetsToAlbumAsync(
            [asset],
            foundAlbum.id,
            false
          );
        } else {
          // Create a new album with the downloaded file
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        }
      }

      setDownloaded((prevCount) => prevCount + 1);
      return true;
    } catch (error) {
      setError(true);
      console.log("Error downloading the file:", error);
      Sentry.captureException(error);
      return false;
    }
  };

  const downloadAllFiles = async () => {
    resetDownloads(); // Reset at the start to clear previous state
    let allDownloadsSuccessful = true;
    for (let i = 0; i < urls.length; i++) {
      const success = await downloadFile(urls[i], i, urls.length);
      if (!success) {
        allDownloadsSuccessful = false; // If any download fails, mark the entire operation as unsuccessful
      }
    }
    return allDownloadsSuccessful;
  };

  return { downloadAllFiles, progress, error, downloaded, resetDownloads };
};

export default useDownloadFiles;
