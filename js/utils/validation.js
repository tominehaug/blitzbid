export function validateForm(form) {
  let isValid = true;

  const inputs = Array.from(form.querySelectorAll("input, textarea"));

  inputs.forEach((input) => {
    const errorDiv = input.nextElementSibling;
    const requiredDomain = "@stud.noroff.no";

    if (input.type === "email" && input.value) {
      const email = input.value.trim().toLowerCase();
      if (!email.endsWith(requiredDomain)) {
        input.setCustomValidity(`Email must end with ${requiredDomain}`);
      }
    }

    if (!input.checkValidity()) {
      errorDiv.textContent = input.validationMessage;
      input.classList.add("invalid");
      isValid = false;
    } else {
      errorDiv.textContent = "";
      input.classList.remove("invalid");
    }
  });

  return isValid;
}
