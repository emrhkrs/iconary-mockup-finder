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

type Mockup = {
  id: number;
  fileNumber: string;
  title: string;
  productType: string;
  brand: string;
  color: string;
  modelType: string;
  view: string;
  season: string;
  styleTags: string;
  collection: string;
  etsyListingId: string;
  previewImage: string;
  driveLink: string;
  createdAt: string;
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
    help: "Choose an existing product type or type a new one.",
    type: "combo",
    required: true,
    options: ["T-Shirt", "Sweatshirt", "Hoodie", "Baby Tee", "Kids T-Shirt", "Tote Bag"],
    placeholder: "T-Shirt",
  },
  {
    key: "brand",
    label: "Brand",
    help: "Choose an existing brand or type a new one.",
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
    help: "Choose an existing model type or type a new one.",
    type: "combo",
    required: true,
    options: ["Woman", "Man", "Kids", "Couple", "Group", "No Model"],
    placeholder: "Woman",
  },
  {
    key: "view",
    label: "View",
    help: "Choose an existing view or type a new one.",
    type: "combo",
    required: true,
    options: ["Front View", "Back View", "Flat Lay", "Close Up", "Chin Down", "Mirror View"],
    placeholder: "Front View",
  },
  {
    key: "season",
    label: "Season",
    help: "Choose an existing season/category or type a new one.",
    type: "combo",
    required: true,
    options: ["All Season", "Summer", "Spring", "Fall", "Winter", "Christmas", "Valentine", "Halloween"],
    placeholder: "All Season",
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

function mockupToAdminData(mockup: Mockup, password: string): AdminData {
  return {
    password,
    etsyUrl: "",
    etsyListingId: mockup.etsyListingId || "",
    productType: mockup.productType || "",
    brand: mockup.brand || "",
    color: mockup.color || "",
    modelType: mockup.modelType || "",
    view: mockup.view || "",
    season: mockup.season || "All Season",
    styleTags: mockup.styleTags || "",
    collection: mockup.collection || "",
    previewImage: mockup.previewImage || "",
    fileNumber: mockup.fileNumber || "",
    driveLink: mockup.driveLink || "",
    title: mockup.title || "",
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");

  const [data, setData] = useState<AdminData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [manageSearch, setManageSearch] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [editingMockup, setEditingMockup] = useState<Mockup | null>(null);
  const [editData, setEditData] = useState<AdminData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mockup | null>(null);

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

  function updateEditValue(key: keyof AdminData, value: string) {
    setEditData((current) => {
      if (!current) return current;

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

  async function loadMockups() {
    if (!data.password) {
      setMessage({
        type: "error",
        text: "Enter admin password first.",
      });
      return;
    }

    setManageLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/mockups?search=${encodeURIComponent(manageSearch)}`,
        {
          headers: {
            "x-admin-password": data.password,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to load mockups.");
      }

      setMockups(result.mockups || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setManageLoading(false);
    }
  }

  function startEdit(mockup: Mockup) {
    setEditingMockup(mockup);
    setEditData(mockupToAdminData(mockup, data.password));
    setDeleteTarget(null);
    setMessage(null);
  }

  async function saveEdit() {
    if (!editingMockup || !editData) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingMockup.id,
          ...editData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to update mockup.");
      }

      setMessage({
        type: "success",
        text: "Mockup updated successfully.",
      });

      setEditingMockup(null);
      setEditData(null);
      await loadMockups();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteTarget.id,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to delete mockup.");
      }

      setMessage({
        type: "success",
        text: "Mockup deleted successfully.",
      });

      setDeleteTarget(null);
      await loadMockups();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function renderAddField() {
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
  const listId = `${String(step.key)}-options`;

  return (
    <>
      <input
        list={listId}
        value={data[key]}
        onChange={(event) => updateValue(key, event.target.value)}
        placeholder={step.placeholder}
        className="h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
      />
      <datalist id={listId}>
        {(step.options || []).map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <p className="mt-3 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
        You can choose from the list or type a new value
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

  function EditInput({
    label,
    field,
    textarea = false,
  }: {
    label: string;
    field: keyof AdminData;
    textarea?: boolean;
  }) {
    if (!editData) return null;

    return (
      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-stone-400">
          {label}
        </label>
        {textarea ? (
          <textarea
            value={editData[field]}
            onChange={(event) => updateEditValue(field, event.target.value)}
            className="min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-stone-950"
          />
        ) : (
          <input
            value={editData[field]}
            onChange={(event) => updateEditValue(field, event.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
          />
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-8 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
            ICONARY
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
            Admin Panel
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
            Add, edit and delete mockups from one place.
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

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setActiveTab("add");
              setMessage(null);
            }}
            className={`rounded-2xl px-5 py-4 text-sm font-black transition ${
              activeTab === "add"
                ? "bg-stone-950 text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-950"
            }`}
          >
            Add New Mockup
          </button>

          <button
            onClick={() => {
              setActiveTab("manage");
              setMessage(null);
            }}
            className={`rounded-2xl px-5 py-4 text-sm font-black transition ${
              activeTab === "manage"
                ? "bg-stone-950 text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-950"
            }`}
          >
            Manage Mockups
          </button>
        </div>

        {message && (
          <div
            className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === "add" && (
          <>
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

              <div className="mt-5">{renderAddField()}</div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={goBack}
                  disabled={currentStep === 0 || submitting}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-900 transition hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                <button
                  onClick={goNext}
                  disabled={submitting}
                  className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Adding..."
                    : step.type === "review"
                    ? "Add Mockup"
                    : "Next"}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === "manage" && (
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={manageSearch}
                  onChange={(event) => setManageSearch(event.target.value)}
                  placeholder="Search by title, file number, Etsy ID, brand, color..."
                  className="h-14 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold outline-none focus:border-stone-950"
                />
                <button
                  onClick={loadMockups}
                  disabled={manageLoading}
                  className="rounded-2xl bg-stone-950 px-6 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {manageLoading ? "Loading..." : "Load Mockups"}
                </button>
              </div>
              <p className="mt-3 text-xs font-bold text-stone-500">
                Shows up to 300 latest matching mockups.
              </p>
            </div>

            {editingMockup && editData && (
              <div className="rounded-[2rem] border border-stone-300 bg-white p-5 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                      Editing
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight">
                      {editingMockup.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMockup(null);
                      setEditData(null);
                    }}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-xs font-black"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <EditInput label="Title" field="title" />
                  <EditInput label="Etsy Listing ID" field="etsyListingId" />
                  <EditInput label="Product Type" field="productType" />
                  <EditInput label="Brand" field="brand" />
                  <EditInput label="Color" field="color" />
                  <EditInput label="Model Type" field="modelType" />
                  <EditInput label="View" field="view" />
                  <EditInput label="Season" field="season" />
                  <EditInput label="Collection" field="collection" />
                  <EditInput label="File Number" field="fileNumber" />
                  <EditInput label="Preview Image" field="previewImage" />
                  <EditInput label="Drive Link" field="driveLink" />
                  <div className="md:col-span-2">
                    <EditInput label="Style Tags" field="styleTags" textarea />
                  </div>
                </div>

                <button
                  onClick={saveEdit}
                  disabled={submitting}
                  className="mt-5 w-full rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {deleteTarget && (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5">
                <h3 className="text-xl font-black text-red-900">
                  Delete this mockup?
                </h3>
                <p className="mt-2 text-sm font-bold text-red-700">
                  {deleteTarget.title}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={submitting}
                    className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
                  >
                    {submitting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {mockups.map((mockup) => (
                <article
                  key={mockup.id}
                  className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] bg-stone-100">
                    {mockup.previewImage ? (
                      <img
                        src={mockup.previewImage}
                        alt={mockup.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm font-bold text-stone-400">
                        No preview
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-2 text-base font-black">
                      {mockup.title}
                    </h3>

                    <div className="rounded-2xl bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600">
                      {mockup.fileNumber}
                    </div>

                    <p className="text-xs font-bold text-stone-500">
                      {mockup.brand} · {mockup.color} · {mockup.productType}
                    </p>

                    <p className="text-xs font-bold text-stone-400">
                      Etsy ID: {mockup.etsyListingId || "Empty"}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => startEdit(mockup)}
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-black transition hover:border-stone-950"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(mockup);
                          setEditingMockup(null);
                          setEditData(null);
                        }}
                        className="rounded-2xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {mockups.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
                <h3 className="text-2xl font-black">No mockups loaded</h3>
                <p className="mt-2 text-sm font-bold text-stone-500">
                  Enter your admin password and click Load Mockups.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}