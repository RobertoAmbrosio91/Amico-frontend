import React from "react";
import { View, Button, StyleSheet, Alert, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

const CHUNK_SIZE = 10 * 1024 * 1024; // 5 MB, used for chunking file uploads

const FileUpload = () => {
  const uploadFileInChunks = async (uri: any, fileSize: any) => {
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    let signedUrls = [];
    let uploadId;
    let parts = [];

    try {
      const response = await fetch(
        "https://4e05-154-27-22-81.ngrok-free.app/start-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName: uri.split("/").pop(), fileSize }),
        }
      );
      const jsonResponse = await response.json();
      console.log("Server response:", jsonResponse);

      if (!jsonResponse || !jsonResponse.signedUrls || !jsonResponse.uploadId) {
        throw new Error("Invalid server response");
      }

      signedUrls = jsonResponse.signedUrls;
      uploadId = jsonResponse.uploadId;
    } catch (error: any) {
      console.error("Failed to start the upload:", error);
      Alert.alert("Error", "Failed to start the upload: " + error.message);
      return;
    }

    try {
      let position = 0;
      console.log(totalChunks);
      for (let i = 0; i < totalChunks; i++) {
        const chunkSize = Math.min(CHUNK_SIZE, fileSize - position);
        const blob = await fetch(uri, {
          headers: { Range: `bytes=${position}-${position + chunkSize - 1}` },
        }).then((res) => res.blob());
        console.log("blob", blob);
        const uploadResponse = await fetch(signedUrls[i], {
          method: "PUT",
          body: blob,
        });
        console.log("resp", uploadResponse);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text(); // To get the raw response body
          console.error(
            `Upload failed for chunk ${i}: Status ${uploadResponse.status}`,
            errorText
          );
          throw new Error(`Upload failed for chunk ${i}: ${errorText}`);
        }
        console.log(`Chunk ${i + 1} uploaded successfully`);

        const eTag = uploadResponse.headers.get("ETag");
        parts.push({ PartNumber: i + 1, ETag: eTag.replace(/"/g, "") });

        position += chunkSize;
      }
    } catch (error: any) {
      console.error("Error uploading file chunks:", error);
      Alert.alert("Error", "Failed to upload file chunks: " + error.message);
      return;
    }

    try {
      console.log("Calling complete-upload endpoint");
      const completeResponse = await fetch(
        "https://4e05-154-27-22-81.ngrok-free.app/complete-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uploadId,
            parts,
            fileName: uri.split("/").pop(),
          }),
        }
      );

      if (!completeResponse.ok) {
        throw new Error(
          `Failed to complete upload: Status ${completeResponse.status}`
        );
      }

      Alert.alert("Upload complete");
      console.log("Upload completed successfully");
    } catch (error: any) {
      console.error("Failed to complete the upload:", error);
      Alert.alert("Error", "Failed to complete the upload: " + error.message);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        base64: false,
      });

      if (result?.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        const fileSize = result.assets[0].fileSize || 0;
        await uploadFileInChunks(selectedUri, fileSize);
      } else {
        Alert.alert("No file selected");
      }
    } catch (error: any) {
      console.error("Error selecting file:", error);
      Alert.alert("Error", "Failed to select file: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select File" onPress={handleSelectFile} />
      <Text>Check console for detailed logs.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FileUpload;
