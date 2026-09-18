import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { get, getMock } from "../services/apiClient.js";

const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const main = document.querySelector("main");

let profile;

async function fetchUser() {
  const mockResponse = await getMock("../../mock_endpoint/profiles.json");
  profile = mockResponse?.data?.find((profile) => profile.name === username);

  if (!profile) {
    try {
      const response = await get(`/auction/profiles/${username}`);
      profile = response?.data;
    } catch (error) {
      console.error(error);
    }
  }

  if (profile) {
    renderProfile(profile);
  } else {
    main.innerHTML = "Could not find profile.";
  }
}

function renderProfile(profile) {
  const banner = document.getElementById("profile-banner");
  banner.src = profile.banner?.url;
  banner.alt = profile.banner?.alt;

  const avatar = document.getElementById("profile-img");
  avatar.src = profile.avatar?.url;
  avatar.alt = profile.avatar?.alt;

  const name = document.getElementById("profile-name");
  name.textContent = profile.name;

  const bio = document.getElementById("profile-bio");
  bio.textContent = profile.bio;
}

fetchUser();
renderHeader();
renderFooter();
