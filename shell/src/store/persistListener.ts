import { store } from "./store";

export const startAuthListener = () => {
  store.subscribe(() => {
    const state = store.getState().auth;

    if (state.user && state.accessToken) {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
        })
      );
    } else {
      localStorage.removeItem("auth");
    }
  });
};