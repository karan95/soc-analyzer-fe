export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  // Calculate which index of 'sizes' to use
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Return the value formatted to 1 decimal place + the unit
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
