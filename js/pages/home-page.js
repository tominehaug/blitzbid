import { get } from "../services/apiClient.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
