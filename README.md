# Komiku JS - Standalone Scraping Library

**Komiku JS** adalah standalone scraping library (tanpa dependensi framework) untuk mengambil data komik (Manga, Manhwa, Manhua) dari [Komiku](https://komiku.org) secara terstruktur.

Library ini dapat digunakan langsung tanpa Express atau framework HTTP apapun. Anda juga bisa dengan mudah membungkusnya dengan Express, Fastify, H3, atau framework lain untuk membuat REST API.

```bash
npm install komiku-js
```

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| **Rekomendasi** | Daftar komik rekomendasi dari halaman utama Komiku |
| **Terbaru** | Rilis komik terbaru secara real-time |
| **Pustaka** | Katalog pustaka komik dengan dukungan pagination |
| **Komik Populer** | Manga, Manhwa, dan Manhua populer (dengan filter kategori) |
| **Pencarian** | Pencarian komik berdasarkan kata kunci judul |
| **Detail Komik** | Sinopsis, metadata, info table, genre, komik serupa, dan daftar chapter |
| **Baca Chapter** | Ekstraksi seluruh tautan gambar per chapter + navigasi prev/next |
| **Komik Berwarna** | Daftar komik full-color dengan pagination |
| **Genre** | Daftar seluruh genre, genre rekomendasi, dan komik berdasarkan genre |
| **Core Utilities** | Utilitas untuk fetch HTML, normalize text, extract slug, dan lain-lain |

---

## 🚀 Quick Start

```javascript
const komiku = require("komiku-js");

(async () => {
  // 1. Ambil komik rekomendasi
  const rekomendasi = await komiku.getRekomendasi();
  console.log(rekomendasi[0].title);

  // 2. Ambil komik terbaru
  const terbaru = await komiku.getTerbaru();
  console.log(terbaru[0].title);

  // 3. Cari komik
  const hasil = await komiku.getSearch("naruto");
  console.log(hasil.total, "hasil ditemukan");

  // 4. Detail komik
  const detail = await komiku.getDetail("reality-quest");
  console.log(detail.sinopsis);

  // 5. Baca chapter
  const chapter = await komiku.getBacaChapter("reality-quest", "220");
  console.log(chapter.images.length, "gambar chapter");

  // 6. Pustaka komik (halaman 1)
  const pustaka = await komiku.getPustaka(1);

  // 7. Komik berwarna
  const berwarna = await komiku.scrapeBerwarna(1);

  // 8. Komik populer
  const populer = await komiku.getKomikPopuler();

  // 9. Semua genre
  const genres = await komiku.getGenreAll();

  // 10. Genre detail
  const genreDetail = await komiku.getGenreDetail("action", 1);

  // 11. Genre rekomendasi
  const genreRec = await komiku.getGenreRekomendasi();
})();
```

---

## 📚 API Library Reference

Semua fungsi adalah `async` dan mengembalikan `Promise`.

### `getRekomendasi()`
Mengambil daftar komik rekomendasi dari halaman utama Komiku.

**Return:** `Array<{ title, originalLink, apiDetailLink, thumbnail }>`

### `getTerbaru()`
Mengambil daftar komik terbaru yang ditambahkan ke Komiku.

**Return:** `Array<{ title, originalLink, thumbnail, type, genre, updateTime, latestChapterTitle, latestChapterLink, isColored, updateCountText, mangaSlug, apiDetailLink, apiChapterLink }>`

### `getSearch(keyword)`
Mencari komik berdasarkan kata kunci.

**Parameter:** `keyword` (string) - kata kunci pencarian

**Return:** `{ status, message, keyword, url, total, data: Array<{ title, altTitle, slug, href, thumbnail, type, genre, description }> }`

### `getDetail(slug)`
Mengambil detail lengkap komik.

**Parameter:** `slug` (string) - slug komik (contoh: `reality-quest`)

**Return:** `{ title, alternativeTitle, description, sinopsis, thumbnail, info, genres, slug, chapters, similarKomik }`

### `getBacaChapter(slug, chapter)`
Mengambil konten gambar chapter dan navigasi.

**Parameter:** `slug` (string), `chapter` (string/number)

**Return:** `{ title, mangaInfo, description, images, meta, navigation, additionalDescription }`

### `getPustaka(page = 1)`
Mengambil katalog pustaka komik dengan pagination.

**Parameter:** `page` (number) - nomor halaman

**Return:** `{ page, results: Array<{...}>, total }`

### `scrapeBerwarna(page = 1)`
Mengambil daftar komik berwarna.

**Parameter:** `page` (number) - nomor halaman

**Return:** `{ page, results: Array<{...}>, total, success }`

### `getKomikPopuler()`
Mengambil komik populer per kategori (manga, manhwa, manhua).

**Return:** `{ manga: { title, items }, manhwa: { title, items }, manhua: { title, items } }`

### `getMangaPopuler()`
Mengambil manga populer saja.

### `getManhwaPopuler()`
Mengambil manhwa populer saja.

### `getManhuaPopuler()`
Mengambil manhua populer saja.

### `getGenreAll()`
Mengambil daftar seluruh genre komik.

**Return:** `Array<{ title, slug, apiGenreLink, titleAttr }>`

### `getGenreDetail(slug, page = 1)`
Mengambil komik berdasarkan genre.

**Parameter:** `slug` (string), `page` (number)

**Return:** `{ success, genre, currentPage, totalManga, hasNextPage, nextPageUrl, data: Array<{...}>, debug }`

### `getGenreRekomendasi()`
Mengambil daftar genre rekomendasi.

**Return:** `Array<{ title, slug, originalLink, readLink, apiGenreLink, thumbnail }>`

### Core Utilities (diekspor untuk penggunaan lanjutan)

- `komiku.BASE_URL` - URL dasar Komiku
- `komiku.fetchHtml(url, options)` - Fetch HTML dari URL
- `komiku.getAbsoluteUrl(url, baseUrl)` - Mengubah URL relatif menjadi absolut
- `komiku.normalizeText(value)` - Normalisasi teks (hapus spasi berlebih)
- `komiku.cleanTitle(value)` - Membersihkan judul komik
- `komiku.getImageUrl($, imgElement)` - Ekstrak URL gambar dari elemen Cheerio
- `komiku.extractMangaSlug(url)` - Ekstrak slug manga dari URL
- `komiku.extractChapterNumber(url)` - Ekstrak nomor chapter dari URL
- `komiku.extractChapterSlug(url)` - Ekstrak slug chapter dari URL
- `komiku.getApiChapterLink(chapterUrl, fallbackMangaSlug)` - Buat link API chapter
- `komiku.core` - Objek utilitas inti lengkap

---

## 📦 Contoh Penggunaan

Lihat direktori `examples/` untuk contoh penggunaan:

- `examples/usage.js` - Contoh penggunaan sebagai library standalone

---

## 🧪 Testing

```bash
npm test
```

---

## 🛠️ Struktur Proyek

```
komiku-js/
├── src/
│   ├── index.js              # Entry point library (standalone, zero framework)
│   ├── core/
│   │   └── scraperUtils.js   # Utilitas inti (fetch, parse, extract, dll)
│   └── scrapers/             # Setiap fungsi scraper
│       ├── rekomendasi.js
│       ├── terbaru.js
│       ├── detail.js
│       ├── baca-chapter.js
│       ├── search.js
│       ├── pustaka.js
│       ├── komik-populer.js
│       ├── berwarna.js
│       ├── genre-all.js
│       ├── genre-detail.js
│       └── genre-rekomendasi.js
├── examples/
│   └── usage.js              # Contoh penggunaan library
├── package.json
├── README.md
└── img/                      # Logo dan gambar dokumentasi
```

---

## 📄 Lisensi

ISC