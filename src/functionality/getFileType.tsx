const getFileType = (filePath: any) => {
  // Define lists of common image and video file extensions
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp",
  ];
  const videoExtensions = [
    ".mp4",
    ".mov",
    ".wmv",
    ".flv",
    ".avi",
    ".avchd",
    ".mkv",
    ".webm",
    ".mpeg",
    ".mpg",
  ];

  // Check if filePath ends with any of the extensions
  const isImage = imageExtensions.some((extension) =>
    filePath.toLowerCase().endsWith(extension)
  );
  const isVideo = videoExtensions.some((extension) =>
    filePath.toLowerCase().endsWith(extension)
  );

  if (isImage) {
    return "image";
  } else if (isVideo) {
    return "video";
  } else {
    return "unknown"; // If the file type is not recognized
  }
};
export default getFileType;
