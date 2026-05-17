"use client";

import { useState } from "react";

type AutoFillData = {
  password: string;
  etsyUrl: string;
  etsyListingId: string;
  originalTitle: string;
  title: string;
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  season: string;
  collection: string;
  styleTags: string;
  previewImage: string;
  fileNumber: string;
  driveLink: string;
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

const initialData: AutoFillData = {
  password: "",
  etsyUrl: "",
  etsyListingId: "",
  originalTitle: "",
  title: "",
  productType: "",
  brand: "",
  color: "",
  modelType: "",
  view: "",
  season: "All Season",
  collection: "",
  styleTags: "",
  previewImage: "",
  fileNumber: "",
  driveLink: "",
};

const emptyOptions: AdminOptions = {
  productTypes: [],
  brands: [],
  colors: [],
  modelTypes: [],
  views: [],
  seasons: [],
  collections: [],
};

function Field({
  label,
  value,
  onChange,
  textarea = false,
  placeholder = "",
  options = [],
  listId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
  options?: string[];
  listId?: string;
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

export default function AutoFillPage() {
  const [data, setData] = useState<AutoFillData>(initialData);
  const [options, setOptions] = useState<AdminOptions>(emptyOptions);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  function update<K extends keyof AutoFillData>(key: K, value: AutoFillData[K]) {
    setMessage(null);
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function loadOptions() {
    if (!data.password) {
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
          "x-admin-password": data.password,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to load options.");
      }

      setOptions(result.options || emptyOptions);

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

  async function fetchFromEtsy() {
    setLoading(true);
    setMessage(null);

    try {
      if (
        data.password &&
        options.productTypes.length === 0 &&
        !optionsLoading
      ) {
        await loadOptions();
      }

      const response = await fetch("/api/admin/etsy-autofill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          etsyUrl: data.etsyUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to fetch Etsy product.");
      }

      const suggestion = result.suggestion;

      setData((current) => ({
        ...current,
        etsyListingId: suggestion.etsyListingId || current.etsyListingId,
        originalTitle: suggestion.originalTitle || current.originalTitle,
        title: suggestion.title || current.title,
        productType: suggestion.productType || current.productType,
        brand: suggestion.brand || current.brand,
        color: suggestion.color || current.color,
        modelType: suggestion.modelType || current.modelType,
        view: suggestion.view || current.view,
        season: suggestion.season || current.season,
        collection: suggestion.collection || current.collection,
        styleTags: suggestion.styleTags || current.styleTags,
        previewImage: suggestion.previewImage || current.previewImage,
      }));

      setMessage({
        type: result.warning ? "info" : "success",
        text: result.warning || "Product details filled successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveMockup() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          etsyUrl: data.etsyUrl,
          etsyListingId: data.etsyListingId,
          title: data.title,
          productType: data.productType,
          brand: data.brand,
          color: data.color,
          modelType: data.modelType,
          view: data.view,
          season: data.season,
          collection: data.collection,
          styleTags: data.styleTags,
          previewImage: data.previewImage,
          fileNumber: data.fileNumber,
          driveLink: data.driveLink,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to save mockup.");
      }

      setMessage({
        type: "success",
        text: `Mockup saved successfully: ${result.mockup.title}`,
      });

      setData((current) => ({
        ...initialData,
        password: current.password,
      }));

      await loadOptions();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-8 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
            ICONARY
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
            Auto Fill from Etsy
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Paste an Etsy product link. The system will try to fill mockup fields.
            You can choose from existing values or type a new value.
          </p>
        </div>

        <div className="mb-6 rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto_auto]">
            <Field
              label="Admin Password"
              value={data.password}
              onChange={(value) => update("password", value)}
              placeholder="Enter admin password"
            />

            <Field
              label="Etsy Product Link"
              value={data.etsyUrl}
              onChange={(value) => update("etsyUrl", value)}
              placeholder="https://www.etsy.com/listing/4443981460/..."
            />

            <div className="flex items-end">
              <button
                onClick={loadOptions}
                disabled={optionsLoading}
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-950 transition hover:border-stone-950 disabled:opacity-50 md:w-auto"
              >
                {optionsLoading ? "Loading..." : "Load Options"}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchFromEtsy}
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50 md:w-auto"
              >
                {loading ? "Fetching..." : "Fetch Product"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-bold ${
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

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Preview
            </p>

            <div className="overflow-hidden rounded-[1.5rem] bg-stone-100">
              {data.previewImage ? (
                <img
                  src={data.previewImage}
                  alt={data.title || "Preview"}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[4/5] place-items-center px-8 text-center text-sm font-bold text-stone-400">
                  Preview image will appear here
                </div>
              )}
            </div>

            {data.originalTitle && (
              <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Etsy Original Title
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-stone-700">
                  {data.originalTitle}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Suggested Fields
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Title"
                value={data.title}
                onChange={(value) => update("title", value)}
              />

              <Field
                label="Etsy Listing ID"
                value={data.etsyListingId}
                onChange={(value) => update("etsyListingId", value)}
              />

              <Field
                label="Product Type"
                value={data.productType}
                onChange={(value) => update("productType", value)}
                options={options.productTypes}
                listId="product-type-options"
                placeholder="T-Shirt"
              />

              <Field
                label="Brand"
                value={data.brand}
                onChange={(value) => update("brand", value)}
                options={options.brands}
                listId="brand-options"
                placeholder="Comfort Colors"
              />

              <Field
                label="Color"
                value={data.color}
                onChange={(value) => update("color", value)}
                options={options.colors}
                listId="color-options"
                placeholder="White"
              />

              <Field
                label="Model Type"
                value={data.modelType}
                onChange={(value) => update("modelType", value)}
                options={options.modelTypes}
                listId="model-type-options"
                placeholder="Woman"
              />

              <Field
                label="View"
                value={data.view}
                onChange={(value) => update("view", value)}
                options={options.views}
                listId="view-options"
                placeholder="Front View"
              />

              <Field
                label="Season"
                value={data.season}
                onChange={(value) => update("season", value)}
                options={options.seasons}
                listId="season-options"
                placeholder="All Season"
              />

              <Field
                label="Collection"
                value={data.collection}
                onChange={(value) => update("collection", value)}
                options={options.collections}
                listId="collection-options"
                placeholder="Comfort Colors T-Shirt"
              />

              <Field
                label="Preview Image"
                value={data.previewImage}
                onChange={(value) => update("previewImage", value)}
              />

              <div className="md:col-span-2">
                <Field
                  label="Style Tags"
                  value={data.styleTags}
                  onChange={(value) => update("styleTags", value)}
                  textarea
                />
              </div>

              <Field
                label="File Number"
                value={data.fileNumber}
                onChange={(value) => update("fileNumber", value)}
                placeholder="987641982764white.5000b"
              />

              <Field
                label="Drive Link"
                value={data.driveLink}
                onChange={(value) => update("driveLink", value)}
                placeholder="https://drive.google.com/file/d/.../view"
              />
            </div>

            <button
              onClick={saveMockup}
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Mockup"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}