import { getMock } from "../services/apiClient.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

let allAuctions = [];
const tagContainer = document.getElementById("tag-container");

// Fetching and displaying random categories

function getRandomTags(auctions) {
  const allTags = auctions.flatMap((auction) => auction.tags ?? []);
  const uniqueTags = [
    ...new Set(allTags.map((tag) => tag.toLowerCase().trim())),
  ];

  const shuffled = [...uniqueTags];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 5);
}

function displayCategories(auctions) {
  tagContainer.innerHTML = "";

  const tags = getRandomTags(auctions);

  tags.forEach((tag) => {
    const searchTerm = tag.toLowerCase().trim();
    if (!searchTerm) return;

    const params = new URLSearchParams({ q: searchTerm });

    const tagLink = document.createElement("a");
    tagLink.textContent = tag;
    tagLink.href = `results.html?${params.toString()}`;
    tagLink.className = "border-2 p-1";
    tagContainer.appendChild(tagLink);
  });
}

const shuffleBtn = document.getElementById("shuffle-categories");
shuffleBtn.addEventListener("click", () => {
  tagContainer.innerHTML = "";
  displayCategories(allAuctions);
});

// Fetching and displaying highlights in thumbnail carousels

async function fetchMock() {
  try {
    const mockResponse = await getMock("../../mock_endpoint/data.json");
    allAuctions = mockResponse.data;
  } catch (error) {
    console.log(error);
  }
  return allAuctions;
}

// MUCH OF THE FOLLOWING CODE IS BORROWED FROM w3schools.com !

function createCarousel(highlights, container) {
  let slideIndex = 1;
  const slideContainer = container.querySelector(".js-slides-container");

  highlights.forEach((highlight) => {
    const link = document.createElement("a");
    link.href = `${basePath}/auction.html?id=${highlight.id}`;
    link.classList.add("js-link-wrap");

    const figure = document.createElement("figure");

    const slideImg = document.createElement("img");
    slideImg.src = highlight.media[0].url;
    slideImg.alt = highlight.media[0].alt;
    slideImg.classList.add("aspect-square", "w-full", "object-cover");

    const title = document.createElement("figcaption");
    title.textContent = highlight.title;
    title.classList.add("bg-white", "p-2");

    figure.appendChild(slideImg);
    figure.appendChild(title);
    link.appendChild(figure);
    slideContainer.appendChild(link);
  });

  function handleSlides(n) {
    slideIndex = n;
    let i;
    let slides = container.getElementsByClassName("js-link-wrap");
    let dots = container.getElementsByClassName("js-dot");
    if (n > slides.length) {
      slideIndex = 1;
    }
    if (n < 1) {
      slideIndex = slides.length;
    }
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.add("hidden");
    }

    slides[slideIndex - 1].classList.remove("hidden");

    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("bg-gray-700", "bg-gray-400");

      if (i === slideIndex - 1) {
        dots[i].classList.add("bg-gray-700");
      } else {
        dots[i].classList.add("bg-gray-400");
      }
    }
  }

  function plusSlides(n) {
    handleSlides(slideIndex + n);
  }

  function currentSlide(n) {
    handleSlides(n);
  }

  container.querySelector(".js-prev").addEventListener("click", () => {
    plusSlides(-1);
  });

  container.querySelector(".js-next").addEventListener("click", () => {
    plusSlides(1);
  });

  container.querySelectorAll(".js-dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide(index + 1);
    });
  });

  handleSlides(slideIndex);
}

// END OF BORROWED CODE

function displayPopular(auctions) {
  const popularCarousel = document.getElementById("popular-carousel");
  const popular = [...auctions]
    .sort((a, b) => b._count.bids - a._count.bids)
    .slice(0, 4);

  createCarousel(popular, popularCarousel);
}

function displayRecent(auctions) {
  const recentCarousel = document.getElementById("recent-carousel");
  const recent = [...auctions]
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .slice(0, 3);

  createCarousel(recent, recentCarousel);
}

function displayEnding(auctions) {
  const endingCarousel = document.getElementById("ending-carousel");
  const ending = [...auctions]
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
    .slice(0, 3);

  createCarousel(ending, endingCarousel);
}

// search bar logic

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) return;
  const params = new URLSearchParams({ q: searchTerm });
  window.location.href = `results.html?${params.toString()}`;
});

// init

async function init() {
  allAuctions = await fetchMock();

  renderHeader();
  renderFooter();
  displayCategories(allAuctions);
  displayPopular(allAuctions);
  displayRecent(allAuctions);
  displayEnding(allAuctions);
}

init();
