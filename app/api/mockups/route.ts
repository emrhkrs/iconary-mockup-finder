import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("mockups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load mockups",
        error: error.message,
      },
      { status: 500 }
    );
  }

  const mockups = (data || []).map((item) => ({
    id: item.id,
    fileNumber: item.file_number,
    title: item.title,
    productType: item.product_type,
    brand: item.brand,
    color: item.color,
    modelType: item.model_type,
    view: item.view,
    styleTags: item.style_tags || "",
    season: item.season || "All Season",
    collection: item.collection || "",
    etsyListingId: item.etsy_listing_id || "",
    previewImage: item.preview_image,
    driveLink: item.drive_link,
    createdAt: item.created_at,
  }));

  return NextResponse.json({
    ok: true,
    mockups,
  });
}