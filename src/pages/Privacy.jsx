import { Link } from "react-router-dom";
import "../css/hub.css";
import NavBar from "../components/hub/NavBar";
import SiteFooter from "../components/hub/SiteFooter";

const EMAIL = "olkraussgo@gmail.com";

export default function Privacy() {
  return (
    <div className="hub">
      <NavBar />
      <main className="hub-section hub-section--tight">
        <p className="hub-eyebrow">Privacy</p>
        <h1 className="hub-heading">Privacy Policy</h1>
        <p className="hub-policy-updated">Last updated: October 1, 2026</p>

        <p className="hub-lede">
          This is a personal portfolio. Data collection is kept minimal and
          privacy-first.
        </p>

        <h2 className="hub-policy-h2">What is collected</h2>
        <ul className="hub-policy-list">
          <li>
            Cookieless, aggregate analytics (via Vercel Web Analytics): page
            views, the page you arrived from (referrer), approximate location
            at the country/region level, and your device, browser, and screen
            size. It is anonymous and aggregated, no cookies, no
            fingerprinting, and never tied to your identity.
          </li>
        </ul>

        <h2 className="hub-policy-h2">What is not collected</h2>
        <ul className="hub-policy-list">
          <li>No tracking or advertising cookies.</li>
          <li>No precise (GPS) location.</li>
          <li>
            No names, accounts, or contact details, unless you choose to email
            me.
          </li>
          <li>Nothing is ever sold or shared for advertising.</li>
        </ul>

        <h2 className="hub-policy-h2">Third parties</h2>
        <ul className="hub-policy-list">
          <li>Vercel: hosting and the cookieless analytics above.</li>
          <li>
            Google Fonts: fonts are served by Google, which may receive your IP
            address while delivering them.
          </li>
        </ul>

        <h2 className="hub-policy-h2">Your choices and rights</h2>
        <p className="hub-lede">
          You can block analytics with any content blocker or a Do-Not-Track /
          Global Privacy Control signal. Under GDPR and CCPA you may ask what
          aggregate data exists or request that it stop. Email{" "}
          <a className="hub-policy-link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>

        <h2 className="hub-policy-h2">Contact</h2>
        <p className="hub-lede">
          Questions about this policy:{" "}
          <a className="hub-policy-link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>

        <p className="hub-policy-back">
          <Link to="/">Back to the site</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
