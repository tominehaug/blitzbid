import { get, post, getMock } from "../services/apiClient.js";
import { showPopup, hidePopup, showSuccess } from "../services/ui-messages.js";
import { renderBidCard, renderWinningCard } from "../components/bidCard.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { formatDate } from "../utils/formatDate.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

let listing;
const main = document.querySelector("main");
const bidForm = document.getElementById("bid-form");

async function fetchListing() {
  const mockResponse = await getMock("../../mock_endpoint/data.json");
  listing = mockResponse?.data?.find((listing) => listing.id === listingId);

  if (!listing) {
    try {
      const data = await get(
        `${basePath}/auction/listings/${listingId}?_seller=true&_bids=true`,
      );
      listing = data.data;
      renderAuction(listing);
    } catch (error) {
      console.log(error);
      showPopup(
        "border-error",
        "Could not load the listing. Check your connection and try again.",
        [
          {
            text: "Try again",
            class: "confirm",
            onClick: () => {
              hidePopup();
              fetchListing();
            },
          },
          {
            text: "Go back",
            class: "cancel",
            onClick: () => history.back(),
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
  const placeholderImage = {
    url: `${basePath}/assets/placeholder-img.png`,
    alt: "No image available",
  };
  const media = listing.media?.length ? listing.media : [placeholderImage];

  const mainImg = document.getElementById("auction-media");
  mainImg.src = listing.media?.[0]?.url;
  mainImg.alt = listing.media?.[0]?.alt || "";

  const thumbnailContainer = document.getElementById("media-thumbnails");
  thumbnailContainer.innerHTML = "";

  if (media.length > 1) {
    media.forEach((item, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = item.url;
      thumbnail.alt = item.alt || `${listing.title} image ${index + 1}`;
      thumbnail.className =
        "w-16 h-16 object-cover cursor-pointer border-2 border-transparent shrink-0";
      if (index === 0) thumbnail.classList.add("border-brand-500");

      thumbnail.addEventListener("click", () => {
        mainImg.src = item.url;
        mainImg.alt = item.alt || "";

        thumbnailContainer
          .querySelectorAll("img")
          .forEach((thumb) => thumb.classList.remove("border-brand-500"));
        thumbnail.classList.add("border-brand-500");
      });

      thumbnailContainer.appendChild(thumbnail);
    });
  }

  const title = document.getElementById("title");
  title.textContent = listing.title;

  const sellerLink = document.getElementById("seller-link");
  sellerLink.href = `${basePath}/profile.html?user=${listing.seller.name}`;

  const sellerName = document.getElementById("seller-name");
  sellerName.textContent = listing.seller.name;

  const sellerImg = document.getElementById("seller-img");
  sellerImg.src = listing.seller.avatar?.url;
  sellerImg.alt = listing.seller.avatar?.alt;
  sellerImg.className = "h-auto rounded-full object-cover w-20";

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

  const deadline = document.getElementById("deadline");
  deadline.textContent = "Ends: " + formatDate(listing.endsAt);

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

async function updateCredits(amount) {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const username = profile?.name;
  if (!username) {
    showPopup("border-error", "You must be logged in to place bid.", [
      {
        text: "Log in",
        class: "confirm",
        onClick: () => {
          window.location.href = `${basePath}/login.html`;
        },
      },
      {
        text: "OK",
        class: "cancel",
        onClick: () => {
          hidePopup();
        },
      },
    ]);
    return false;
  }

  const bidAmount = Number(amount);
  const bids = listing.bids ?? [];
  const highestBid = bids.length
    ? bids.reduce((top, bid) => (bid.amount > top.amount ? bid : top))
    : null;

  if (highestBid && bidAmount <= highestBid.amount) {
    showPopup(
      "border-error",
      `Your bid must be higher than the current highest bid of €${highestBid.amount}.`,
      [
        {
          text: "OK",
          class: "cancel",
          onClick: () => hidePopup(),
        },
      ],
    );
    return false;
  }

  const profileData = await get(`${basePath}/auction/profiles/${username}`);
  const currentCredits = profileData.data.credits;

  if (currentCredits < bidAmount) {
    showPopup("border-error", "Your credit score is too low.", [
      {
        text: "OK",
        class: "cancel",
        onClick: () => {
          hidePopup();
        },
      },
    ]);
    return false;
  }

  try {
    const response = await post(
      `${basePath}/auction/listings/${listingId}/bids`,
      { amount: bidAmount },
    );

    listing = response.data ?? listing;
    renderAuction(listing);
    return true;
  } catch (error) {
    console.log(error);
    showPopup("border-error", error.message || "Could not place your bid.", [
      {
        text: "Try again",
        class: "confirm",
        onClick: () => {
          hidePopup();
          updateCredits(amount);
        },
      },
      {
        text: "Cancel",
        class: "cancel",
        onClick: () => {
          hidePopup();
        },
      },
    ]);
    return false;
  }
}

bidForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bidForm);
  const bidAmount = Number(formData.get("bid"));
  if (!bidAmount) {
    showPopup("border-error", "Please place amount.", [
      {
        text: "OK",
        class: "cancel",
        onClick: () => {
          hidePopup();
        },
      },
    ]);
  }
  if (bidAmount)
    showPopup(
      "border-brand-500",
      `Are you sure you want to bid €${bidAmount}?`,
      [
        {
          text: "Yes",
          class: "confirm",
          onClick: async () => {
            const success = await updateCredits(bidAmount);
            if (success) {
              showSuccess("Bid placed successfully!");
              window.location.reload();
            }
          },
        },
        {
          text: "No",
          class: "warning",
          onClick: () => {
            hidePopup();
          },
        },
      ],
    );
});

async function init() {
  await fetchListing();
  renderHeader();
  renderFooter();
}

init();
