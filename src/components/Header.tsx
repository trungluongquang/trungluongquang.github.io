import { useState } from "react";
import { pushEvent } from "../lib/analytics";

export function Header() {
  const [query, setQuery] = useState("");

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    pushEvent({
      event: "internal_search",
      search_term: normalized,
      destination: "search_results",
    });
    setQuery("");
  }

  return (
    <>
      <div className="utility-bar">
        Practice project — every brand, offer, and code is fictional.
      </div>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="CouponLab home">
            <span aria-hidden="true">C</span>
            CouponLab
          </a>
          <nav aria-label="Primary navigation">
            <a href="#offers">Top offers</a>
            <a href="#saving-guide">Saving guides</a>
            <a href="#similar-stores">Stores</a>
          </nav>
          <form className="store-search" role="search" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="store-search">
              Search stores
            </label>
            <input
              id="store-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stores"
              type="search"
            />
            <button type="submit" aria-label="Submit store search">
              ↗
            </button>
          </form>
        </div>
      </header>
    </>
  );
}
