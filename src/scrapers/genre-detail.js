const cheerio = require("cheerio");
const {
  BASE_URL,
  fetchHtml,
  getAbsoluteUrl,
  normalizeText,
  cleanTitle,
  getImageUrl,
  extractMangaSlug,
  getApiChapterLink,
  logEmptyParse,
  findHtmxUrl,
} = require("../core/scraperUtils");

function parseMangaCard($, el) {
  const card = $(el);
  const mangaLinkElement =
    card
      .find('h3 a[href*="/manga/"], h2 a[href*="/manga/"], h4 a[href*="/manga/"]')
      .first()
      .length
      ? card
          .find('h3 a[href*="/manga/"], h2 a[href*="/manga/"], h4 a[href*="/manga/"]')
          .first()
      : card.find('a[href*="/manga/"]').first();
  const mangaLink = getAbsoluteUrl(mangaLinkElement.attr("href"));
  const mangaSlug = extractMangaSlug(mangaLink);
  const img = card.find('a[href*="/manga/"] img, img').first();
  const type = normalizeText(card.find(".tpe1_inf b, .tpe1_inf strong").first().text());
  const typeGenreText = normalizeText(card.find(".tpe1_inf").first().text());
  const chapterElements = card.find('a[href*="chapter"]').toArray();
  const firstChapterElement = chapterElements.length ? $(chapterElements[0]) : null;
  const latestChapterElement = chapterElements.length
    ? $(chapterElements[chapterElements.length - 1])
    : null;

  return {
    title:
      cleanTitle(card.find("h3, h2, h4").first().text()) ||
      cleanTitle(mangaLinkElement.attr("title")) ||
      cleanTitle(img.attr("alt")),
    slug: mangaSlug,
    type,
    genre: typeGenreText.replace(type, "").trim(),
    thumbnail: getImageUrl($, img),
    description: normalizeText(card.find("p").first().text()),
    additionalInfo: normalizeText(card.find(".judul2").first().text()),
    updateStatus: normalizeText(card.find(".up").first().text()),
    apiMangaLink: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
    chapters: {
      first: firstChapterElement
        ? {
            chapter:
              normalizeText(firstChapterElement.text()) ||
              normalizeText(firstChapterElement.attr("title")),
            link: getAbsoluteUrl(firstChapterElement.attr("href")),
            apiLink: getApiChapterLink(firstChapterElement.attr("href")),
          }
        : null,
      latest: latestChapterElement
        ? {
            chapter:
              normalizeText(latestChapterElement.text()) ||
              normalizeText(latestChapterElement.attr("title")),
            link: getAbsoluteUrl(latestChapterElement.attr("href")),
            apiLink: getApiChapterLink(latestChapterElement.attr("href")),
          }
        : null,
    },
  };
}

async function loadGenreHtml(slug, pageNum) {
  const pagePath =
    pageNum > 1 ? `/genre/${slug}/page/${pageNum}/` : `/genre/${slug}/`;
  const targetUrl = `${BASE_URL}${pagePath}`;
  const shellHtml = await fetchHtml(targetUrl);
  const $shell = cheerio.load(shellHtml);
  const htmxUrl = findHtmxUrl($shell);

  if (!htmxUrl) {
    return { html: shellHtml, targetUrl, htmxUrl: null };
  }

  const html = await fetchHtml(htmxUrl, {
    headers: {
      "HX-Request": "true",
      Referer: targetUrl,
    },
  });

  return { html, targetUrl, htmxUrl: getAbsoluteUrl(htmxUrl) };
}

async function getGenreDetail(slug, page = 1) {
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    const error = new Error("Invalid page number");
    error.statusCode = 400;
    error.message = "Page must be a positive integer";
    throw error;
  }

  const { html, targetUrl, htmxUrl } = await loadGenreHtml(slug, pageNum);
  const $ = cheerio.load(html);
  const mangaElements = $(
    '.bge:has(a[href*="/manga/"]), article:has(a[href*="/manga/"])'
  );
  const seen = new Set();
  const mangaList = mangaElements
    .toArray()
    .map((el) => parseMangaCard($, el))
    .filter((item) => {
      if (!item.title || !item.thumbnail || !item.slug || seen.has(item.slug)) {
        return false;
      }
      seen.add(item.slug);
      return true;
    });

  const nextPageElement = $("[hx-get], [data-hx-get]").last();
  const nextHxUrl = nextPageElement.attr("hx-get");
  const nextPageMatch = nextHxUrl?.match(/page\/(\d+)/);
  const hasNextPage = Boolean(nextPageMatch) || mangaList.length >= 10;
  const nextPageUrl = nextPageMatch
    ? `/genre/${slug}/page/${parseInt(nextPageMatch[1], 10)}`
    : mangaList.length >= 10
    ? `/genre/${slug}/page/${pageNum + 1}`
    : null;

  if (!mangaList.length) {
    logEmptyParse("GET /genre", html, {
      target: htmxUrl || targetUrl,
      selector: '.bge/article + a[href*="/manga/"]',
    });

    const error = new Error("No manga found");
    error.statusCode = 404;
    error.data = {
      success: false,
      error: "No manga found",
      genre: slug,
      currentPage: pageNum,
      debug: {
        targetUrl,
        htmxUrl,
        elementsFound: mangaElements.length,
      },
    };
    throw error;
  }

  return {
    success: true,
    genre: slug,
    currentPage: pageNum,
    totalManga: mangaList.length,
    hasNextPage,
    nextPageUrl,
    data: mangaList,
    debug: {
      targetUrl,
      htmxUrl,
      elementsFound: mangaElements.length,
      pageTitle: $("title").text().trim(),
    },
  };
}

module.exports = { getGenreDetail, parseMangaCard };