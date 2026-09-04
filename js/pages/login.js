import { validateForm } from "../utils/validation.js";
import { loginUser } from "../services/authService.js";
import { showPopup, showSuccess } from "../services/ui-messages.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = validateForm(loginForm);

  if (!isValid) return;

  await handleLogin();
});

async function handleLogin() {
  // collect login data
  const formData = new FormData(loginForm);
  const body = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  // save credentials
  try {
    await loginUser(body);
    showSuccess("Login was successful!");
    window.location.href = `${basePath}/index.html`;
  } catch (error) {
    showPopup("error-popup", error.message || "Login failed", [
      {
        text: "Try again",
        class: "warning-button",
        onClick: () => {
          window.location.reload();
        },
      },
      {
        text: "Go back home",
        class: "warning-button",
        onClick: () => {
          window.location.href = `${basePath}/index.html`;
        },
      },
    ]);
  }
}
