const popup = document.getElementById("popup");
const backdrop = document.getElementById("popup-backdrop");
const messageDiv = document.getElementById("popup-message");
const actionsDiv = document.getElementById("popup-actions");

// function that adds type, message and actions, removes .hidden, shows popup
export function showPopup(type, message, actions = []) {
  popup.classList.remove("warning-popup", "confirm-popup", "error-popup");

  popup.classList.add(type);

  messageDiv.innerHTML = "";
  messageDiv.textContent = message;

  actionsDiv.innerHTML = "";
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.textContent = action.text;
    button.className = action.class;

    if (action.href) {
      button.addEventListener("click", () => {
        window.location.href = action.href;
      });
    }

    if (action.onClick) {
      button.addEventListener("click", action.onClick);
    }

    actionsDiv.appendChild(button);
  });

  popup.classList.remove("hidden");
  backdrop.classList.remove("hidden");
}
// function that adds .hidden, closes popup
export function hidePopup() {
  popup.classList.add("hidden");
  backdrop.classList.add("hidden");
}
// helper function for success messages
export function showSuccess(message, timeout = 3000) {
  showPopup("confirm-popup", message);
  return new Promise((resolve) => {
    setTimeout(() => {
      hidePopup();
      resolve();
    }, timeout);
  });
}
