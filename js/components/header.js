import { logoutUser } from "../services/authService.js";
import { showPopup, hidePopup } from "../services/ui-messages.js";
import { get } from "../services/apiClient.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

async function fetchCredits() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const username = profile?.name;
  if (!username) return "-";
  try {
    const profileInfo = await get(`${basePath}/auction/profiles/${username}`);
    return profileInfo.data.credits ?? "-";
  } catch {
    showPopup(
      "border-error",
      "Could not fetch credits. Try reloading the page.",
      [
        {
          text: "OK",
          class: "cancel",
          onClick: () => {
            hidePopup();
          },
        },
      ],
    );
    return "-";
  }
}

export async function renderHeader() {
  const header = document.querySelector("header");

  if (!header) {
    console.error("Header element not found");
    return;
  }

  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const viewedUser = params.get("user");
  const profile = JSON.parse(localStorage.getItem("profile"));
  const loggedInUser = profile?.name;
  const accessToken = localStorage.getItem("accessToken");

  const credits = await fetchCredits();

  if (!accessToken) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
        <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <div class="flex flex-row gap-2 items-center justify-center">       
      <span
        class="bg-brand-200 border-2 border-brand-500 font-heading inline-block rounded-lg pt-1 pb-1 pl-3 pr-3 text-2xl shrink-0" id="credits"
      >€ ${credits}</span>
      <a href="${basePath}/login.html"><i class="fa-solid fa-right-to-bracket text-4xl cursor-pointer"></i></a>
      </div>
    `;
  } else if (path.includes("profile.html") && loggedInUser === viewedUser) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
        <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <div class="flex flex-row gap-2 items-center justify-center">       
      <span
        class="bg-brand-200 border-2 border-brand-500 font-heading inline-block rounded-lg pt-1 pb-1 pl-3 pr-3 text-2xl shrink-0" id="credits"
      >€ ${credits}</span>
      <button id="logout"><i class="fa-solid fa-arrow-right-from-bracket text-4xl cursor-pointer"></i></button>
      </div>
    `;

    const logoutBtn = document.getElementById("logout");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        showPopup("border-brand-500", "Are you sure you want to logout?", [
          {
            text: "Yes",
            class: "confirm",
            onClick: () => {
              logoutUser();
            },
          },
          {
            text: "Back",
            class: "cancel",
            onClick: () => {
              hidePopup();
            },
          },
        ]);
      });
    }
  } else {
    header.innerHTML = `
      <a href="${basePath}/index.html">
        <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <div class="flex flex-row gap-2 items-center justify-center">       
      <span
        class="bg-brand-200 border-2 border-brand-500 font-heading inline-block rounded-lg pt-1 pb-1 pl-3 pr-3 text-2xl shrink-0" id="credits"
      >€ ${credits}</span>
      <a href="${basePath}/profile.html?user=${loggedInUser}"><i class="fa-solid fa-circle-user text-4xl cursor-pointer"></i></a>
      </div>
    `;
  }
}
