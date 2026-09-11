import { getMock } from "../services/apiClient.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

// Fetching and displaying highlights in thumbnail carousels

const mockResponse = await getMock("../../mock_endpoint/data.json");
const mockAuctions = mockResponse.data;

// MUCH OF THE FOLLOWING CODE IS BORROWED FROM w3schools.com !

function createCarousel(highlights, container) {
  let slideIndex = 1;
  const slideContainer = container.querySelector(".js-slides-container");

  highlights.forEach((highlight) => {
    const link = document.createElement("a");
    link.href = `${basePath}/auction.html?id=${highlight.id}`;
    link.classList.add("js-link-wrap");

    const slideImg = document.createElement("img");
    slideImg.src = highlight.media[0].url;
    slideImg.alt = highlight.media[0].alt;

    const titleDiv = document.createElement("div");
    titleDiv.textContent = highlight.title;

    link.appendChild(titleDiv);
    link.appendChild(slideImg);
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
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("bg-gray-700", "bg-gray-400");

      if (i === slideIndex - 1) {
        dots[i].classList.add("bg-gray-700");
      } else {
        dots[i].classList.add("bg-gray-400");
      }
    }
    slides[slideIndex - 1].style.display = "block";
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

// init

renderHeader();
renderFooter();
displayPopular(mockAuctions);
displayRecent(mockAuctions);
displayEnding(mockAuctions);
