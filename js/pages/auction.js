import { get, getMock } from "../services/apiClient.js";
import { showPopup } from "../services/ui-messages.js";
import { renderBidCard, renderWinningCard } from "../components/bidCard.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

let listing;
const main = document.querySelector("main");

async function fetchListing() {
  const mockResponse = await getMock("../../mock_endpoint/data.json");
  listing = mockResponse?.data?.find((listing) => listing.id === postId);

  if (!listing) {
    try {
      const data = await get(
        `/auction/listings/${postId}?_seller=true&_bids=true`,
      );
      const listing = data.data;
      renderEditForm(listing);
    } catch (error) {
      console.log(error);
      showPopup(
        "border-error",
        "Could not load the listing. Check your connection and try again.",
        [
          {
            text: "Try again",
            class: "confirm",
            action: () => {
              hidePopup();
              fetchListing();
            },
          },
          {
            text: "Go back",
            class: "cancel",
            action: () => history.back(),
          },
        ],
      );
    }
  }

  if (listing) {
    renderAuction(listing);
  } else {
    main.innerHTML = "Could not find listing.";
  }
}

function renderAuction(listing) {
  const media = document.getElementById("auction-media");
  media.src = listing.media?.[0]?.url;
  media.alt = listing.media?.[0]?.alt;

  const title = document.getElementById("title");
  title.textContent = listing.title;

  const sellerName = document.getElementById("seller-name");
  sellerName.textContent = listing.seller.name;

  const sellerImg = document.getElementById("seller-img");
  sellerImg.src = listing.seller.avatar?.url;
  sellerImg.alt = listing.seller.avatar?.alt;

  const description = document.getElementById("description");
  description.textContent = listing.description;

  const tagContainer = document.getElementById("tag-container");
  tagContainer.innerHTML = "";

  const tags = listing.tags ?? [];

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

  const bids = listing.bids ?? [];
  const bidList = document.getElementById("bid-list");
  bidList.innerHTML = "";

  if (bids.length === 0) {
    bidList.innerHTML = "";
    bidList.textContent = "No bids yet.";
    return;
  }

  const highest = bids.reduce((top, bid) =>
    bid.amount > top.amount ? bid : top,
  );

  renderWinningCard(highest, bidList);

  bids
    .filter((bid) => bid !== highest)
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .forEach((bid) => renderBidCard(bid, bidList));
}

async function init() {
  await fetchListing();
  renderHeader();
  renderFooter();
}

init();
