import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { renderCard } from "../components/card.js";
import { get, getMock } from "../services/apiClient.js";

const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const main = document.querySelector("main");

const loggedInProfile = JSON.parse(localStorage.getItem("profile"));
const loggedInUsername = loggedInProfile?.name;
const isOwnProfile =
  loggedInUsername?.toLowerCase() === username?.toLowerCase();

const myListingsTab = document.getElementById("my-listings");
const myBidsTab = document.getElementById("my-bids");
const myCreditsTab = document.getElementById("credits");
const tabContent = document.getElementById("tab-content");

let profile;
let mockEndpoint = true;
let listingsByProfile = [];
let bidsByUser = [];

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
  try {
    if (mockEndpoint) {
      const response = await getMock("../../mock_endpoint/data.json");
      listingsByProfile = response.data.filter(
        (listing) => listing.seller.name === username,
      );
    } else {
      const response = await get(
        `/auction/profiles/${username}/listings?_bids=true`,
      );
      listingsByProfile = response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

async function fetchBidsByUser() {
  try {
    if (mockEndpoint) {
      const response = await getMock("../../mock_endpoint/data.json");
      bidsByUser = response.data.filter((listing) =>
        listing.bids.some((bid) => bid.bidder.name === username),
      );
    } else {
      const response = await get(
        `/auction/profiles/${username}/bids?_listings=true`,
      );
      const listings = response.data.map((bid) => bid.listing);
      bidsByUser = listings.filter(
        (listing, index) =>
          listings.findIndex((l) => l.id === listing.id) === index,
      );
    }
  } catch (error) {
    console.log(error);
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

function renderListings(listings, emptyMessage) {
  if (listings.length === 0) {
    const message = document.createElement("p");
    message.textContent = emptyMessage;
    tabContent.appendChild(message);
    return;
  }
  listings.forEach((listing) => renderCard(listing, tabContent));
}

function renderTab(tab) {
  myListingsTab.classList.remove(
    "border-b-4",
    "border-black",
    "pb-1",
    "cursor-pointer",
  );
  myBidsTab.classList.remove(
    "border-b-4",
    "border-black",
    "pb-1",
    "cursor-pointer",
  );
  myCreditsTab.classList.remove(
    "border-b-4",
    "border-black",
    "pb-1",
    "cursor-pointer",
  );
  tab.classList.add("border-b-4", "border-black", "pb-1", "cursor-pointer");

  tabContent.innerHTML = "";

  if (tab === myListingsTab) {
    renderListings(listingsByProfile, "No listings yet.");
    tabContent.className = "md:flex md:flex-row md:flex-wrap";
  } else if (tab === myBidsTab) {
    renderListings(bidsByUser, "No bids yet.");
    tabContent.className = "md:flex md:flex-row md:flex-wrap";
  } else {
    tabContent.className =
      "flex-1 flex flex-col items-center justify-center text-center gap-2";
    tabContent.innerHTML = `
              <h2 class="font-heading text-2xl">Your credits</h2>
              <p class="text-lg font-default">Your current score is: <span class="text-2xl font-heading text-brand-500">€${profile.credits}</span></p>
              <label for="credit"></label>
                <input id="credit" class="text-2xl focus:border-brand-500 font-heading w-80 self-center border border-gray-400 bg-white p-3 focus:border-2 focus:ring-0 focus:outline-none" type="number" max="5000" >
                <button id="load-btn" type="submit" class="border-2 border-brand-500 mt-4 border-dashed font-heading text-2xl cursor-pointer uppercase px-4 py-2">Load</button>
            `;
  }
}

function lockTabs() {
  myBidsTab.disabled = true;
  myCreditsTab.disabled = true;

  myBidsTab.classList.remove(
    "hover:border-b-4",
    "hover:border-black",
    "hover:pb-1",
    "hover:cursor-pointer",
  );
  myCreditsTab.classList.remove(
    "hover:border-b-4",
    "hover:border-black",
    "hover:pb-1",
    "hover:cursor-pointer",
  );

  myBidsTab.classList.add("text-gray-400", "cursor-not-allowed");
  myCreditsTab.classList.add("text-gray-400", "cursor-not-allowed");
}

myListingsTab.addEventListener("click", () => {
  renderTab(myListingsTab);
});

myBidsTab.addEventListener("click", () => {
  renderTab(myBidsTab);
});

myCreditsTab.addEventListener("click", () => {
  renderTab(myCreditsTab);
});

async function init() {
  renderHeader();
  renderFooter();

  await fetchUser();
  if (!profile) return;

  if (isOwnProfile) {
    document.getElementById("edit-profile").classList.remove("!hidden");
    document.getElementById("new-listing").classList.remove("hidden");
  }

  await fetchListingsByProfile();

  if (isOwnProfile) {
    await fetchBidsByUser();
  } else {
    lockTabs();
  }

  renderTab(myListingsTab);
}

init();
