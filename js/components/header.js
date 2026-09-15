import { logoutUser } from "../services/authService.js";
import { showPopup, hidePopup } from "../services/ui-messages.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const profile = JSON.parse(localStorage.getItem("profile"));
const username = profile.name;

export function renderHeader() {
  const header = document.querySelector("header");

  if (!header) {
    console.error("Header element not found");
    return;
  }

  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");
  const profile = JSON.parse(localStorage.getItem("profile"));
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
        <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <a href="${basePath}/login.html"><i class="fa-solid fa-right-to-bracket text-5xl"></i></a>
    `;
  } else if (path.includes("profile.html") && user === profile?.name) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
        <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <button id="logout"><i class="fa-solid fa-arrow-right-from-bracket text-5xl"></i></button>
    `;

    const logoutBtn = document.getElementById("logout");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        showPopup("warning-popup", "Are you sure you want to logout?", [
          {
            text: "Yes",
            class: "confirmation-button",
            onClick: () => {
              logoutUser();
            },
          },
          {
            text: "Back",
            class: "warning-button",
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
      <a href="${basePath}/profile.html?user=${username}"><i class="fa-solid fa-circle-user text-5xl"></i></a>
    `;
  }
}
