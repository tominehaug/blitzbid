const basePath = window.location.hostname.includes("github.io")
  ? "/blitzbid"
  : "";

export function renderFooter() {
  const footer = document.querySelector("footer");
  if (!footer) {
    console.error("Footer element not found");
    return;
  }

  footer.innerHTML = `
      <h3>Just in case!</h3>
      <div>
      <h4>Sell With Us</h4>
      <ul>
        <li><a href="notavailable.html">Selling Guide</a></li>
        <li>
          <a href="notavailable.html">Fees and Pricing</a>
        </li>
      </ul>
      </div>
      <div>
      <h4>Support and Legal</h4>
      <ul>
        <li><a href="notavailable.html">Contact Us</a></li>
        <li><a href="notavailable.html">Shipping and Returns</a></li>
        <li><a href="notavailable.html">Terms and Conditions</a></li>
      </ul>
      </div>
      <div>
      <h4>Socials</h4>
      <ul>
        <li><a href="notavailable.html">Facebook</a></li>
        <li><a href="notavailable.html">Instagram</a></li>
      </ul>
      </div>
    `;
}
