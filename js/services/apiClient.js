import { ApiError } from "./errors.js";

const BASE_URL = "https://v2.api.noroff.dev";

async function apiClient(endpoint, options = {}) {
  const { body, ...customOptions } = options;

  const accessToken = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    "X-Noroff-API-Key": "2bde75d8-9f1b-47c2-9a2a-9aeb4314b744",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customOptions,
    headers: {
      ...headers,
      ...customOptions.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(BASE_URL + endpoint, config);
    const contentType = response.headers.get("content-type");

    if (
      response.status === 204 ||
      !contentType ||
      !contentType.includes("application/json")
    ) {
      if (!response.ok) {
        throw new ApiError(`HTTP Error: ${response.status}`, response.status);
      }
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
      const message =
        responseData.errors?.[0]?.message || `HTTP Error: ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("A network or client error occurred.");
  }
}

export const get = (endpoint) => apiClient(endpoint);
export const post = (endpoint, body) => apiClient(endpoint, { body });
export const put = (endpoint, body) =>
  apiClient(endpoint, { method: "PUT", body });
export const del = (endpoint) => apiClient(endpoint, { method: "DELETE" });
