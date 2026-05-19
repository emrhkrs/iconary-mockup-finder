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

type AdminOptions = {
  productTypes: string[];
  brands: string[];
  colors: string[];
  modelTypes: string[];
  views: string[];
  seasons: string[];
  collections: string[];
};

const initialData: AdminData = {
  password: "",
  etsyUrl: "",
  etsyListingId: "",
  productType: "",
  brand: "",
  color: "",
  modelType: "Woman",
  view: "Front View",
  season: "All Season",
  styleTags: "",
  collection: "",
  previewImage: "",
  fileNumber: "",
  driveLink: "",
  title: "",
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

const presets = [
  {
    label: "Comfort Colors C1717",
    values: {
      productType: "T-Shirt",
      brand: "Comfort Colors",
      collection: "Comfort Colors C1717",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
  {
    label: "Bella Canvas 3001",
    values: {
      productType: "T-Shirt",
      brand: "Bella Canvas",
      collection: "Bella Canvas 3001",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
  {
    label: "Gildan 5000",
    values: {
      productType: "T-Shirt",
      brand: "Gildan",
      collection: "Gildan 5000",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
  {
    label: "Gildan 5000B Baby Tee",
    values: {
      productType: "Baby Tee",
      brand: "Gildan",
      collection: "Gildan 5000B Baby Tee",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
  {
    label: "Gildan Sweatshirt",
    values: {
      productType: "Sweatshirt",
      brand: "Gildan",
      collection: "Gildan Sweatshirt",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
  {
    label: "Tote Bag",
    values: {
      productType: "Tote Bag",
      brand: "Generic",
      collection: "Tote Bag Lifestyle Bundle",
      modelType: "Woman",
      view: "Front View",
      season: "All Season",
    },
  },
];

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

function titleCase(value: unknown) {
  const cleaned = cleanText(value);

  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
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

  return inferColor(fileNumber);
}

function inferFromFileNumber(fileNumber: string): Partial<AdminData> {
  const code = getFileCode(fileNumber);
  const color = getColorFromFileNumber(fileNumber);

  const result: Partial<AdminData> = {};

  if (color) {
    result.color = color;
  }

  if (code === "c1717") {
    result.brand = "Comfort Colors";
    result.productType = "T-Shirt";
    result.collection = "Comfort Colors C1717";
  }

  if (code === "3001") {
    result.brand = "Bella Canvas";
    result.productType = "T-Shirt";
    result.collection = "Bella Canvas 3001";
  }

  if (code === "5000") {
    result.brand = "Gildan";
    result.productType = "T-Shirt";
    result.collection = "Gildan 5000";
  }

  if (code === "5000b") {
    result.brand = "Gildan";
    result.productType = "Baby Tee";
    result.collection = "Gildan 5000B Baby Tee";
  }

  return result;
}

function inferProductType(text: string) {
  const n = normalize(text);

  if (n.includes("baby tee") || n.includes("5000b")) return "Baby Tee";
  if (n.includes("sweatshirt") || n.includes("sweat shirt")) return "Sweatshirt";
  if (n.includes("hoodie")) return "Hoodie";
  if (n.includes("kids") || n.includes("youth")) return "Kids T-Shirt";
  if (n.includes("tote") || n.includes("bag")) return "Tote Bag";
  if (n.includes("long sleeve")) return "Long Sleeve";
  if (n.includes("tank top")) return "Tank Top";

  if (
    n.includes("t shirt") ||
    n.includes("tshirt") ||
    n.includes("tee") ||
    n.includes("c1717") ||
    n.includes("3001") ||
    n.includes("5000")
  ) {
    return "T-Shirt";
  }

  return "";
}

function inferBrand(text: string) {
  const n = normalize(text);

  if (
    n.includes("comfort colors") ||
    n.includes("comfort color") ||
    n.includes("c1717")
  ) {
    return "Comfort Colors";
  }

  if (n.includes("bella canvas") || n.includes("bella") || n.includes("3001")) {
    return "Bella Canvas";
  }

  if (
    n.includes("gildan") ||
    n.includes("5000b") ||
    n.includes("5000") ||
    n.includes("18000")
  ) {
    return "Gildan";
  }

  if (n.includes("independent trading")) return "Independent Trading Co.";
  if (n.includes("jerzees")) return "Jerzees";

  return "";
}

function inferColor(text: string) {
  const n = normalize(text);

  const colors = [
    "light green",
    "blue jean",
    "true navy",
    "flo blue",
    "blue spruce",
    "island reef",
    "white",
    "ivory",
    "black",
    "orchid",
    "maroon",
    "pepper",
    "moss",
    "espresso",
    "terracotta",
    "crunchberry",
    "crimson",
    "seafoam",
    "bay",
    "khaki",
    "chambray",
    "berry",
    "violet",
    "grey",
    "gray",
    "blossom",
    "butter",
    "red",
    "mustard",
    "watermelon",
    "lagoon",
    "sage",
    "sand",
    "ash",
    "natural",
    "cream",
  ];

  const found = colors.find((color) => n.includes(color));

  if (!found) return "";
  if (found === "gray") return "Grey";

  return titleCase(found);
}

function inferModelType(text: string) {
  const n = normalize(text);

  if (
    n.includes("woman") ||
    n.includes("women") ||
    n.includes("female") ||
    n.includes("girl")
  ) {
    return "Woman";
  }

  if (
    n.includes("man") ||
    n.includes("men") ||
    n.includes("male") ||
    n.includes("boy")
  ) {
    return "Man";
  }

  if (n.includes("kids") || n.includes("youth") || n.includes("child")) {
    return "Kids";
  }

  if (n.includes("couple")) return "Couple";
  if (n.includes("group")) return "Group";
  if (n.includes("flat lay")) return "No Model";

  return "";
}

function inferView(text: string) {
  const n = normalize(text);

  if (n.includes("back view") || n.includes("back mockup")) return "Back View";
  if (n.includes("front view") || n.includes("front mockup")) return "Front View";
  if (n.includes("flat lay")) return "Flat Lay";
  if (n.includes("close up") || n.includes("closeup")) return "Close Up";
  if (n.includes("chin down")) return "Chin Down";
  if (n.includes("mirror")) return "Mirror View";
  if (n.includes("side view")) return "Side View";

  return "";
}

function inferSeason(text: string) {
  const n = normalize(text);

  if (n.includes("summer") || n.includes("beach") || n.includes("coastal")) {
    return "Summer";
  }

  if (n.includes("spring")) return "Spring";
  if (n.includes("fall") || n.includes("autumn")) return "Fall";
  if (n.includes("winter")) return "Winter";
  if (n.includes("christmas") || n.includes("xmas")) return "Christmas";
  if (n.includes("valentine")) return "Valentine";
  if (n.includes("halloween")) return "Halloween";
  if (n.includes("graduation")) return "Graduation";
  if (n.includes("wedding") || n.includes("bride") || n.includes("bridal")) {
    return "Wedding";
  }

  return "";
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

function prepareData(data: AdminData): AdminData {
  const sourceText = [
    data.etsyUrl,
    data.fileNumber,
    data.title,
    data.collection,
    data.styleTags,
  ].join(" ");

  const fileNumberData = inferFromFileNumber(data.fileNumber);

  const etsyListingId =
    data.etsyListingId || extractEtsyListingId(data.etsyUrl);

  const productType =
    data.productType || fileNumberData.productType || inferProductType(sourceText);

  const brand = data.brand || fileNumberData.brand || inferBrand(sourceText);

  const color = data.color || fileNumberData.color || inferColor(sourceText);

  const modelType =
    data.modelType ||
    fileNumberData.modelType ||
    inferModelType(sourceText) ||
    "Woman";

  const view =
    data.view || fileNumberData.view || inferView(sourceText) || "Front View";

  const season =
    data.season ||
    fileNumberData.season ||
    inferSeason(sourceText) ||
    "All Season";

  const collection =
    data.collection ||
    fileNumberData.collection ||
    generateCollection({
      brand,
      productType,
      season,
    });

  const title =
    data.title ||
    generateTitle({
      brand,
      color,
      modelType,
      season,
      view,
      productType,
    });

  const styleTags =
    data.styleTags ||
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
    ...data,
    etsyListingId,
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

function mockupToAdminData(mockup: Mockup, password: string): AdminData {
  return {
    password,
    etsyUrl: "",
    etsyListingId: mockup.etsyListingId || "",
    productType: mockup.productType || "",
    brand: mockup.brand || "",
    color: mockup.color || "",
    modelType: mockup.modelType || "Woman",
    view: mockup.view || "Front View",
    season: mockup.season || "All Season",
    styleTags: mockup.styleTags || "",
    collection: mockup.collection || "",
    previewImage: mockup.previewImage || "",
    fileNumber: mockup.fileNumber || "",
    driveLink: mockup.driveLink || "",
    title: mockup.title || "",
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

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<"quick" | "manage">("quick");

  const [data, setData] = useState<AdminData>(initialData);
  const [lastEntry, setLastEntry] = useState<AdminData | null>(null);
  const [options, setOptions] = useState<AdminOptions>(fallbackOptions);

  const [manageSearch, setManageSearch] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [editingMockup, setEditingMockup] = useState<Mockup | null>(null);
  const [editData, setEditData] = useState<AdminData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mockup | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const previewData = useMemo(() => prepareData(data), [data]);

  function update<K extends keyof AdminData>(key: K, value: AdminData[K]) {
    setMessage(null);

    setData((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "etsyUrl") {
        const id = extractEtsyListingId(String(value));

        if (id) {
          next.etsyListingId = id;
        }
      }

      if (key === "fileNumber") {
        const fileNumberData = inferFromFileNumber(String(value));

        if (!next.productType && fileNumberData.productType) {
          next.productType = fileNumberData.productType;
        }

        if (!next.brand && fileNumberData.brand) {
          next.brand = fileNumberData.brand;
        }

        if (!next.color && fileNumberData.color) {
          next.color = fileNumberData.color;
        }

        if (!next.collection && fileNumberData.collection) {
          next.collection = fileNumberData.collection;
        }
      }

      return next;
    });
  }

  function updateEdit<K extends keyof AdminData>(key: K, value: AdminData[K]) {
    setMessage(null);

    setEditData((current) => {
      if (!current) return current;

      const next = {
        ...current,
        [key]: value,
      };

      if (key === "etsyUrl") {
        const id = extractEtsyListingId(String(value));

        if (id) {
          next.etsyListingId = id;
        }
      }

      if (key === "fileNumber") {
        const fileNumberData = inferFromFileNumber(String(value));

        if (!next.productType && fileNumberData.productType) {
          next.productType = fileNumberData.productType;
        }

        if (!next.brand && fileNumberData.brand) {
          next.brand = fileNumberData.brand;
        }

        if (!next.color && fileNumberData.color) {
          next.color = fileNumberData.color;
        }

        if (!next.collection && fileNumberData.collection) {
          next.collection = fileNumberData.collection;
        }
      }

      return next;
    });
  }

  function applyPreset(values: Partial<AdminData>) {
    setData((current) => ({
      ...current,
      ...values,
    }));

    setMessage({
      type: "success",
      text: "Preset applied. Now add file number, drive link and preview image.",
    });
  }

  function generateMissingFields() {
    const generated = prepareData(data);

    setData(generated);

    setMessage({
      type: "success",
      text: "Missing fields generated from file number, Etsy link and selected values.",
    });
  }

  function duplicateLastEntry() {
    if (!lastEntry) {
      setMessage({
        type: "error",
        text: "No previous entry found yet.",
      });
      return;
    }

    setData({
      ...lastEntry,
      password: data.password,
      etsyUrl: "",
      etsyListingId: "",
      fileNumber: "",
      driveLink: "",
      previewImage: "",
      color: "",
      title: "",
      styleTags: "",
    });

    setMessage({
      type: "success",
      text: "Last entry duplicated. Add new color, file number, preview image and drive link.",
    });
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

  async function saveMockup(addAnother: boolean) {
    const payload = prepareData(data);

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/mockups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || result.error || "Failed to save mockup.");
      }

      setLastEntry(payload);

      setMessage({
        type: "success",
        text: `Mockup saved successfully: ${result.mockup.title}`,
      });

      if (addAnother) {
        setData({
          ...initialData,
          password: data.password,
          productType: payload.productType,
          brand: payload.brand,
          modelType: payload.modelType,
          view: payload.view,
          season: payload.season,
          collection: payload.collection,
        });
      } else {
        setData(payload);
      }

      await loadOptions();
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

    const payload = prepareData(editData);

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
          ...payload,
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
      await loadOptions();
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
      await loadOptions();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function EditField({
    label,
    field,
    optionsList = [],
    listId,
    textarea = false,
  }: {
    label: string;
    field: keyof AdminData;
    optionsList?: string[];
    listId?: string;
    textarea?: boolean;
  }) {
    if (!editData) return null;

    return (
      <Field
        label={label}
        value={editData[field]}
        onChange={(value) => updateEdit(field, value)}
        options={optionsList}
        listId={listId}
        textarea={textarea}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-8 text-stone-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
            ICONARY
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
            Manage Mockups
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Quickly add new mockups, duplicate recent entries, edit records and delete wrong items.
          </p>
        </div>

        <div className="mb-5 rounded-[2rem] border border-stone-200 bg-white/75 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field
              label="Admin Password"
              value={data.password}
              onChange={(value) => update("password", value)}
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

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setActiveTab("quick");
              setMessage(null);
            }}
            className={`rounded-2xl px-5 py-4 text-sm font-black transition ${
              activeTab === "quick"
                ? "bg-stone-950 text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-950"
            }`}
          >
            Quick Add
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
            Manage Existing
          </button>
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

        {activeTab === "quick" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-5 rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-xl shadow-stone-900/5">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Presets
                </p>

                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset.values)}
                      className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Etsy Link"
                  value={data.etsyUrl}
                  onChange={(value) => update("etsyUrl", value)}
                  placeholder="https://www.etsy.com/listing/..."
                />

                <Field
                  label="Etsy Listing ID"
                  value={data.etsyListingId}
                  onChange={(value) => update("etsyListingId", value)}
                  placeholder="4443981460"
                />

                <Field
                  label="File Number"
                  value={data.fileNumber}
                  onChange={(value) => update("fileNumber", value)}
                  placeholder="716248976124chambray.c1717"
                />

                <Field
                  label="Drive Link"
                  value={data.driveLink}
                  onChange={(value) => update("driveLink", value)}
                  placeholder="https://drive.google.com/file/d/..."
                />

                <Field
                  label="Preview Image"
                  value={data.previewImage}
                  onChange={(value) => update("previewImage", value)}
                  placeholder="https://i.etsystatic.com/..."
                />

                <Field
                  label="Color"
                  value={data.color}
                  onChange={(value) => update("color", value)}
                  options={options.colors}
                  listId="quick-color-options"
                  placeholder="Chambray"
                />

                <Field
                  label="Product Type"
                  value={data.productType}
                  onChange={(value) => update("productType", value)}
                  options={options.productTypes}
                  listId="quick-product-type-options"
                  placeholder="T-Shirt"
                />

                <Field
                  label="Brand"
                  value={data.brand}
                  onChange={(value) => update("brand", value)}
                  options={options.brands}
                  listId="quick-brand-options"
                  placeholder="Comfort Colors"
                />

                <Field
                  label="Model Type"
                  value={data.modelType}
                  onChange={(value) => update("modelType", value)}
                  options={options.modelTypes}
                  listId="quick-model-type-options"
                  placeholder="Woman"
                />

                <Field
                  label="View"
                  value={data.view}
                  onChange={(value) => update("view", value)}
                  options={options.views}
                  listId="quick-view-options"
                  placeholder="Front View"
                />

                <Field
                  label="Season"
                  value={data.season}
                  onChange={(value) => update("season", value)}
                  options={options.seasons}
                  listId="quick-season-options"
                  placeholder="All Season"
                />

                <Field
                  label="Collection"
                  value={data.collection}
                  onChange={(value) => update("collection", value)}
                  options={options.collections}
                  listId="quick-collection-options"
                  placeholder="Comfort Colors C1717"
                />

                <div className="md:col-span-2">
                  <Field
                    label="Title"
                    value={data.title}
                    onChange={(value) => update("title", value)}
                    placeholder="Leave empty to auto-generate"
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Style Tags"
                    value={data.styleTags}
                    onChange={(value) => update("styleTags", value)}
                    textarea
                    placeholder="Leave empty to auto-generate"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <button
                  onClick={generateMissingFields}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 transition hover:border-stone-950"
                >
                  Generate Missing Fields
                </button>

                <button
                  onClick={duplicateLastEntry}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 transition hover:border-stone-950"
                >
                  Duplicate Last Entry
                </button>

                <button
                  onClick={() => saveMockup(true)}
                  disabled={submitting}
                  className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save & Add Another"}
                </button>

                <button
                  onClick={() => saveMockup(false)}
                  disabled={submitting}
                  className="rounded-2xl bg-stone-800 px-4 py-3 text-sm font-black text-white transition hover:bg-stone-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Mockup"}
                </button>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Live Preview
              </p>

              <div className="overflow-hidden rounded-[1.5rem] bg-stone-100">
                {previewData.previewImage ? (
                  <img
                    src={previewData.previewImage}
                    alt={previewData.title || "Preview"}
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
                  {previewData.title || "Untitled Mockup"}
                </h2>

                <div className="rounded-2xl bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600">
                  {previewData.fileNumber || "No file number"}
                </div>

                <p className="text-sm font-bold text-stone-600">
                  {previewData.brand || "Brand"} · {previewData.color || "Color"} ·{" "}
                  {previewData.productType || "Product"}
                </p>

                <p className="text-xs font-bold text-stone-400">
                  {previewData.collection || "Collection"}
                </p>

                <p className="break-words text-xs font-semibold leading-5 text-stone-500">
                  {previewData.styleTags || "Style tags will appear here"}
                </p>
              </div>
            </aside>
          </div>
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
                  <EditField label="Title" field="title" />
                  <EditField label="Etsy Listing ID" field="etsyListingId" />
                  <EditField
                    label="Product Type"
                    field="productType"
                    optionsList={options.productTypes}
                    listId="edit-product-type-options"
                  />
                  <EditField
                    label="Brand"
                    field="brand"
                    optionsList={options.brands}
                    listId="edit-brand-options"
                  />
                  <EditField
                    label="Color"
                    field="color"
                    optionsList={options.colors}
                    listId="edit-color-options"
                  />
                  <EditField
                    label="Model Type"
                    field="modelType"
                    optionsList={options.modelTypes}
                    listId="edit-model-type-options"
                  />
                  <EditField
                    label="View"
                    field="view"
                    optionsList={options.views}
                    listId="edit-view-options"
                  />
                  <EditField
                    label="Season"
                    field="season"
                    optionsList={options.seasons}
                    listId="edit-season-options"
                  />
                  <EditField
                    label="Collection"
                    field="collection"
                    optionsList={options.collections}
                    listId="edit-collection-options"
                  />
                  <EditField label="File Number" field="fileNumber" />
                  <EditField label="Preview Image" field="previewImage" />
                  <EditField label="Drive Link" field="driveLink" />

                  <div className="md:col-span-2">
                    <EditField label="Style Tags" field="styleTags" textarea />
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