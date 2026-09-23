import { renderHeader } from "../components/header.js";
import { post } from "../services/apiClient.js";
import { showPopup, showSuccess, hidePopup } from "../services/ui-messages.js";
import { validateForm } from "../utils/validation.js";
import { parseTags } from "../utils/parseTags.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const loggedInProfile = JSON.parse(localStorage.getItem("profile"));
const username = loggedInProfile?.name;

const createForm = document.getElementById("create-form");
const mediaContainer = document.getElementById("media-container");
const addMediaBtn = document.getElementById("add-media-row");

async function uploadListing(form) {
  const formData = new FormData(form);
  const urls = formData.getAll("media-url").map((u) => u.trim());
  const alts = formData.getAll("media-alt").map((a) => a.trim());

  const media = urls
    .map((url, index) => ({ url, alt: alts[index] || "" }))
    .filter((item) => item.url);

  const description = formData.get("description");

  const tags = formData.get("tags");
  const tagList = parseTags(tags);

  const deadline = formData.get("deadline");
  const endsAt = new Date(deadline).toISOString();

  const body = {
    title: formData.get("title"),
    endsAt: endsAt,
  };
  if (media.length) {
    body.media = media;
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
          window.location.href = `${basePath}/index.html`;
        },
      },
    ]);
  } finally {
    submitBtn.disabled = false;
  }
}

function createMediaRow() {
  const row = document.createElement("div");
  row.classList.add("media-row");

  row.innerHTML = `
    <input
      type="url"
      name="media-url"
      class="media-url-input focus:border-brand-500 font-default w-80 self-center border border-gray-400 bg-white p-3 focus:border-2 focus:ring-0 focus:outline-none"
      placeholder="URL"
    />
    <input
      type="text"
      name="media-alt"
      class="media-alt-input focus:border-brand-500 font-default w-80 self-center border border-gray-400 bg-white p-3 mt-4 focus:border-2 focus:ring-0 focus:outline-none"
      placeholder="ALT"
    />
    <button
      type="button"
      class="remove-media-row text-error font-default underline my-2"
    >
      -Remove image
    </button>
  `;

  return row;
}

addMediaBtn.addEventListener("click", () => {
  const newRow = createMediaRow();
  mediaContainer.appendChild(newRow);
});

mediaContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-media-row")) {
    event.target.closest(".media-row").remove();
  }
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = validateForm(createForm);

  if (!isValid) return;

  await uploadListing(createForm);
});

function init() {
  if (!localStorage.getItem("accessToken")) {
    window.location.href = `${basePath}/login.html`;
    return;
  }
  renderHeader();
}

init();
