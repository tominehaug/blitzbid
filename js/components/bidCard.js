import { formatDate } from "../utils/formatDate.js";

export function renderBidCard(bid, container) {
  const card = document.createElement("div");
  card.className = "flex flex-row justify-between h-20 w-90 bg-brand-200 p-2";

  const avatar = document.createElement("img");
  if (bid.bidder?.avatar?.url) {
    avatar.src = bid.bidder.avatar.url;
  }
  avatar.alt = bid.bidder?.avatar?.alt;

  const details = document.createElement("div");
  details.className = "flex flex-col items-end justify-end p-1";

  const amount = document.createElement("p");
  amount.className = "text-3xl font-heading";
  amount.textContent = `€${bid.amount}`;

  const date = document.createElement("p");
  date.className = "font-default";
  date.textContent = formatDate(bid.created);

  details.append(amount);
  details.append(date);
  card.append(avatar);
  card.append(details);
  container.appendChild(card);
}

export function renderWinningCard(bid, container) {
  const card = document.createElement("div");
  card.className =
    "flex flex-row justify-between h-20 w-90 bg-brand-200 p-2 border-brand-500 border-2";

  const avatar = document.createElement("img");
  if (bid.bidder?.avatar?.url) {
    avatar.src = bid.bidder.avatar.url;
  }
  avatar.alt = bid.bidder?.avatar?.alt;

  const details = document.createElement("div");
  details.className = "flex flex-col items-end justify-end p-1";

  const amount = document.createElement("p");
  amount.className = "text-4xl font-heading text-brand-500";
  amount.textContent = `€${bid.amount}`;

  const date = document.createElement("p");
  date.className = "font-default";
  date.textContent = formatDate(bid.created);

  details.append(amount);
  details.append(date);
  card.append(avatar);
  card.append(details);
  container.appendChild(card);
}
