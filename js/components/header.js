import { logoutUser } from "../services/authService.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

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

  if (!user) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
          <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <i class="fa-solid fa-right-to-bracket"></i>`;
  } else if (path.includes("profile.html") && user === profile?.name) {
    header.innerHTML = `
      <a href="${basePath}/index.html">
          <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <i class="fa-solid fa-arrow-right-from-bracket" id="logout"></i>`;
    // log out user
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutUser);
    }
  } else {
    header.innerHTML = `
      <a href="${basePath}/index.html">
          <img src="${basePath}/assets/logo.svg" alt="BlitzBid logo" width="180" height="72"/>
      </a>
      <i class="fa-solid fa-circle-user"></i>`;
  }
}
