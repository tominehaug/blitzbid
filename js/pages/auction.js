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
  mockListing = mockResponse?.data?.find((item) => item.id === listingId);

  if (mockListing) {
    listing = { ...mockListing, isMock: true };
  }

  if (!listing) {
    try {
      const data = await get(
        `/auction/listings/${listingId}?_seller=true&_bids=true`,
      );
      listing = data.data;
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
    restrictBidState(listing);
  } else {
    main.innerHTML = "Could not find listing.";
  }
}

function restrictBidState(listing) {
  if (!listing.isMock) return;

  bidForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
    classList.add("grayscale", "opacity-70", "pointer-events-none");
  });

  const warning = document.getElementById("mock-restriction");
  warning.innerHTML = `
    This is an example listing, so bids can't be placed on it.
    <a href="${basePath}/auction.html?id=a3f9b993-50b2-49e2-83e5-f482edf50897" class="underline">Check out a real listing</a>
    or use the search bar and browse other listings.
  `;
}

function renderBids(listing) {
  const bids = listing.bids ?? [];
  const bidList = document.getElementById("bid-list");
  const loadMoreBtn = document.getElementById("load-more-bids");
  bidList.innerHTML = "";

  if (bids.length === 0) {
    bidList.textContent = "No bids yet.";
    loadMoreBtn.classList.add("hidden");
    return;
  }

  const highest = bids.reduce((top, bid) =>
    bid.amount > top.amount ? bid : top,
  );

  renderWinningCard(highest, bidList);

  const otherBids = bids
    .filter((bid) => bid !== highest)
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  otherBids.slice(0, visibleBids).forEach((bid) => renderBidCard(bid, bidList));

  if (otherBids.length > visibleBids) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
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
}

async function placeBid(amount) {
  if (listing.isMock) {
    showPopup("border-error", "Bids can't be placed on example listings.", [
      { text: "OK", class: "cancel", onClick: () => hidePopup() },
    ]);
    return false;
  }

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

  if (listing.seller?.name === username) {
    showPopup("border-error", "You can't bid on your own listing.", [
      { text: "OK", class: "cancel", onClick: () => hidePopup() },
    ]);
    return false;
  }

  if (new Date(listing.endsAt) <= new Date()) {
    showPopup("border-error", "This auction has already ended.", [
      { text: "OK", class: "cancel", onClick: () => hidePopup() },
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

  let currentCredits;

  try {
    const profileData = await get(`/auction/profiles/${username}`);
    currentCredits = profileData.data.credits;
  } catch (error) {
    console.log(error);
    showPopup("border-error", "Trouble fetching your credit score.", [
      {
        text: "Try again",
        class: "confirm",
        onClick: () => {
          hidePopup();
          placeBid(amount);
        },
      },
      {
        text: "Cancel",
        class: "cancel",
        onClick: () => hidePopup(),
      },
    ]);
    return false;
  }

  if (currentCredits < bidAmount) {
    showPopup("border-error", "Your credit score is too low.", [
      { text: "OK", class: "cancel", onClick: () => hidePopup() },
    ]);
    return false;
  }

  try {
    const response = await post(`/auction/listings/${listingId}/bids`, {
      amount: bidAmount,
    });

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
          placeBid(amount);
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

document.getElementById("load-more-bids").addEventListener("click", () => {
  visibleBids += BIDS_PER_PAGE;
  renderBids(listing);
});

bidForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bidForm);
  const bidAmount = Number(formData.get("bid"));
  if (isNaN(bidAmount) || bidAmount <= 0) {
    showPopup("border-error", "Please enter a valid amount.", [
      { text: "OK", class: "cancel", onClick: () => hidePopup() },
    ]);
    return;
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
            const success = await placeBid(bidAmount);
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
