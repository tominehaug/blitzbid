import { renderHeader } from "../components/header.js";
import { post } from "../services/apiClient.js";
import { showPopup, showSuccess, hidePopup } from "../services/ui-messages.js";
import { validateForm } from "../utils/validation.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const loggedInProfile = JSON.parse(localStorage.getItem("profile"));
const username = loggedInProfile?.name;

const createForm = document.getElementById("create-form");

function parseTags(value) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "");

  return [...new Set(tags)];
}

async function uploadListing(form) {
  const formData = new FormData(form);
  const url = formData.get("img-url")?.trim();
  const alt = formData.get("img-alt")?.trim();

  const description = formData.get("description");

  const tags = formData.get("tags");
  const tagList = parseTags(tags);

  const deadline = formData.get("deadline");
  const endsAt = new Date(deadline).toISOString();

  const body = {
    title: formData.get("title"),
    endsAt: endsAt,
  };

  if (url) {
    body.media = [
      {
        url,
        alt: alt || "",
      },
    ];
  }

  if (tagList.length) {
    body.tags = tagList;
  }

  if (description) {
    body.description = description;
  }

  const submitBtn = document.getElementById("post-listing");
  submitBtn.disabled = true;

  try {
    await post("/auction/listings", body);
    showSuccess("Upload was successful!");
    if (username) {
      window.location.href = `${basePath}/profile.html?user=${username}`;
    } else {
      window.location.href = `${basePath}/index.html`;
    }
  } catch (error) {
    showPopup("border-error", error.message || "Upload failed", [
      {
        text: "Try again",
        class: "confirm",
        action: () => {
          hidePopup();
        },
      },
      {
        text: "Go back home",
        class: "cancel",
        action: () => {
          console.log("clicked try again");
          window.location.href = `${basePath}/index.html`;
        },
      },
    ]);
  } finally {
    submitBtn.disabled = false;
  }
}

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = validateForm(createForm);

  if (!isValid) return;

  await uploadListing(createForm);
});

renderHeader();
