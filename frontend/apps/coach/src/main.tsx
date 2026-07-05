import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Button, Shell } from "@quantomfit/ui";

function App() {
  return (
    <Shell title="Coach Panel">
      <section className="qf-card">
        <h2>پنل مربی</h2>
        <p>
          برای برنامه‌های تمرینی، پیگیری شاگردها، گزارش‌ها و ارتباط مربی با باشگاه ساخته می‌شود.
        </p>
        <div className="qf-actions">
          <Button>شاگردها</Button>
          <Button variant="secondary">برنامه‌ها</Button>
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
