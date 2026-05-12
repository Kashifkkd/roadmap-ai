import { NextResponse } from "next/server";

const TITLE_FALLBACK = "Title not available";

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitleFromHtml(html) {
  if (typeof html !== "string" || !html) return "";

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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      cache: "no-store",
      redirect: "follow",
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
