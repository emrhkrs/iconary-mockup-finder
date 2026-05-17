"use client";

import { useEffect, useMemo, useState } from "react";

type Mockup = {
  id: number;
  fileNumber: string;
  title: string;
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  styleTags: string;
  season: string;
  collection: string;
  etsyListingId: string;
  previewImage: string;
  driveLink: string;
  createdAt: string;
};

const PAGE_SIZE = 24;

const filterConfig: { key: keyof Mockup; label: string }[] = [
  { key: "productType", label: "Product" },
  { key: "brand", label: "Brand" },
  { key: "color", label: "Color" },
  { key: "modelType", label: "Model" },
  { key: "view", label: "View" },
  { key: "season", label: "Season" },
];

const quickSearches = [
  "Comfort Colors White",
  "Summer Back View",
  "Gildan Sweatshirt",
  "Baby Tee",
  "Ivory Men",
  "Orchid C1717",
];

function normalize(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/.,:;()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEtsyListingId(value: string) {
  const text = String(value || "").trim();

  if (!text) return "";

  const directNumber = text.match(/^\d{6,}$/);
  if (directNumber) return directNumber[0];

  const listingMatch = text.match(/\/listing\/(\d+)/i);
  if (listingMatch && listingMatch[1]) return listingMatch[1];

  const fallbackMatch = text.match(/listing[^\d]*(\d{6,})/i);
  if (fallbackMatch && fallbackMatch[1]) return fallbackMatch[1];

  return "";
}

function getSearchText(item: Mockup) {
  const rawText = [
    item.id,
    item.fileNumber,
    item.title,
    item.productType,
    item.brand,
    item.color,
    item.modelType,
    item.view,
    item.styleTags,
    item.season,
    item.collection,
    item.etsyListingId,
  ].join(" ");

  const normalizedText = normalize(rawText);
  const aliases: string[] = [];

  if (normalizedText.includes("man") || normalizedText.includes("men")) {
    aliases.push("male men man");
  }

  if (normalizedText.includes("woman") || normalizedText.includes("women")) {
    aliases.push("female women woman");
  }

  if (
    normalizedText.includes("t shirt") ||
    normalizedText.includes("tshirt") ||
    normalizedText.includes("tee")
  ) {
    aliases.push("tshirt t shirt tee t-shirt");
  }

  if (normalizedText.includes("front view")) aliases.push("front");
  if (normalizedText.includes("back view")) aliases.push("back");

  if (normalizedText.includes("comfort colors")) {
    aliases.push("cc c1717 comfortcolors comfort color");
  }

  return normalize(`${rawText} ${aliases.join(" ")}`);
}

function uniqueValues(items: Mockup[], key: keyof Mockup) {
  return [...new Set(items.map((item) => String(item[key] || "").trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Home() {
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMockups() {
      try {
        const response = await fetch("/api/mockups");
        const result = await response.json();

        if (!result.ok) {
          throw new Error(result.error || "Failed to load mockups");
        }

        setMockups(result.mockups || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadMockups();
  }, []);

  const filterOptions = useMemo(() => {
    return filterConfig.reduce<Record<string, string[]>>((acc, filter) => {
      acc[filter.key] = uniqueValues(mockups, filter.key);
      return acc;
    }, {});
  }, [mockups]);

  const filteredMockups = useMemo(() => {
    const etsyListingId = extractEtsyListingId(query);

    const terms = normalize(query)
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean);

    const filtered = mockups.filter((item) => {
      const searchableText = getSearchText(item);

      const matchesSearch = etsyListingId
        ? searchableText.includes(etsyListingId)
        : terms.every((term) => searchableText.includes(term));

      const matchesFilters = etsyListingId
        ? true
        : Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            return String(item[key as keyof Mockup] || "") === value;
          });

      return matchesSearch && matchesFilters;
    });

    const sorted = [...filtered];

    if (sort === "newest") {
      sorted.sort((a, b) => Number(b.id) - Number(a.id));
    }

    if (sort === "oldest") {
      sorted.sort((a, b) => Number(a.id) - Number(b.id));
    }

    if (sort === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    return sorted;
  }, [mockups, query, filters, sort]);

  const visibleMockups = filteredMockups.slice(0, visibleCount);

  function resetAll() {
    setQuery("");
    setFilters({});
    setSort("newest");
    setVisibleCount(PAGE_SIZE);
  }

  function toggleFilter(key: string, value: string) {
    setVisibleCount(PAGE_SIZE);

    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? "" : value,
    }));
  }

  async function copyFileNumber(item: Mockup) {
    await navigator.clipboard.writeText(item.fileNumber);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1200);
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-stone-950">
      <section className="border-b border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_35%),linear-gradient(135deg,_#fbf7ef,_#f3ece1)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <nav className="mb-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-950 text-lg font-black text-white shadow-xl">
                I
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">ICONARY</p>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">
                  Mockup Finder
                </p>
              </div>
            </div>

            <div className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-xs font-bold text-stone-600 shadow-sm">
              {loading ? "Loading mockups..." : `${mockups.length} mockups loaded`}
            </div>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-stone-200 bg-white/75 px-4 py-2 text-xs font-bold text-stone-700">
                ✦ Private search engine for your mockup library
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.93] tracking-[-0.075em] sm:text-7xl">
                Find the perfect mockup in seconds.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
                Search your ICONARY library by Etsy product link, file number, brand,
                color, product type, model, view or season.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-2xl shadow-stone-900/5">
              <div className="mb-4 flex items-center justify-between text-sm font-black">
                <span>Popular searches</span>
                <span>↗</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 transition hover:border-stone-950 hover:text-stone-950"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f4ed]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder='Search “Comfort Colors white”, “baby tee” or paste an Etsy link...'
              className="h-14 flex-1 rounded-2xl border border-stone-200 bg-white px-5 text-sm font-semibold outline-none transition focus:border-stone-950 focus:ring-4 focus:ring-stone-950/5"
            />

            <button
              onClick={resetAll}
              className="h-14 rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-900 transition hover:border-stone-950"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 rounded-[2rem] border border-stone-200 bg-white/75 p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filterConfig.map((filter) => (
              <div key={filter.key}>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  {filter.label}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(filterOptions[filter.key] || []).map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(filter.key, option)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        filters[filter.key] === option
                          ? "border-stone-950 bg-stone-950 text-white"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-950 hover:text-stone-950"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-stone-500">Results</p>
            <h2 className="text-3xl font-black tracking-tight">
              {filteredMockups.length} mockup{filteredMockups.length === 1 ? "" : "s"} found
            </h2>
            {filteredMockups.length > 0 && (
              <p className="mt-2 text-sm font-semibold text-stone-500">
                Showing {visibleMockups.length} of {filteredMockups.length} mockups
              </p>
            )}
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-black outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="az">Sort: A-Z</option>
            <option value="za">Sort: Z-A</option>
          </select>
        </div>

        {loading && (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center font-bold text-stone-500">
            Loading your mockup library...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-10 text-center">
            <h3 className="text-xl font-black text-red-900">Something went wrong</h3>
            <p className="mt-2 text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && filteredMockups.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center">
            <h3 className="text-2xl font-black">No mockups found</h3>
            <p className="mt-2 text-sm font-bold text-stone-500">
              Try another brand, color, product type, Etsy link or file number.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleMockups.map((item) => {
            const styleTags = String(item.styleTags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .slice(0, 5);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                  {item.previewImage ? (
                    <img
                      src={item.previewImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm font-bold text-stone-400">
                      Preview unavailable
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-stone-800 shadow-sm">
                    {item.productType}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {[item.brand, item.color, item.view].filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-stone-700 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-2 min-h-11 text-base font-black leading-snug">
                      {item.title}
                    </h3>

                    <div className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl bg-stone-50 px-3 py-2 font-mono text-[11px] text-stone-600">
                      {item.fileNumber}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {styleTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-stone-200 px-2 py-1 text-[10px] font-bold text-stone-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyFileNumber(item)}
                      className="rounded-2xl border border-stone-200 bg-white px-3 py-3 text-xs font-black transition hover:border-stone-950 hover:bg-stone-950 hover:text-white"
                    >
                      {copiedId === item.id ? "Copied" : "Copy No."}
                    </button>

                    {isValidUrl(item.driveLink) ? (
                      <a
                        href={item.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-stone-950 px-3 py-3 text-center text-xs font-black text-white transition hover:bg-stone-800"
                      >
                        Open Drive
                      </a>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-2xl bg-stone-200 px-3 py-3 text-xs font-black text-stone-500"
                      >
                        Drive Pending
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visibleMockups.length < filteredMockups.length && (
          <div className="flex justify-center pt-10">
            <button
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="h-14 min-w-64 rounded-2xl bg-stone-950 px-6 text-sm font-black text-white transition hover:bg-stone-800"
            >
              Load More Mockups ({filteredMockups.length - visibleMockups.length} remaining)
            </button>
          </div>
        )}
      </section>
    </main>
  );
}