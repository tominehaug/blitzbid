export function validateForm(form) {
  let isValid = true;

  const inputs = Array.from(form.querySelectorAll("input"));

  inputs.forEach((input) => {
    const errorDiv = input.nextElementSibling;

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
