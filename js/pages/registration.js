import { validateForm } from "../utils/validation.js";
import { post } from "../services/apiClient.js";
import { showPopup, showSuccess } from "../services/ui-messages.js";

const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

const registrationForm = document.getElementById("registration-form");

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isValid = validateForm(registrationForm);
  const isMatching = checkMatchingPwd();

  if (!isValid || !isMatching) return;

  await handleRegistration();
});

function checkMatchingPwd() {
  const password = registrationForm.elements.password.value;
  const confirm = registrationForm.elements["confirm-password"].value;
  const confirmErrorDiv =
    registrationForm.elements["confirm-password"].nextElementSibling;

  if (password !== confirm) {
    confirmErrorDiv.textContent = "Passwords don't match";
    return false;
  }
  confirmErrorDiv.textContent = "";
  return true;
}

async function handleRegistration() {
  // collect registration data
  const formData = new FormData(registrationForm);
  const body = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    bio: formData.get("bio") || "",
    avatar: {
      url: formData.get("avatar") || "",
      alt: "profile image",
    },
  };
  // send request
  try {
    await post("/auth/register", body);
    showSuccess("Registration was successful!");
    window.location.href = `${basePath}/login.html`;
  } catch (error) {
    showPopup("error-message", error.message || "Registration failed", [
      {
        text: "Try again",
        class: "confirm-button",
        action: () => {
          hidePopup();
        },
      },
      {
        text: "Go back home",
        class: "warning-button",
        action: () => {
          window.location.href = `${basePath}/index.html`;
        },
      },
    ]);
  }
}
