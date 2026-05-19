"use client";

import { useMemo, useState } from "react";

type BatchSettings = {
  password: string;
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  season: string;
  collection: string;
};

type EntryData = {
  etsyUrl: string;
  etsyListingId: string;
  fileNumber: string;
  previewImage: string;
  driveLink: string;
  title: string;
  styleTags: string;
};

type AdminOptions = {
  productTypes: string[];
  brands: string[];
  colors: string[];
  modelTypes: string[];
  views: string[];
  seasons: string[];
  collections: string[];
};

const initialBatch: BatchSettings = {
  password: "",
  productType: "T-Shirt",
  brand: "Comfort Colors",
  color: "",
  modelType: "Woman",
  view: "Front View",
  season: "All Season",
  collection: "Comfort Colors C1717",
};

const initialEntry: EntryData = {
  etsyUrl: "",
  etsyListingId: "",
  fileNumber: "",
  previewImage: "",
  driveLink: "",
  title: "",
  styleTags: "",
};

const fallbackOptions: AdminOptions = {
  productTypes: [
    "T-Shirt",
    "Sweatshirt",
    "Hoodie",
    "Baby Tee",
    "Kids T-Shirt",
    "Tote Bag",
    "Long Sleeve",
    "Tank Top",
  ],
  brands: [
    "Comfort Colors",
    "Gildan",
    "Bella Canvas",
    "Generic",
    "Independent Trading Co.",
    "Jerzees",
  ],
  colors: [
    "White",
    "Ivory",
    "Black",
    "Pepper",
    "Moss",
    "Espresso",
    "Blue Jean",
    "Orchid",
    "Light Green",
    "Maroon",
    "Bay",
    "Butter",
    "Blossom",
    "Chambray",
    "Seafoam",
    "Terracotta",
    "Crunchberry",
    "Crimson",
    "Flo Blue",
    "True Navy",
    "Khaki",
    "Berry",
    "Violet",
    "Blue Spruce",
    "Grey",
    "Red",
    "Mustard",
    "Watermelon",
    "Lagoon",
    "Island Reef",
    "Sage",
    "Sand",
    "Ash",
    "Natural",
    "Cream",
  ],
  modelTypes: ["Woman", "Man", "Kids", "Couple", "Group", "No Model"],
  views: [
    "Front View",
    "Back View",
    "Flat Lay",
    "Close Up",
    "Chin Down",
    "Mirror View",
    "Side View",
  ],
  seasons: [
    "All Season",
    "Summer",
    "Spring",
    "Fall",
    "Winter",
    "Christmas",
    "Valentine",
    "Halloween",
    "Graduation",
    "Wedding",
  ],
  collections: [
    "ICONARY Mockup Library",
    "Comfort Colors C1717",
    "Bella Canvas 3001",
    "Gildan 5000",
    "Gildan 5000B Baby Tee",
    "Gildan Sweatshirt",
    "Tote Bag Lifestyle Bundle",
  ],
};

const fileColorMap: Record<string, string> = {
  white: "White",
  ivory: "Ivory",
  black: "Black",
  pepper: "Pepper",
  moss: "Moss",
  espresso: "Espresso",
  bluejean: "Blue Jean",
  orchid: "Orchid",
  lightgreen: "Light Green",
  maroon: "Maroon",
  bay: "Bay",
  butter: "Butter",
  blossom: "Blossom",
  chambray: "Chambray",
  seafoam: "Seafoam",
  terracotta: "Terracotta",
  crunchberry: "Crunchberry",
  crimson: "Crimson",
  floblue: "Flo Blue",
  truenavy: "True Navy",
  khaki: "Khaki",
  berry: "Berry",
  violet: "Violet",
  bluespruce: "Blue Spruce",
  grey: "Grey",
  gray: "Grey",
  red: "Red",
  mustard: "Mustard",
  watermelon: "Watermelon",
  lagoon: "Lagoon",
  islandreef: "Island Reef",
  sage: "Sage",
  sand: "Sand",
  ash: "Ash",
  natural: "Natural",
  cream: "Cream",
};

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/.,:;()|]+/g, " ")
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

function getFileCode(fileNumber: string) {
  const value = String(fileNumber || "").toLowerCase().trim();

  if (value.includes(".5000b")) return "5000b";
  if (value.includes(".c1717")) return "c1717";
  if (value.includes(".3001")) return "3001";
  if (value.includes(".5000")) return "5000";

  return "";
}

function getColorFromFileNumber(fileNumber: string) {
  const beforeDot = String(fileNumber || "").toLowerCase().split(".")[0];

  const colorKey = beforeDot
    .replace(/[0-9]/g, "")
    .replace(/[^a-z]/g, "");

  if (fileColorMap[colorKey]) {
    return fileColorMap[colorKey];
  }

  return "";
}

