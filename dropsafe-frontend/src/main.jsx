import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./context/UserContext.jsx";
import App from "./App.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="383615030405-pljs4u532tsurkmhi4ahiavnffltj2sv.apps.googleusercontent.com">
      <UserProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);