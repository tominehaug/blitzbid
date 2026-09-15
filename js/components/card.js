import { formatDate } from "../utils/formatDate";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const profile = JSON.parse(localStorage.getItem("profile"));

export function renderCard(auction, container) {
  const highestBid = auction.bids.length
    ? Math.max(...auction.bids.map((bid) => bid.amount))
    : 0;

  const endsAt = formatDate(auction.endsAt);

  const cardWrapper = document.createElement("a");
  cardWrapper.classList.add(
    "font-heading",
    "bg-white",
    "relative",
    "w-20",
    "overflow-hidden",
  );
  cardWrapper.href = `${basePath}/auction.html?id=${auction.id}`;

  const thumbnail = document.createElement("img");
  thumbnail.src = auction.media[0].url;
  thumbnail.alt = auction.media[0].alt;
  thumbnail.classList.add("h-50", "w-full", "object-cover");

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
  deadline.classList.add("text-error");
  deadline.textContent = `Deadline: ${endsAt}`;

  details.appendChild(title, price, deadline);
  cardWrapper.appendChild(thumbnail);

  if (auction.seller.name === profile?.name) {
    const editIcon = document.createElement("i");
    editIcon.classList.add(
      "fa-solid",
      "fa-pen-to-square",
      "absolute",
      "top-1",
      "right-1",
    );
    cardWrapper.appendChild(editIcon);
  }

  container.appendChild(cardWrapper);
}
