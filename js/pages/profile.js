import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { renderCard } from "../components/card.js";
import { get, getMock } from "../services/apiClient.js";

const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const main = document.querySelector("main");

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
    if (!mockEndpoint) {
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
  myListingsTab.classList.remove("underline");
  myBidsTab.classList.remove("underline");
  myCreditsTab.classList.remove("underline");
  tab.classList.add("underline");

  tabContent.innerHTML = "";

  if (tab === myListingsTab) {
    renderListings(listingsByProfile, "No listings yet.");
    tabContent.classlist.add("md:flex", "md:flex-row", "md:flex-wrap");
  } else if (tab === myBidsTab) {
    renderListings(listingsBidOn, "No bids yet.");
    tabContent.classlist.add("md:flex", "md:flex-row", "md:flex-wrap");
  } else {
    const loadCredits = document.createElement("div");
    loadCredits.innerHTML = `<div class="flex-1 flex flex-col items-center justify-center text-center gap-2">
              <h2 class="font-heading text-2xl">Your credits</h2>
              <p class="text-lg font-default">Your current score is: <span class="text-2xl font-heading text-brand-500">€${profile.credits}</span></p>
              <label for="load-credit"></label>
                <input id="credit" class="focus:border-brand-500 font-default w-80 self-center border border-gray-400 bg-white p-3 focus:border-2 focus:ring-0 focus:outline-none" type="number" maxlength="4" class="font-heading text-2xl">
                <button id="load-btn" type="submit" class="border-2 border-brand-500 mt-4 border-dashed font-heading text-2xl cursor uppercase px-4 py-2">Load</button>
            </div>`;
    tabContent.appendChild(credits);
  }
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

  await fetchListingsByProfile();
  await fetchBidsByUser();

  renderTab(myListingsTab);
}

init();