function inferFromFileNumber(fileNumber: string) {
  const code = getFileCode(fileNumber);
  const color = getColorFromFileNumber(fileNumber);

  let brand = "";
  let productType = "";
  let collection = "";

  if (code === "c1717") {
    brand = "Comfort Colors";
    productType = "T-Shirt";
    collection = "Comfort Colors C1717";
  }

  if (code === "3001") {
    brand = "Bella Canvas";
    productType = "T-Shirt";
    collection = "Bella Canvas 3001";
  }

  if (code === "5000") {
    brand = "Gildan";
    productType = "T-Shirt";
    collection = "Gildan 5000";
  }

  if (code === "5000b") {
    brand = "Gildan";
    productType = "Baby Tee";
    collection = "Gildan 5000B Baby Tee";
  }

  return {
    color,
    brand,
    productType,
    collection,
  };
}

function generateCollection(item: {
  brand: string;
  productType: string;
  season: string;
}) {
  if (item.brand === "Comfort Colors" && item.productType === "T-Shirt") {
    return "Comfort Colors C1717";
  }

  if (item.brand === "Bella Canvas" && item.productType === "T-Shirt") {
    return "Bella Canvas 3001";
  }

  if (item.brand === "Gildan" && item.productType === "T-Shirt") {
    return "Gildan 5000";
  }

  if (item.brand === "Gildan" && item.productType === "Baby Tee") {
    return "Gildan 5000B Baby Tee";
  }

  if (item.brand === "Gildan" && item.productType === "Sweatshirt") {
    return "Gildan Sweatshirt";
  }

  if (item.productType === "Tote Bag") {
    return "Tote Bag Lifestyle Bundle";
  }

  if (
    item.brand &&
    item.productType &&
    item.season &&
    item.season !== "All Season"
  ) {
    return `${item.brand} ${item.season} ${item.productType}`;
  }

  if (item.brand && item.productType) {
    return `${item.brand} ${item.productType}`;
  }

  return "ICONARY Mockup Library";
}

function generateTitle(item: {
  brand: string;
  color: string;
  modelType: string;
  season: string;
  view: string;
  productType: string;
}) {
  return [
    item.brand,
    item.color,
    item.modelType,
    item.season !== "All Season" ? item.season : "",
    item.view,
    item.productType,
    "Mockup",
  ]
    .filter(Boolean)
    .join(" ");
}

function generateStyleTags(item: {
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  season: string;
  collection: string;
  etsyListingId: string;
}) {
  const tags = [
    item.productType,
    item.brand,
    item.color,
    item.modelType,
    item.view,
    item.season,
    item.collection,
    item.etsyListingId,
    "lifestyle",
  ]
    .filter(Boolean)
    .filter((tag) => tag !== "All Season")
    .map((tag) => String(tag).toLowerCase());

  return [...new Set(tags)].join(", ");
}

function buildPayload(batch: BatchSettings, entry: EntryData) {
  const fileInfo = inferFromFileNumber(entry.fileNumber);

  const etsyListingId =
    cleanText(entry.etsyListingId) || extractEtsyListingId(entry.etsyUrl);

  const productType = batch.productType || fileInfo.productType;
  const brand = batch.brand || fileInfo.brand;
  const color = batch.color || fileInfo.color;
  const modelType = batch.modelType || "Woman";
  const view = batch.view || "Front View";
  const season = batch.season || "All Season";

  const collection =
    batch.collection ||
    fileInfo.collection ||
    generateCollection({
      brand,
      productType,
      season,
    });

  const title =
    cleanText(entry.title) ||
    generateTitle({
      brand,
      color,
      modelType,
      season,
      view,
      productType,
    });

  const styleTags =
    cleanText(entry.styleTags) ||
    generateStyleTags({
      productType,
      brand,
      color,
      modelType,
      view,
      season,
      collection,
      etsyListingId,
    });

  return {
    password: batch.password,
    etsyUrl: cleanText(entry.etsyUrl),
    etsyListingId,
    fileNumber: cleanText(entry.fileNumber),
    previewImage: cleanText(entry.previewImage),
    driveLink: cleanText(entry.driveLink),
    productType,
    brand,
    color,
    modelType,
    view,
    season,
    collection,
    title,
    styleTags,
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  options = [],
  listId,
  textarea = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
  listId?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-stone-400">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-stone-950"
        />
      ) : (
        <>
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            list={listId}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
          />

          {listId && options.length > 0 && (
            <datalist id={listId}>
              {options.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          )}
        </>
      )}
    </div>
  );
}

