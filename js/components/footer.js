export function renderFooter() {
  const footer = document.querySelector("footer");
  if (!footer) {
    console.error("Footer element not found");
    return;
  }

  footer.innerHTML = `
      <h3 class="font-styled mt-2 mb-4 text-2xl">
        <span class="font-styled-special text-4xl">Just</span> in case
        <span class="font-styled-special text-4xl">!</span>
      </h3>
      <div class="mb-4 text-right">
        <h4 class="mb-2 inline-block w-38 border-2 border-dashed p-1">
          Sell With Us
        </h4>
        <ul>
          <li><a href="notavailable.html">Selling Guide</a></li>
          <li>
            <a href="notavailable.html">Fees and Pricing</a>
          </li>
        </ul>
      </div>
      <div class="mb-4 text-left">
        <h4 class="mb-2 inline-block w-38 border-2 border-dashed p-1">
          Support and Legal
        </h4>
        <ul>
          <li><a href="notavailable.html">Contact Us</a></li>
          <li><a href="notavailable.html">Shipping and Returns</a></li>
          <li><a href="notavailable.html">Terms and Conditions</a></li>
        </ul>
      </div>
      <div class="mb-4 text-right">
        <h4 class="mb-2 inline-block w-38 border-2 border-dashed p-1">
          Socials
        </h4>
        <ul>
          <li><a href="notavailable.html">Facebook</a></li>
          <li><a href="notavailable.html">Instagram</a></li>
        </ul>
      </div>
    `;
}
