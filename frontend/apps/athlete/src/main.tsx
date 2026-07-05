import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Button, Shell } from "@quantomfit/ui";

function App() {
  return (
    <Shell title="Athlete Panel">
      <section className="qf-card">
        <h2>پنل ورزشکار / کاربر</h2>
        <p>
          این پنل تجربه اصلی ورزشکار یا کاربر نهایی را پوشش می‌دهد: ثبت‌نام، برنامه، پیشرفت و ارتباط با مربی.
        </p>
        <div className="qf-actions">
          <Button>برنامه من</Button>
          <Button variant="secondary">پیشرفت</Button>
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
