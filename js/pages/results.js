import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { getMock, get } from "../services/apiClient.js";
import { renderCard } from "../components/card.js";

const params = new URLSearchParams(window.location.search);
const searchTerm = params.get("q");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");

let allListings = [];

async function fetchAllListings() {
  const mockResponse = await getMock("../../mock_endpoint/data.json");
  const mockListings = mockResponse.data;

  const apiResponse = await get("/auction/listings?_bids=true&_seller=true");
  const apiListings = apiResponse.data;

  const allListings = [...mockListings, ...apiListings];

  return allListings;
}

function renderResults(filteredListings) {
  resultsDiv.innerHTML = "";
  if (filteredListings.length === 0) {
    const message = document.createElement("p");
    message.classList.add("text-lg", "text-gray-500", "py-10", "px-4");
    message.textContent = "No listings match your search.";
    resultsDiv.appendChild(message);
    return;
  }
  filteredListings.forEach((listing) => {
    renderCard(listing, resultsDiv);
  });
}

function conveySearch(term) {
  const filteredListings = allListings.filter((listing) => {
    const titleMatch = listing.title.toLowerCase().includes(term);
    const tagsMatch = listing.tags.some((tag) =>
      tag.toLowerCase().includes(term),
    );
    return titleMatch || tagsMatch;
  });

  renderResults(filteredListings);
}

async function init() {
  allListings = await fetchAllListings();

  if (searchTerm) {
    searchInput.value = searchTerm;
    conveySearch(searchTerm);
  } else {
    renderResults(allListings);
  }

  renderHeader();
  renderFooter();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newSearchTerm = searchInput.value.toLowerCase().trim();
  if (!newSearchTerm) return;
  const params = new URLSearchParams({ q: newSearchTerm });
  window.location.href = `results.html?${params.toString()}`;
});

init();
