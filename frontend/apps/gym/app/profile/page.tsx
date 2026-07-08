export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پروفایل</span>
        <h1>پروفایل عمومی باشگاه و تنظیمات برند.</h1>
        <p>در ادامه می‌توان پروفایل عمومی باشگاه را با برند، امکانات و ساعات کاری کامل کرد.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">برند</span><h3>لوگو و کاور</h3><p>بعداً تصویرهای عمومی را بارگذاری کن.</p></article>
        <article><span className="status">امکانات</span><h3>آمکانات رفاهی</h3><p>رختکن، کافه، پارکینگ و موارد دیگر را نمایش بده.</p></article>
        <article><span className="status">ساعات</span><h3>زمان کاری</h3><p>ساعت‌های باز و بسته شدن را برای بازدیدکننده نشان بده.</p></article>
      </div>
    </section>
  );
}
