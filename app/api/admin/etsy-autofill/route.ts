import { NextRequest, NextResponse } from "next/server";

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
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

function extractSlugFromEtsyUrl(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    const listingIndex = parts.findIndex((part) => part === "listing");

    if (listingIndex >= 0 && parts[listingIndex + 2]) {
      return parts[listingIndex + 2].replace(/-/g, " ");
    }

    return "";
  } catch {
    return "";
  }
}

function getMetaContent(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return cleanText(match[1]);
    }
  }

  return "";
}

function getTitleFromHtml(html: string) {
  const ogTitle = getMetaContent(html, "og:title");
  const twitterTitle = getMetaContent(html, "twitter:title");
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);

  return cleanText(ogTitle || twitterTitle || titleMatch?.[1] || "");
}

function getImageFromHtml(html: string) {
  return cleanText(
    getMetaContent(html, "og:image") ||
      getMetaContent(html, "twitter:image") ||
      ""
  );
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
  if (n.includes("t shirt") || n.includes("tshirt") || n.includes("tee") || n.includes("c1717")) {
    return "T-Shirt";
  }

  return "";
}

function inferBrand(text: string) {
  const n = normalize(text);

  if (n.includes("comfort colors") || n.includes("comfort color") || n.includes("c1717")) {
    return "Comfort Colors";
  }

  if (n.includes("gildan") || n.includes("5000b") || n.includes("18000")) {
    return "Gildan";
  }

  if (n.includes("bella canvas") || n.includes("bella")) {
    return "Bella Canvas";
  }

  if (n.includes("independent trading")) {
    return "Independent Trading Co.";
  }

  if (n.includes("jerzees")) {
    return "Jerzees";
  }

  return "";
}

function inferModelType(text: string) {
  const n = normalize(text);

  if (n.includes("woman") || n.includes("women") || n.includes("female") || n.includes("girl")) {
    return "Woman";
  }

  if (n.includes("man") || n.includes("men") || n.includes("male") || n.includes("boy")) {
    return "Man";
  }

  if (n.includes("kids") || n.includes("youth") || n.includes("child")) {
    return "Kids";
  }

  if (n.includes("couple")) return "Couple";
  if (n.includes("group")) return "Group";
  if (n.includes("flat lay")) return "No Model";

  return "Woman";
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

  return "Front View";
}

function inferSeason(text: string) {
  const n = normalize(text);

  if (n.includes("summer") || n.includes("beach") || n.includes("coastal")) return "Summer";
  if (n.includes("spring")) return "Spring";
  if (n.includes("fall") || n.includes("autumn")) return "Fall";
  if (n.includes("winter")) return "Winter";
  if (n.includes("christmas") || n.includes("xmas")) return "Christmas";
  if (n.includes("valentine")) return "Valentine";
  if (n.includes("halloween")) return "Halloween";
  if (n.includes("graduation")) return "Graduation";
  if (n.includes("wedding") || n.includes("bride") || n.includes("bridal")) return "Wedding";

  return "All Season";
}

function inferColor(text: string) {
  const n = normalize(text);

  const colors = [
    "white",
    "ivory",
    "black",
    "orchid",
    "light green",
    "maroon",
    "pepper",
    "moss",
    "espresso",
    "blue jean",
    "terracotta",
    "crunchberry",
    "crimson",
    "flo blue",
    "true navy",
    "seafoam",
    "bay",
    "khaki",
    "chambray",
    "berry",
    "violet",
    "blue spruce",
    "grey",
    "gray",
    "blossom",
    "butter",
    "red",
    "mustard",
    "watermelon",
    "lagoon",
    "island reef",
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

function generateCollection(item: {
  brand: string;
  productType: string;
  season: string;
}) {
  if (item.brand && item.productType && item.season && item.season !== "All Season") {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, message: "ADMIN_PASSWORD is missing." },
        { status: 500 }
      );
    }

    if (body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, message: "Invalid admin password." },
        { status: 401 }
      );
    }

    const etsyUrl = cleanText(body.etsyUrl);

    if (!etsyUrl) {
      return NextResponse.json(
        { ok: false, message: "Etsy product link is required." },
        { status: 400 }
      );
    }

    const etsyListingId = extractEtsyListingId(etsyUrl);
    const slug = extractSlugFromEtsyUrl(etsyUrl);

    let fetchedTitle = "";
    let previewImage = "";

    try {
      const response = await fetch(etsyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const html = await response.text();
        fetchedTitle = getTitleFromHtml(html);
        previewImage = getImageFromHtml(html);
      }
    } catch {
      // We still continue with the listing ID and slug.
    }

    const sourceText = [fetchedTitle, slug, etsyUrl].filter(Boolean).join(" ");

    const productType = inferProductType(sourceText);
    const brand = inferBrand(sourceText);
    const color = inferColor(sourceText);
    const modelType = inferModelType(sourceText);
    const view = inferView(sourceText);
    const season = inferSeason(sourceText);

    const collection = generateCollection({
      brand,
      productType,
      season,
    });

    const title = generateTitle({
      brand,
      color,
      modelType,
      season,
      view,
      productType,
    });

    const styleTags = generateStyleTags({
      productType,
      brand,
      color,
      modelType,
      view,
      season,
      collection,
      etsyListingId,
    });

    return NextResponse.json({
      ok: true,
      suggestion: {
        etsyUrl,
        etsyListingId,
        originalTitle: fetchedTitle,
        title: title || fetchedTitle || slug,
        productType,
        brand,
        color,
        modelType,
        view,
        season,
        collection,
        styleTags,
        previewImage,
      },
      warning:
        fetchedTitle || previewImage
          ? ""
          : "Could not fetch Etsy page details. Fields were inferred from the URL only.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}