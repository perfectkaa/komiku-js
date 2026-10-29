/**
 * Komiku JS - Scraping Library
 *
 * A modular, wrapper-style scraping library for extracting manga data
 * from komiku.org. This is the pure library entry point with zero
 * Express dependency. It can be used as a standalone scraper or wrapped
 * by any HTTP framework (Express, Fastify, H3, etc.).
 */

const { getRekomendasi } = require("./scrapers/rekomendasi");
const { getTerbaru, parseTerbaruHtml } = require("./scrapers/terbaru");
const { getDetail, scrapeKomikDetail } = require("./scrapers/detail");
const { getBacaChapter, extractSlugAndChapter } = require("./scrapers/baca-chapter");
const { getSearch } = require("./scrapers/search");
const { getPustaka, scrapeMangaData } = require("./scrapers/pustaka");
const {
  getKomikPopuler,
  getMangaPopuler,
  getManhwaPopuler,
  getManhuaPopuler,
} = require("./scrapers/komik-populer");
const { scrapeBerwarna, parseCard } = require("./scrapers/berwarna");
const { getGenreAll } = require("./scrapers/genre-all");
const { getGenreDetail } = require("./scrapers/genre-detail");
const { getGenreRekomendasi } = require("./scrapers/genre-rekomendasi");

// Core utilities re-exported for advanced usage
const core = require("./core/scraperUtils");

module.exports = {
  // Scraper functions (framework-agnostic)
  getRekomendasi,
  getTerbaru,
  getDetail,
  getBacaChapter,
  getSearch,
  getPustaka,
  getKomikPopuler,
  getMangaPopuler,
  getManhwaPopuler,
  getManhuaPopuler,
  scrapeBerwarna,
  getGenreAll,
  getGenreDetail,
  getGenreRekomendasi,

  // Re-exported parser utilities (for advanced / custom usage)
  parseTerbaruHtml,
  parseCard,
  scrapeKomikDetail,
  scrapeMangaData,
  extractSlugAndChapter,

  // Core utilities
  core,
  BASE_URL: core.BASE_URL,
  fetchHtml: core.fetchHtml,
  getAbsoluteUrl: core.getAbsoluteUrl,
  extractMangaSlug: core.extractMangaSlug,
  extractChapterNumber: core.extractChapterNumber,
  extractChapterSlug: core.extractChapterSlug,
  getApiChapterLink: core.getApiChapterLink,
  normalizeText: core.normalizeText,
  cleanTitle: core.cleanTitle,
  getImageUrl: core.getImageUrl,
};