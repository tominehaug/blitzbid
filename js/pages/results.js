import { renderFooter } from "../components/footer";
import { renderHeader } from "../components/header";
import { getMock, get } from "../services/apiClient";

const params = new URLSearchParams(window.location.search);
const searchTerm = params.get("q");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

let allListings = [];

if (searchTerm) {
  searchInput.value = searchTerm;
  conveySearch(searchTerm);
}

async function fetchAllListings() {
  const mockResponse = await getMock("../../mock_endpoint/data.json");
  const mockListings = mockResponse.data;

  const apiResponse = await get("/auction/listings");
  const apiListings = apiResponse.data;

  const allListings = [...mockListings, ...apiListings];

  return allListings;
}

async function init() {
  allListings = await fetchAllListings();
  renderResults(allListings);
  renderHeader();
  renderFooter();
}

init();

function conveySearch(term) {
  const filteredListings = allListings.filter((listing) => {
    const nameMatch = listing.name.toLowerCase().includes(term);
    const tagsMatch = listing.tags.some((tag) =>
      tag.toLowerCase().includes(term),
    );
    return nameMatch || tagsMatch;
  });

  renderResults(filteredListings);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) return;
  const params = new URLSearchParams({ q: searchTerm });
  window.location.href = `results.html?${params.toString()}`;
});
