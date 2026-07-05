import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Button, Shell } from "@quantomfit/ui";

function App() {
  return (
    <Shell title="Admin Panel">
      <section className="qf-card">
        <h2>پنل مدیریت</h2>
        <p>
          این پنل نقطه شروع مدیریت کل پلتفرم است و بعداً به ماژول‌های کاربران، نقش‌ها، تنظیمات، گزارش‌ها و لاگ‌ها وصل می‌شود.
        </p>
        <div className="qf-actions">
          <Button>مشاهده داشبورد</Button>
          <Button variant="secondary">تنظیمات</Button>
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
