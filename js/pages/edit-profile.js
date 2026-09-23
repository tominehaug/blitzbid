import { get, put } from "../services/apiClient.js";
import { renderHeader } from "../components/header.js";
import { hidePopup, showPopup, showSuccess } from "../services/ui-messages.js";
import { validateForm } from "../utils/validation.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const editForm = document.getElementById("edit-profile-form");

const profile = JSON.parse(localStorage.getItem("profile"));
const username = profile.name;

// GET REQUEST AND DISPLAY

async function fetchProfile() {
  let profile;
  try {
    const data = await get(`/auction/profiles/${username}`);
    profile = data.data;
  } catch (error) {
    console.log(error);
    showPopup(
      "border-error",
      "Could not load your profile. Check your connection and try again.",
      [
        {
          text: "Try again",
          class: "confirm",
          action: () => {
            hidePopup();
            fetchListing();
          },
        },
        {
          text: "Go back",
          class: "cancel",
          action: () => history.back(),
        },
      ],
    );
  }
  renderEditForm(profile);
}

function renderEditForm(profile) {
  document.getElementById("name").value = profile.name ?? "";
  document.getElementById("banner").value = profile.banner?.url ?? "";
  document.getElementById("banner-alt").value = profile.banner?.alt ?? "";
  document.getElementById("avatar").value = profile.avatar?.url ?? "";
  document.getElementById("avatar-alt").value = profile.avatar?.alt ?? "";
  document.getElementById("bio").value = profile.bio ?? "";
}

// PUT REQUEST

async function updateProfile(form) {
  const formData = new FormData(form);
  const bannerUrl = formData.get("banner")?.trim();
  const bannerAlt = formData.get("banner-alt")?.trim();

  const avatarUrl = formData.get("banner")?.trim();
  const avatarAlt = formData.get("banner-alt")?.trim();

  const bio = formData.get("bio");

  const body = {
    bio: bio ?? "",
    banner:
      {
        url: bannerUrl || "",
        alt: bannerAlt || "",
      } ?? {},
    avatar: {
      url: avatarUrl || "",
      alt: avatarAlt || "",
    },
  };

  const submitBtn = document.getElementById("update-profile");
  submitBtn.disabled = true;

  try {
    await put(`/auction/profiles/${username}`, body);
    showSuccess("Changes were saved!");
    if (username) {
      window.location.href = `${basePath}/profile.html?user=${username}`;
    } else {
      window.location.href = `${basePath}/index.html`;
    }
  } catch (error) {
    showPopup("border-error", error.message || "Save failed.", [
      {
        text: "Try again",
        class: "confirm",
        action: () => {
          hidePopup();
        },
      },
      {
        text: "Back to profile",
        class: "cancel",
        action: () => {
          window.location.href = `${basePath}/profile.html?user=${username}`;
        },
      },
    ]);
  } finally {
    submitBtn.disabled = false;
  }
}

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = validateForm(editForm);

  if (!isValid) return;

  await updateProfile(editForm);
});

async function init() {
  if (!localStorage.getItem("accessToken")) {
    window.location.href = `${basePath}/login.html`;
    return;
  }
  renderHeader();
  await fetchProfile();
}

init();
