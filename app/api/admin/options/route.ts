import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const fallbackOptions = {
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
  ],
  modelTypes: [
    "Woman",
    "Man",
    "Kids",
    "Couple",
    "Group",
    "No Model",
  ],
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
    "Comfort Colors T-Shirt",
    "Gildan 5000B Baby Tee",
    "Gildan Sweatshirt",
    "Bella Canvas T-Shirt",
  ],
};

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map(cleanText).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function mergeOptions(fallback: string[], dynamic: string[]) {
  return uniqueSorted([...fallback, ...dynamic]);
}

function checkPassword(password?: string | null) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD is missing." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "Invalid admin password." },
      { status: 401 }
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  const authError = checkPassword(password);

  if (authError) {
    return authError;
  }

  const { data, error } = await supabaseAdmin
    .from("mockups")
    .select(
      "product_type, brand, color, model_type, view, season, collection"
    )
    .range(0, 9999);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load admin options.",
        error: error.message,
      },
      { status: 500 }
    );
  }

  const rows = data || [];

  const options = {
    productTypes: mergeOptions(
      fallbackOptions.productTypes,
      rows.map((item) => item.product_type)
    ),
    brands: mergeOptions(
      fallbackOptions.brands,
      rows.map((item) => item.brand)
    ),
    colors: mergeOptions(
      fallbackOptions.colors,
      rows.map((item) => item.color)
    ),
    modelTypes: mergeOptions(
      fallbackOptions.modelTypes,
      rows.map((item) => item.model_type)
    ),
    views: mergeOptions(
      fallbackOptions.views,
      rows.map((item) => item.view)
    ),
    seasons: mergeOptions(
      fallbackOptions.seasons,
      rows.map((item) => item.season)
    ),
    collections: mergeOptions(
      fallbackOptions.collections,
      rows.map((item) => item.collection)
    ),
  };

  return NextResponse.json({
    ok: true,
    options,
  });
}