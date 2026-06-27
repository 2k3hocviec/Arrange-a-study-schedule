const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`;
};

const configuredApiUrl = process.env.REACT_APP_API_URL;
const isPlaceholderApiUrl =
  configuredApiUrl === "https://your-backend-url.onrender.com";

export const API_URL = (
  configuredApiUrl && !isPlaceholderApiUrl ? configuredApiUrl : getDefaultApiUrl()
).replace(/\/$/, "");
