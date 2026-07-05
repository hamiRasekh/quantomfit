import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Button, Shell } from "@quantomfit/ui";

function App() {
  return (
    <Shell title="Club Panel">
      <section className="qf-card">
        <h2>پنل باشگاه</h2>
        <p>
          برای مدیریت باشگاه، اعضا، اشتراک‌ها، سانس‌ها و عملیات داخلی باشگاه طراحی می‌شود.
        </p>
        <div className="qf-actions">
          <Button>اعضا</Button>
          <Button variant="secondary">اشتراک‌ها</Button>
        </div>
      </section>
    </Shell>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
