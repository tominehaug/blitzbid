import { post } from "./apiClient.js";

const LOGIN_ENDPOINT = "/auth/login";
const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

export async function loginUser(credentials) {
  const response = await post(LOGIN_ENDPOINT, credentials);
  const { accessToken, ...profile } = response.data;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("profile", JSON.stringify(profile));
    return profile;
  }
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("profile");

  window.location.href = `${basePath}/index.html`;
}
