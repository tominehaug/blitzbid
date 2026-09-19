import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { get, getMock } from "../services/apiClient.js";

const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const main = document.querySelector("main");

let profile;
let mockEndpoint = true;
let listingsByProfile = {};
let bidsByProfile = {};

async function fetchUser() {
  const mockResponse = await getMock("../../mock_endpoint/profiles.json");
  profile = mockResponse?.data?.find((profile) => profile.name === username);

  if (!profile) {
    mockEndpoint = false;
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

async function fetchListingsByProfile() {
  if (!mockEndpoint) {
    try {
      const response = await getMock();
      const mockListingsByProfile = response.data;
      listingsByProfile = mockListingsByProfile;
    } catch (error) {
      console.log(error);
    }
  } else {
    const response = await get(`/auction/profiles/${username}/listings`);
    const apiListingsByProfile = response.data;
    listingsByProfile = apiListingsByProfile;
  }
  return listingsByProfile;
}

async function fetchBidsByUser() {
  if (!mockEndpoint) {
    try {
      const response = await getMock();
      const mockBidsByProfile = response.data;
      bidsByProfile = mockBidsByProfile;
    } catch (error) {
      console.log(error);
    }
  } else {
    const apiBidsByProfile = await get(`/auction/profiles/${username}/bids`);
    apiBidsByProfile = response.data;
    bidsByProfile = apiBidsByProfile;
  }
  return bidsByProfile;
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

const myListingsTab = document.getElementById("my-listings");
const myBidsTab = document.getElementById("my-bids");
const myCreditsTab = document.getElementById("credits");
const tabContent = document.getElementById("tab-content");

function renderTab(tab, content) {
  tabContent.innerHTML = "";
  myListingsTab.classList.remove("underline");
  myBidsTab.classList.remove("underline");
  myCreditsTab.classList.remove("underline");

  tab.classlist.add("underline");

  listings;
}

function calculateCredits() {}

myListingsTab.addEventListener("click", () => {
  renderTab(myListingsTab);
});

myBidsTab.addEventListener("click", () => {
  renderTab(myBidsTab);
});

myCreditsTab.addEventListener("click", () => {
  renderTab(myCreditsTab);
});

fetchUser();
renderHeader();
renderFooter();
