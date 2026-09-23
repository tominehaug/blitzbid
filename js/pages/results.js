import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { getMock, get } from "../services/apiClient.js";
import { renderCard } from "../components/card.js";

const PAGE_LIMIT = 4;
let currentPage = 1;
let pageCount = 1;
let isLastPage = false;
let isFirstPage = false;

const params = new URLSearchParams(window.location.search);
const searchTerm = params.get("q");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const paginationNav = document.getElementById("pagination");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

async function searchMockListings(term) {
  const mockResponse = await getMock("../../mock_endpoint/data.json");
  const mockListings = mockResponse.data;

  const mockResults = mockListings.filter((listing) => {
    const titleMatch = listing.title.toLowerCase().includes(term);
    const tagsMatch = listing.tags.some((tag) =>
      tag.toLowerCase().includes(term),
    );
    return titleMatch || tagsMatch;
  });
  return mockResults;
}

async function searchApiListings(term, page = 1) {
  const apiResponse = await get(
    `/auction/listings/search?q=${term}&_bids=true&_seller=true&page=${page}&limit=${PAGE_LIMIT}`,
  );

  return {
    filteredListings: apiResponse.data,
    meta: apiResponse.meta,
  };
}

function renderResults(mockResults, apiResults) {
  resultsDiv.innerHTML = "";

  if (
    mockResults.length === 0 &&
    apiResults.length === 0 &&
    currentPage === 1
  ) {
    const message = document.createElement("p");
    message.classList.add("text-lg", "text-gray-500", "py-10", "px-4");
    message.textContent = "No listings match your search.";
    resultsDiv.appendChild(message);
    return;
  } else if (mockResults.length === 0 && apiResults.length === 0) {
    const message = document.createElement("p");
    message.classList.add("text-lg", "text-gray-500", "py-10", "px-4");
    message.textContent = "No listings on this page.";
    resultsDiv.appendChild(message);
    return;
  }

  if (currentPage === 1) {
    mockResults?.forEach((listing) => {
      renderCard(listing, resultsDiv);
    });
  }
  apiResults?.forEach((listing) => {
    renderCard(listing, resultsDiv);
  });
}

function renderPagination() {
  if (pageCount <= 1) {
    paginationNav.classList.add("hidden");
    return;
  }

  paginationNav.classList.remove("hidden");

  if (isFirstPage) {
    prevBtn.classList.add("hidden");
  } else {
    prevBtn.classList.remove("hidden");
  }

  if (isLastPage) {
    nextBtn.classList.add("hidden");
  } else {
    nextBtn.classList.remove("hidden");
  }

  pageInfo.textContent = `0${currentPage}/0${pageCount}`;
}

async function goToPage(page) {
  const apiSearch = await searchApiListings(searchTerm, page);

  currentPage = apiSearch.meta.currentPage;
  pageCount = apiSearch.meta.pageCount;
  isFirstPage = apiSearch.meta.isFirstPage;
  isLastPage = apiSearch.meta.isLastPage;
  console.log({ currentPage, pageCount, isFirstPage, isLastPage });

  renderResults([], apiSearch.filteredListings);
  renderPagination();
}

prevBtn.addEventListener("click", () => {
  if (isFirstPage) return;
  goToPage(currentPage - 1);
});

nextBtn.addEventListener("click", () => {
  if (isLastPage) return;
  goToPage(currentPage + 1);
});

async function init() {
  renderHeader();
  renderFooter();

  if (searchTerm) {
    searchInput.value = searchTerm;
  }
  const mockResults = await searchMockListings(searchTerm);
  const apiSearch = await searchApiListings(searchTerm);

  const apiResults = apiSearch.filteredListings;
  currentPage = apiSearch.meta.currentPage;
  pageCount = apiSearch.meta.pageCount;
  isFirstPage = apiSearch.meta.isFirstPage;
  isLastPage = apiSearch.meta.isLastPage;
  console.log({ currentPage, pageCount, isFirstPage, isLastPage });

  renderResults(mockResults, apiResults);
  renderPagination();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newSearchTerm = searchInput.value.toLowerCase().trim();
  if (!newSearchTerm) return;
  const params = new URLSearchParams({ q: newSearchTerm });
  window.location.href = `results.html?${params.toString()}`;
});

init();
