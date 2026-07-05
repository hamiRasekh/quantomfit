export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Profile</span>
        <h1>Public gym profile and brand settings.</h1>
        <p>Prepare the public-facing gym profile with brand, facilities, and working hours later.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Brand</span><h3>Logo and cover</h3><p>Upload public images later.</p></article>
        <article><span className="status">Facilities</span><h3>Amenities</h3><p>Show locker rooms, cafe, parking, and more.</p></article>
        <article><span className="status">Hours</span><h3>Working time</h3><p>Display open and close times to visitors.</p></article>
      </div>
    </section>
  );
}
