"use client";

import { useMemo, useState } from "react";

type AdminData = {
  password: string;
  etsyUrl: string;
  etsyListingId: string;
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  season: string;
  styleTags: string;
  collection: string;
  previewImage: string;
  fileNumber: string;
  driveLink: string;
  title: string;
};

type Step = {
  key: keyof AdminData | "review";
  label: string;
  help: string;
  type: "text" | "select" | "textarea" | "combo" | "review";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

const steps: Step[] = [
  {
    key: "etsyUrl",
    label: "Etsy Product Link",
    help: "Paste the Etsy product link first. The listing ID will be detected automatically.",
    type: "text",
    placeholder: "https://www.etsy.com/listing/4443981460/...",
  },
  {
    key: "etsyListingId",
    label: "Etsy Listing ID",
    help: "This can be auto-filled from the Etsy link. You can also enter it manually.",
    type: "text",
    placeholder: "4443981460",
  },
  {
    key: "productType",
    label: "Product Type",
    help: "Choose the product type.",
    type: "select",
    required: true,
    options: ["T-Shirt", "Sweatshirt", "Hoodie", "Baby Tee", "Kids T-Shirt", "Tote Bag"],
  },
  {
    key: "brand",
    label: "Brand",
    help: "Choose a brand or type a new one.",
    type: "combo",
    required: true,
    options: ["Comfort Colors", "Gildan", "Bella Canvas", "Generic"],
    placeholder: "Comfort Colors",
  },
  {
    key: "color",
    label: "Color",
    help: "Example: White, Ivory, Orchid, Light Green, Maroon.",
    type: "text",
    required: true,
    placeholder: "White",
  },
  {
    key: "modelType",
    label: "Model Type",
    help: "Choose the model type.",
    type: "select",
    required: true,
    options: ["Woman", "Man", "Kids", "Couple", "Group", "No Model"],
  },
  {
    key: "view",
    label: "View",
    help: "Choose the mockup view.",
    type: "select",
    required: true,
    options: ["Front View", "Back View", "Flat Lay", "Close Up", "Chin Down", "Mirror View"],
  },
  {
    key: "season",
    label: "Season",
    help: "Choose All Season if this is not seasonal.",
    type: "select",
    required: true,
    options: ["All Season", "Summer", "Spring", "Fall", "Winter", "Christmas", "Valentine", "Halloween"],
  },
  {
    key: "styleTags",
    label: "Style Tags / Vibe",
    help: "Optional. Leave empty to auto-generate tags.",
    type: "textarea",
    placeholder: "summer, baby tee, lifestyle, 5000b",
  },
  {
    key: "collection",
    label: "Collection",
    help: "Optional. Leave empty to auto-generate collection.",
    type: "text",
    placeholder: "Gildan 5000B Baby Tee",
  },
  {
    key: "previewImage",
    label: "Preview Image Link",
    help: "This image will appear on the mockup card.",
    type: "text",
    required: true,
    placeholder: "https://i.etsystatic.com/...jpg",
  },
  {
    key: "fileNumber",
    label: "File Number",
    help: "Enter the mockup file number near the end.",
    type: "text",
    required: true,
    placeholder: "987641982764white.5000b",
  },
  {
    key: "driveLink",
    label: "Drive Link",
    help: "This is the Open Drive button link.",
    type: "text",
    required: true,
    placeholder: "https://drive.google.com/file/d/.../view",
  },
  {
    key: "review",
    label: "Review & Add",
    help: "Review all details before adding this mockup.",
    type: "review",
  },
];

const initialData: AdminData = {
  password: "",
  etsyUrl: "",
  etsyListingId: "",
  productType: "",
  brand: "",
  color: "",
  modelType: "",
  view: "",
  season: "All Season",
  styleTags: "",
  collection: "",
  previewImage: "",
  fileNumber: "",
  driveLink: "",
  title: "",
};

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

function generateTitle(data: AdminData) {
  return [
    data.brand,
    data.color,
    data.modelType,
    data.season !== "All Season" ? data.season : "",
    data.view,
    data.productType,
    "Mockup",
  ]
    .filter(Boolean)
    .join(" ");
}

function generateCollection(data: AdminData) {
  if (data.brand && data.productType && data.season && data.season !== "All Season") {
    return `${data.brand} ${data.season} ${data.productType}`;
  }

  if (data.brand && data.productType) {
    return `${data.brand} ${data.productType}`;
  }

  return "ICONARY Mockup Library";
}

function generateStyleTags(data: AdminData) {
  const tags = [
    data.productType,
    data.brand,
    data.color,
    data.modelType,
    data.view,
    data.season,
    data.collection,
    data.etsyListingId,
    "lifestyle",
  ]
    .filter(Boolean)
    .filter((tag) => tag !== "All Season")
    .map((tag) => String(tag).toLowerCase());

  return [...new Set(tags)].join(", ");
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const preparedData = useMemo(() => {
    const next = { ...data };

    if (!next.etsyListingId && next.etsyUrl) {
      next.etsyListingId = extractEtsyListingId(next.etsyUrl);
    }

    if (!next.title) {
      next.title = generateTitle(next);
    }

    if (!next.collection) {
      next.collection = generateCollection(next);
    }

    if (!next.styleTags) {
      next.styleTags = generateStyleTags(next);
    }

    return next;
  }, [data]);

  function updateValue(key: keyof AdminData, value: string) {
    setMessage(null);

    setData((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "etsyUrl") {
        const id = extractEtsyListingId(value);

        if (id) {
          next.etsyListingId = id;
        }
      }

      return next;
    });
  }

  function goNext() {
    setMessage(null);

    if (step.type === "review") {
      submitMockup();
      return;
    }

    const key = step.key as keyof AdminData;
    const value = String(data[key] || "").trim();

    if (step.required && !value) {
      setMessage({
        type: "error",
        text: `${step.label} is required.`,
      });
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setMessage(null);
    setCurrentStep((current) => Math.max(current - 1, 0));
  }

  async function submitMockup() {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preparedData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to add mockup.");
      }

      setMessage({
        type: "success",
        text: `Mockup added successfully: ${result.mockup.title}`,
      });

      setData({
        ...initialData,
        password: data.password,
      });

      setCurrentStep(0);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function renderField() {
    if (step.type === "review") {
      const reviewItems: [string, string][] = [
        ["Title", preparedData.title],
        ["Etsy Listing ID", preparedData.etsyListingId || "Empty"],
        ["Product Type", preparedData.productType],
        ["Brand", preparedData.brand],
        ["Color", preparedData.color],
        ["Model Type", preparedData.modelType],
        ["View", preparedData.view],
        ["Season", preparedData.season],
        ["Collection", preparedData.collection],
        ["Style Tags", preparedData.styleTags],
        ["Preview Image", preparedData.previewImage],
        ["File Number", preparedData.fileNumber],
        ["Drive Link", preparedData.driveLink],
      ];

      return (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Auto Title
            </p>
            <input
              value={data.title || preparedData.title}
              onChange={(event) => updateValue("title", event.target.value)}
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
            />
          </div>

          <div className="space-y-2">
            {reviewItems.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-stone-200 bg-white p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">
                  {label}
                </p>
                <p className="mt-1 break-words text-xs font-bold text-stone-700">
                  {value || "Empty"}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const key = step.key as keyof AdminData;

    if (step.type === "select") {
      return (
        <select
          value={data[key]}
          onChange={(event) => updateValue(key, event.target.value)}
          className="h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
        >
          <option value="">Select</option>
          {(step.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (step.type === "textarea") {
      return (
        <textarea
          value={data[key]}
          onChange={(event) => updateValue(key, event.target.value)}
          placeholder={step.placeholder}
          className="min-h-28 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-stone-950"
        />
      );
    }

    if (step.type === "combo") {
      return (
        <>
          <input
            list="brand-options"
            value={data[key]}
            onChange={(event) => updateValue(key, event.target.value)}
            placeholder={step.placeholder}
            className="h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
          />
          <datalist id="brand-options">
            {(step.options || []).map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <p className="mt-3 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
            You can type a new brand
          </p>
        </>
      );
    }

    return (
      <input
        value={data[key]}
        onChange={(event) => updateValue(key, event.target.value)}
        placeholder={step.placeholder}
        className="h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-8 text-stone-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
            ICONARY
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
            Admin Panel
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
            Add mockups step by step. Start with the Etsy product link, then finish with
            file number and Drive link.
          </p>
        </div>

        <div className="mb-5 rounded-[2rem] border border-stone-200 bg-white/75 p-5 shadow-sm">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-400">
            Admin Password
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(event) => updateValue("password", event.target.value)}
            placeholder="Enter admin password"
            className="h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
          />
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-stone-950 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-xl shadow-stone-900/5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
            Step {currentStep + 1} of {steps.length}
          </p>

          <h2 className="text-2xl font-black tracking-[-0.04em]">
            {step.label}
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-stone-500">
            {step.help}
          </p>

          <div className="mt-5">{renderField()}</div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={goBack}
              disabled={currentStep === 0 || submitting}
              className="h-13 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-900 transition hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <button
              onClick={goNext}
              disabled={submitting}
              className="h-13 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Adding..."
                : step.type === "review"
                ? "Add Mockup"
                : "Next"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}