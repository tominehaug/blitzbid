import { formatDate } from "../utils/formatDate.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const profile = JSON.parse(localStorage.getItem("profile"));

export function renderCard(auction, container) {
  if (!auction.bids) {
    console.warn("Listing missing 'bids':", auction);
  }

  const highestBid = auction.bids?.length
    ? Math.max(...auction.bids.map((bid) => bid.amount))
    : 0;

  const endsAt = formatDate(auction.endsAt);

  const cardWrapper = document.createElement("a");
  cardWrapper.classList.add(
    "font-heading",
    "relative",
    "mx-4",
    "my-2",
    "flex",
    "w-90",
    "flex-col",
    "items-center",
    "justify-center",
    "overflow-hidden",
    "bg-white",
  );
  cardWrapper.href = `${basePath}/auction.html?id=${auction.id}`;

  const thumbnail = document.createElement("img");
  thumbnail.src = auction.media[0]?.url || "../../assets/placeholder-img.png";
  thumbnail.alt = auction.media[0]?.alt || "No image uploaded";
  thumbnail.classList.add("h-70", "w-full", "object-cover");
  thumbnail.addEventListener("error", () => {
    thumbnail.src = "../../assets/placeholder-img.png";
    thumbnail.alt = "Image unavailable";
  });

  const details = document.createElement("div");
  details.classList.add("p-5");

  const title = document.createElement("h2");
  title.classList.add("text-2xl");
  title.textContent = auction.title;

  const price = document.createElement("p");
  price.classList.add("text-brand-500", "text-2xl");

  const amount = document.createElement("span");
  amount.classList.add("text-5xl", "text-black");
  amount.textContent = `€${highestBid}`;

  price.append(amount, " (highest bid)");

  const deadline = document.createElement("p");
  deadline.classList.add("mt-2", "border-t", "border-gray-400", "text-xl");
  deadline.textContent = `Deadline: ${endsAt}`;

  details.appendChild(title);
  details.appendChild(price);
  details.appendChild(deadline);
  cardWrapper.appendChild(thumbnail);
  cardWrapper.appendChild(details);

  if (auction.seller.name === profile?.name) {
    const editIcon = document.createElement("i");
    editIcon.classList.add(
      "fa-solid",
      "fa-pen-to-square",
      "absolute",
      "top-2",
      "right-2",
      "text-3xl",
    );
    cardWrapper.appendChild(editIcon);
  }

  container.appendChild(cardWrapper);
}
