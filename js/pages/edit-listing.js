import { get, put, del } from "../services/apiClient.js";
import { hidePopup, showPopup, showSuccess } from "../services/ui-messages.js";
import { validateForm } from "../utils/validation.js";
import { renderHeader } from "../components/header.js";
import { parseTags } from "../utils/parseTags.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const loggedInProfile = JSON.parse(localStorage.getItem("profile"));
const username = loggedInProfile?.name;

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const editForm = document.getElementById("edit-listing-form");
const mediaContainer = document.getElementById("media-container");
const addMediaBtn = document.getElementById("add-media-row");

function toDateTimeLocal(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

// DISPLAY CONTENTS

async function fetchListing() {
  let listing;
  try {
    const data = await get(`/auction/listings/${postId}`);
    listing = data.data;
  } catch (error) {
    console.log(error);
    showPopup(
      "border-error",
      "Could not load the listing. Check your connection and try again.",
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
  renderEditForm(listing);
}

function renderEditForm(listing) {
  mediaContainer.innerHTML = "";

  const media = listing.media?.length ? listing.media : [];

  if (media.length === 0) {
    mediaContainer.appendChild(createMediaRow());
  } else {
    media.forEach((item) => {
      mediaContainer.appendChild(createMediaRow(item.url, item.alt));
    });
  }
  document.getElementById("title").value = listing.title || "";
  document.getElementById("description").value = listing.description || "";
  document.getElementById("deadline").value =
    toDateTimeLocal(listing.endsAt) || "";
  document.getElementById("tags").value = (listing.tags ?? []).join(", ");
}

function createMediaRow(url = "", alt = "") {
  const row = document.createElement("div");
  row.classList.add("media-row");

  row.innerHTML = `
    <input
      type="url"
      name="media-url"
      class="media-url-input focus:border-brand-500 font-default w-80 self-center border border-gray-400 bg-white p-3 focus:border-2 focus:ring-0 focus:outline-none"
      placeholder="URL"
      value=${url}
    />
    <input
      type="text"
      name="media-alt"
      class="media-alt-input focus:border-brand-500 font-default w-80 self-center border border-gray-400 bg-white p-3 mt-4 focus:border-2 focus:ring-0 focus:outline-none"
      placeholder="ALT"
      value=${alt}
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

// PUT REQUEST

async function updateListing(form) {
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
    tags: tagList,
  };

  if (media.length) {
    body.media = media;
  }

  if (description) {
    body.description = description;
  }

  const submitBtn = document.getElementById("post-listing");
  submitBtn.disabled = true;

  try {
    await put(`/auction/listings/${postId}`, body);
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

// DELETE REQUEST

const deleteBtn = document.getElementById("delete-btn");

deleteBtn.addEventListener("click", () =>
  showPopup("border-warning", "Are you sure you want to delete this listing?", [
    {
      text: "Yes",
      class: "warning",
      action: async () => {
        try {
          await deleteListing();
          showSuccess("Listing is deleted.");
          if (username) {
            window.location.href = `${basePath}/profile.html?user=${username}`;
          } else {
            window.location.href = `${basePath}/index.html`;
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
    {
      text: "No",
      class: "confirm",
      action: () => {
        hidePopup();
      },
    },
  ]),
);

async function deleteListing() {
  try {
    await del(`/auction/listings/${postId}`);
  } catch (error) {
    showPopup(
      "border-error",
      error.message || "Could not delete post. Try again later.",
      [
        {
          text: "Return",
          class: "confirm",
          action: () => {
            if (username) {
              window.location.href = `${basePath}/profile.html?user=${username}`;
            } else {
              window.location.href = `${basePath}/index.html`;
            }
          },
        },
      ],
    );
  }
}

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = validateForm(editForm);

  if (!isValid) return;

  await updateListing(editForm);
});

async function init() {
  if (!localStorage.getItem("accessToken")) {
    window.location.href = `${basePath}/login.html`;
    return;
  }
  renderHeader();
  await fetchListing();
}

init();
