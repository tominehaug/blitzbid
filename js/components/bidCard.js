import { formatDate } from "../utils/formatDate.js";

export function renderBidCard(bid, container) {
  const card = document.createElement("div");
  card.className = "flex flex-row justify-between h-20 bg-brand-200 p-2";

  const profileLink = document.createElement("a");
  profileLink.href = `profile.html?user=${bid.bidder.name}`;
  profileLink.className = "h-full shrink-0";

  const avatar = document.createElement("img");
  if (bid.bidder?.avatar?.url) {
    avatar.src = bid.bidder.avatar.url;
  }
  avatar.alt = bid.bidder?.avatar?.alt;
  avatar.className = "h-full aspect-square object-cover rounded-full";

  const details = document.createElement("div");
  details.className = "flex flex-col items-end justify-end p-1";

  const amount = document.createElement("p");
  amount.className = "text-3xl font-heading";
  amount.textContent = `€${bid.amount}`;

  const date = document.createElement("p");
  date.className = "font-default";
  date.textContent = formatDate(bid.created);

  details.appendChild(amount);
  details.appendChild(date);
  profileLink.appendChild(avatar);
  card.appendChild(profileLink);
  card.appendChild(details);
  container.appendChild(card);
}

export function renderWinningCard(bid, container) {
  const card = document.createElement("div");
  card.className =
    "flex flex-row justify-between h-20 bg-brand-200 p-2 border-brand-500 border-2";

  const profileLink = document.createElement("a");
  profileLink.href = `profile.html?user=${bid.bidder.name}`;
  profileLink.className = "h-full shrink-0";

  const avatar = document.createElement("img");
  if (bid.bidder?.avatar?.url) {
    avatar.src = bid.bidder.avatar.url;
  }
  avatar.alt = bid.bidder?.avatar?.alt;
  avatar.className = "h-full aspect-square object-cover rounded-full";

  const details = document.createElement("div");
  details.className = "flex flex-col items-end justify-end p-1";

  const amount = document.createElement("p");
  amount.className = "text-4xl font-heading text-brand-500";
  amount.textContent = `€${bid.amount}`;

  const date = document.createElement("p");
  date.className = "font-default";
  date.textContent = formatDate(bid.created);

  details.appendChild(amount);
  details.appendChild(date);
  profileLink.appendChild(avatar);
  card.appendChild(profileLink);
  card.appendChild(details);
  container.appendChild(card);
}
