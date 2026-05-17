import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

type AdminMockupInput = {
  password?: string;
  fileNumber?: string;
  title?: string;
  productType?: string;
  brand?: string;
  color?: string;
  modelType?: string;
  view?: string;
  styleTags?: string;
  season?: string;
  collection?: string;
  etsyUrl?: string;
  etsyListingId?: string;
  previewImage?: string;
  driveLink?: string;
};

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeValue(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/.,:;()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: unknown) {
  const cleaned = cleanText(value);

  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeProductType(value: unknown, fileNumber: unknown) {
  const text = normalizeValue(`${value} ${fileNumber}`);

  if (text.includes("baby tee") || text.includes("5000b")) return "Baby Tee";
  if (text.includes("kids") || text.includes("youth")) return "Kids T-Shirt";
  if (text.includes("hoodie")) return "Hoodie";
  if (text.includes("sweatshirt") || text.includes("sweat")) return "Sweatshirt";
  if (text.includes("tote")) return "Tote Bag";
  if (
    text.includes("t shirt") ||
    text.includes("tshirt") ||
    text.includes("tee") ||
    text.includes("c1717")
  ) {
    return "T-Shirt";
  }

  return titleCase(value);
}

function normalizeBrand(value: unknown, fileNumber: unknown) {
  const text = normalizeValue(`${value} ${fileNumber}`);

  if (
    text.includes("comfort colors") ||
    text.includes("comfort color") ||
    text.includes("c1717")
  ) {
    return "Comfort Colors";
  }

  if (text.includes("bella canvas") || text.includes("bella")) {
    return "Bella Canvas";
  }

  if (text.includes("gildan") || text.includes("5000b") || text.includes("18000")) {
    return "Gildan";
  }

  if (!cleanText(value)) return "Generic";

  return titleCase(value);
}

function normalizeModelType(value: unknown) {
  const text = normalizeValue(value);

  if (text.includes("women") || text.includes("woman") || text.includes("female")) return "Woman";
  if (text.includes("men") || text.includes("man") || text.includes("male")) return "Man";
  if (text.includes("kid") || text.includes("child") || text.includes("youth")) return "Kids";
  if (text.includes("couple")) return "Couple";
  if (text.includes("group")) return "Group";
  if (text.includes("no model") || text.includes("flat lay")) return "No Model";

  return titleCase(value);
}

function normalizeView(value: unknown) {
  const text = normalizeValue(value);

  if (text.includes("front")) return "Front View";
  if (text.includes("back")) return "Back View";
  if (text.includes("flat")) return "Flat Lay";
  if (text.includes("close")) return "Close Up";
  if (text.includes("chin")) return "Chin Down";
  if (text.includes("mirror")) return "Mirror View";

  return titleCase(value);
}

function normalizeSeason(value: unknown) {
  const text = normalizeValue(value);

  if (!text) return "All Season";
  if (text.includes("summer")) return "Summer";
  if (text.includes("spring")) return "Spring";
  if (text.includes("fall") || text.includes("autumn")) return "Fall";
  if (text.includes("winter")) return "Winter";
  if (text.includes("christmas") || text.includes("xmas")) return "Christmas";
  if (text.includes("valentine")) return "Valentine";
  if (text.includes("halloween")) return "Halloween";

  return titleCase(value);
}

function extractEtsyListingId(value: unknown) {
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
    const body = (await request.json()) as AdminMockupInput;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          ok: false,
          message: "ADMIN_PASSWORD is missing in .env.local",
        },
        { status: 500 }
      );
    }

    if (body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid admin password",
        },
        { status: 401 }
      );
    }

    const etsyListingId =
      cleanText(body.etsyListingId) || extractEtsyListingId(body.etsyUrl);

    const cleaned = {
      file_number: cleanText(body.fileNumber),
      product_type: normalizeProductType(body.productType, body.fileNumber),
      brand: normalizeBrand(body.brand, body.fileNumber),
      color: titleCase(body.color),
      model_type: normalizeModelType(body.modelType),
      view: normalizeView(body.view),
      season: normalizeSeason(body.season),
      collection: cleanText(body.collection),
      etsy_listing_id: etsyListingId,
      preview_image: cleanText(body.previewImage),
      drive_link: cleanText(body.driveLink),
      title: cleanText(body.title),
      style_tags: cleanText(body.styleTags),
    };

    if (!cleaned.file_number) throw new Error("File number is required.");
    if (!cleaned.product_type) throw new Error("Product type is required.");
    if (!cleaned.brand) throw new Error("Brand is required.");
    if (!cleaned.color) throw new Error("Color is required.");
    if (!cleaned.model_type) throw new Error("Model type is required.");
    if (!cleaned.view) throw new Error("View is required.");
    if (!cleaned.preview_image) throw new Error("Preview image link is required.");
    if (!cleaned.drive_link) throw new Error("Drive link is required.");

    if (!cleaned.collection) {
      cleaned.collection = generateCollection({
        brand: cleaned.brand,
        productType: cleaned.product_type,
        season: cleaned.season,
      });
    }

    if (!cleaned.title) {
      cleaned.title = generateTitle({
        brand: cleaned.brand,
        color: cleaned.color,
        modelType: cleaned.model_type,
        season: cleaned.season,
        view: cleaned.view,
        productType: cleaned.product_type,
      });
    }

    if (!cleaned.style_tags) {
      cleaned.style_tags = generateStyleTags({
        productType: cleaned.product_type,
        brand: cleaned.brand,
        color: cleaned.color,
        modelType: cleaned.model_type,
        view: cleaned.view,
        season: cleaned.season,
        collection: cleaned.collection,
        etsyListingId: cleaned.etsy_listing_id,
      });
    }

    const { data: existingFile } = await supabaseAdmin
      .from("mockups")
      .select("id")
      .eq("file_number", cleaned.file_number)
      .maybeSingle();

    if (existingFile) {
      return NextResponse.json(
        {
          ok: false,
          message: "This file number already exists.",
        },
        { status: 409 }
      );
    }

    if (cleaned.etsy_listing_id) {
      const { data: existingEtsy } = await supabaseAdmin
        .from("mockups")
        .select("id")
        .eq("etsy_listing_id", cleaned.etsy_listing_id)
        .maybeSingle();

      if (existingEtsy) {
        return NextResponse.json(
          {
            ok: false,
            message: "This Etsy Listing ID already exists.",
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("mockups")
      .insert(cleaned)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to add mockup",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Mockup added successfully",
      mockup: data,
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