import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from("mockups")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Supabase connection works",
    mockupCount: count ?? 0,
  });
}