export default function BatchAddPage() {
  const [batch, setBatch] = useState<BatchSettings>(initialBatch);
  const [entry, setEntry] = useState<EntryData>(initialEntry);
  const [options, setOptions] = useState<AdminOptions>(fallbackOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const payload = useMemo(() => buildPayload(batch, entry), [batch, entry]);

  const inferredFromFile = useMemo(
    () => inferFromFileNumber(entry.fileNumber),
    [entry.fileNumber]
  );

  const warnings = useMemo(() => {
    const list: string[] = [];

    if (entry.fileNumber) {
      if (
        inferredFromFile.color &&
        batch.color &&
        normalize(inferredFromFile.color) !== normalize(batch.color)
      ) {
        list.push(
          `File number color looks like "${inferredFromFile.color}", but batch color is "${batch.color}".`
        );
      }

      if (
        inferredFromFile.brand &&
        batch.brand &&
        normalize(inferredFromFile.brand) !== normalize(batch.brand)
      ) {
        list.push(
          `File number brand looks like "${inferredFromFile.brand}", but batch brand is "${batch.brand}".`
        );
      }

      if (
        inferredFromFile.collection &&
        batch.collection &&
        normalize(inferredFromFile.collection) !== normalize(batch.collection)
      ) {
        list.push(
          `File number collection looks like "${inferredFromFile.collection}", but batch collection is "${batch.collection}".`
        );
      }
    }

    return list;
  }, [entry.fileNumber, inferredFromFile, batch]);

  function updateBatch<K extends keyof BatchSettings>(
    key: K,
    value: BatchSettings[K]
  ) {
    setMessage(null);
    setBatch((current) => ({ ...current, [key]: value }));
  }

  function updateEntry<K extends keyof EntryData>(key: K, value: EntryData[K]) {
    setMessage(null);

    setEntry((current) => {
      const next = { ...current, [key]: value };

      if (key === "etsyUrl") {
        const id = extractEtsyListingId(String(value));
        if (id) {
          next.etsyListingId = id;
        }
      }

      return next;
    });
  }

  async function loadOptions() {
    if (!batch.password) {
      setMessage({
        type: "error",
        text: "Enter admin password first.",
      });
      return;
    }

    setOptionsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/options", {
        headers: {
          "x-admin-password": batch.password,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to load options.");
      }

      setOptions({
        ...fallbackOptions,
        ...(result.options || {}),
      });

      setMessage({
        type: "success",
        text: "Options loaded successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setOptionsLoading(false);
    }
  }

  function applyFileInferenceToBatch() {
    if (!entry.fileNumber) {
      setMessage({
        type: "error",
        text: "Enter file number first.",
      });
      return;
    }

    const info = inferFromFileNumber(entry.fileNumber);

    setBatch((current) => ({
      ...current,
      productType: info.productType || current.productType,
      brand: info.brand || current.brand,
      color: info.color || current.color,
      collection: info.collection || current.collection,
    }));

    setMessage({
      type: "success",
      text: "Batch settings updated from file number.",
    });
  }

  function clearCurrentEntry() {
    setEntry(initialEntry);
    setMessage({
      type: "info",
      text: "Current entry fields cleared. Batch settings stayed the same.",
    });
  }

  function resetBatch() {
    setBatch({
      ...initialBatch,
      password: batch.password,
    });

    setEntry(initialEntry);
    setSavedCount(0);

    setMessage({
      type: "info",
      text: "Batch settings reset.",
    });
  }

  async function save(saveAndNext: boolean) {
    const finalPayload = buildPayload(batch, entry);

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to save mockup.");
      }

      setSavedCount((current) => current + 1);

      setMessage({
        type: "success",
        text: `Mockup saved successfully: ${result.mockup.title}`,
      });

      if (saveAndNext) {
        setEntry(initialEntry);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-8 text-stone-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
            ICONARY
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
            Batch Add Mockups
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-stone-600">
            Choose the fixed settings once, then keep uploading mockups from the
            same group without selecting the same fields every time.
          </p>
        </div>

        <div className="mb-5 rounded-[2rem] border border-stone-200 bg-white/75 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field
              label="Admin Password"
              value={batch.password}
              onChange={(value) => updateBatch("password", value)}
              placeholder="Enter admin password"
              type="password"
            />

            <div className="flex items-end">
              <button
                onClick={loadOptions}
                disabled={optionsLoading}
                className="h-12 rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-950 transition hover:border-stone-950 disabled:opacity-50"
              >
                {optionsLoading ? "Loading..." : "Load Options"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : message.type === "info"
                ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            <p className="mb-2">Warnings</p>
            <ul className="list-disc space-y-1 pl-5">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-xl shadow-stone-900/5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                    Batch Settings
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Fixed Values
                  </h2>
                </div>

                <div className="rounded-full bg-stone-950 px-4 py-2 text-xs font-black text-white">
                  Saved in this batch: {savedCount}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Product Type"
                  value={batch.productType}
                  onChange={(value) => updateBatch("productType", value)}
                  options={options.productTypes}
                  listId="batch-product-type-options"
                  placeholder="T-Shirt"
                />

                <Field
                  label="Brand"
                  value={batch.brand}
                  onChange={(value) => updateBatch("brand", value)}
                  options={options.brands}
                  listId="batch-brand-options"
                  placeholder="Comfort Colors"
                />

                <Field
                  label="Color"
                  value={batch.color}
                  onChange={(value) => updateBatch("color", value)}
                  options={options.colors}
                  listId="batch-color-options"
                  placeholder="Pepper"
                />

                <Field
                  label="Model Type"
                  value={batch.modelType}
                  onChange={(value) => updateBatch("modelType", value)}
                  options={options.modelTypes}
                  listId="batch-model-type-options"
                  placeholder="Woman"
                />

                <Field
                  label="View"
                  value={batch.view}
                  onChange={(value) => updateBatch("view", value)}
                  options={options.views}
                  listId="batch-view-options"
                  placeholder="Front View"
                />

                <Field
                  label="Season"
                  value={batch.season}
                  onChange={(value) => updateBatch("season", value)}
                  options={options.seasons}
                  listId="batch-season-options"
                  placeholder="Summer"
                />

                <div className="md:col-span-2">
                  <Field
                    label="Collection"
                    value={batch.collection}
                    onChange={(value) => updateBatch("collection", value)}
                    options={options.collections}
                    listId="batch-collection-options"
                    placeholder="Comfort Colors C1717"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <button
                  onClick={applyFileInferenceToBatch}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 transition hover:border-stone-950"
                >
                  Infer Batch from File Number
                </button>

                <button
                  onClick={clearCurrentEntry}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 transition hover:border-stone-950"
                >
                  Clear Current Entry
                </button>

                <button
                  onClick={resetBatch}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-800 transition hover:border-red-300"
                >
                  Reset Batch
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-xl shadow-stone-900/5">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Current Mockup Entry
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Only Fill the Changing Fields
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Etsy Link"
                  value={entry.etsyUrl}
                  onChange={(value) => updateEntry("etsyUrl", value)}
                  placeholder="https://www.etsy.com/listing/..."
                />

                <Field
                  label="Preview Image"
                  value={entry.previewImage}
                  onChange={(value) => updateEntry("previewImage", value)}
                  placeholder="https://i.etsystatic.com/..."
                />

                <Field
                  label="File Number"
                  value={entry.fileNumber}
                  onChange={(value) => updateEntry("fileNumber", value)}
                  placeholder="716248976124pepper.c1717"
                />

                <Field
                  label="Etsy Listing ID"
                  value={entry.etsyListingId}
                  onChange={(value) => updateEntry("etsyListingId", value)}
                  placeholder="4443981460"
                />

                <div className="md:col-span-2">
                  <Field
                    label="Drive Link"
                    value={entry.driveLink}
                    onChange={(value) => updateEntry("driveLink", value)}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Title (optional)"
                    value={entry.title}
                    onChange={(value) => updateEntry("title", value)}
                    placeholder="Leave empty to auto-generate"
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Style Tags (optional)"
                    value={entry.styleTags}
                    onChange={(value) => updateEntry("styleTags", value)}
                    textarea
                    placeholder="Leave empty to auto-generate"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => save(false)}
                  disabled={submitting}
                  className="rounded-2xl bg-stone-800 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Only"}
                </button>

                <button
                  onClick={() => save(true)}
                  disabled={submitting}
                  className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save & Next"}
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Active Batch Summary
              </p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Product Type
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.productType || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Brand
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.brand || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Color
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.color || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Model Type
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.modelType || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    View
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.view || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Season
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.season || "Empty"}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3 sm:col-span-2 xl:col-span-1">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                    Collection
                  </p>
                  <p className="mt-1 text-sm font-black text-stone-900">
                    {payload.collection || "Empty"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Live Preview
              </p>

              <div className="overflow-hidden rounded-[1.5rem] bg-stone-100">
                {payload.previewImage ? (
                  <img
                    src={payload.previewImage}
                    alt={payload.title || "Preview"}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[4/5] place-items-center px-8 text-center text-sm font-bold text-stone-400">
                    Preview image will appear here
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <h2 className="text-xl font-black leading-tight">
                  {payload.title || "Untitled Mockup"}
                </h2>

                <div className="rounded-2xl bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600">
                  {payload.fileNumber || "No file number"}
                </div>

                <p className="text-sm font-bold text-stone-600">
                  {payload.brand || "Brand"} · {payload.color || "Color"} ·{" "}
                  {payload.productType || "Product"}
                </p>

                <p className="text-xs font-bold text-stone-400">
                  {payload.collection || "Collection"}
                </p>

                <p className="break-words text-xs font-semibold leading-5 text-stone-500">
                  {payload.styleTags || "Style tags will appear here"}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}