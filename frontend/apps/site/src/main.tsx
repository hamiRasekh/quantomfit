import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Button, Shell } from "@quantomfit/ui";

function App() {
  return (
    <Shell title="Public Site">
      <section className="qf-card">
        <h2>سایت اصلی</h2>
        <p>
          این وب‌سایت عمومی برای معرفی محصول، جذب کاربر و مسیرهای ورود به پنل‌های مختلف طراحی می‌شود.
        </p>
        <div className="qf-actions">
          <Button>شروع کنید</Button>
          <Button variant="secondary">درباره ما</Button>
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
