import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./styles.css";

function preventBrowserZoom(event) {
  const isZoomKey =
    event.ctrlKey &&
    (event.key === "+" || event.key === "-" || event.key === "=" || event.key === "0");

  if (isZoomKey) {
    event.preventDefault();
  }
}

function preventWheelZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}

function preventMultiTouchZoom(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}

window.addEventListener("keydown", preventBrowserZoom, { passive: false });
window.addEventListener("wheel", preventWheelZoom, { passive: false });
document.addEventListener("touchmove", preventMultiTouchZoom, { passive: false });

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
