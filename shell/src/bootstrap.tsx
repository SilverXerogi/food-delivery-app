import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { initAuth } from "./store/persist";
import { startAuthListener } from "./store/persistListener";
import App from "./App";

initAuth();
startAuthListener();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);