import { NextResponse } from "next/server";

const TITLE_FALLBACK = "Title not available";

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitleFromHtml(html) {
  if (typeof html !== "string" || !html) return "";

  const ogTitleMatch = html.match(
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  if (ogTitleMatch?.[1]) {
    return normalizeWhitespace(ogTitleMatch[1]);
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return normalizeWhitespace(titleMatch[1]);
  }

  return "";
}

export async function GET(request) {
  try {
    const urlParam = request.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json(
        { title: TITLE_FALLBACK, error: "Missing url query param" },
        { status: 400 },
      );
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(urlParam);
    } catch {
      return NextResponse.json(
        { title: TITLE_FALLBACK, error: "Invalid URL" },
        { status: 400 },
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { title: TITLE_FALLBACK, error: "Only http/https supported" },
        { status: 400 },
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KyperTitleFetcher/1.0; +https://kyper-stage.1st90.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { title: TITLE_FALLBACK, error: `Upstream status ${response.status}` },
        { status: 200 },
      );
    }

    const html = await response.text();
    const title = extractTitleFromHtml(html) || TITLE_FALLBACK;
    return NextResponse.json({ title });
  } catch (error) {
    console.error("fetch-page-title route error:", error);
    return NextResponse.json({ title: TITLE_FALLBACK }, { status: 200 });
  }
}
