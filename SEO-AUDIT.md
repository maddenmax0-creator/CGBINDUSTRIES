# SEO Audit: cgbindustries.com.au

Audit date: 22 October 2026. Branch: `seo-optimisation`. Sections 1 to 14 below describe the site as audited, before any changes were made. The implementation log, skipped items and off-site tasks are at the end (from "Implementation log").

The site is six static HTML pages (home, two service pages, two suburb pages, privacy) with inline CSS and a small amount of inline JS. Hosting is Cloudflare (Worker with static assets). There is no wrangler config in the repo, and none was touched.

## Summary of the main problems (highest ranking impact first)

1. The homepage has no `<h1>`. The hero headline ("Clean.") is `aria-hidden` and the sub-line is a `div`.
2. Titles and descriptions are mostly fine but run long (71–76 characters, so they truncate) and the service titles don't lead with the "service + place" phrase people search.
3. There are only two service pages and two suburb pages. Several services the site already advertises have no page (driveway cleaning, exposed aggregate sealing, commercial, pool surrounds, paths). Seven suburbs named in schema and `llms.txt` have no page and no hub linking to them.
4. The homepage `LocalBusiness` schema contains `priceRange: "$$"`, which conflicts with the no-prices rule. It also carries self-serving `review` and `aggregateRating` markup, which Google ignores for LocalBusiness and which carries a spam-policy risk.
5. The favicon and apple-touch-icon point at `github.com/.../blob/main/favicon.png?raw=true`. That's an external dependency that redirects, and it isn't a stable favicon URL for Google.
6. There are no Twitter card tags anywhere, and the homepage has no `og:url`, `og:site_name` or `og:locale`.
7. There is no `_headers` file, so there are no explicit cache rules for images. The hero images are heavy (617 KB desktop, 450 KB mobile), and Google Fonts loads as a render-blocking stylesheet with no preconnect.
8. `vercel.json` is still in the repo, a leftover from the old host.
9. Internal linking is thin. Suburb pages are linked only from footers, and the homepage doesn't link to them in the body. The suburb pages don't link to the other service pages in context beyond one paragraph each.

## 1. Titles and meta descriptions

| Page | Title (chars) | Description (chars) | Notes |
|---|---|---|---|
| `/` | CGB Industries \| Concrete Restoration & Pressure Washing Sunshine Coast (71) | 153 | Brand first, so the keyword is pushed to the end. Mentions "restoration", which has no dedicated page. |
| `/pressure-washing` | Pressure Washing Sunshine Coast \| Driveways & Concrete \| CGB Industries (71) | 171 | Description is too long and will truncate around 155–160. |
| `/concrete-sealing` | Concrete Sealing Sunshine Coast \| UV & Salt-Rated Sealers \| CGB Industries (74) | 169 | Title and description both too long. |
| `/pressure-washing-buderim` | Pressure Washing Buderim \| Driveway & Concrete Cleaning \| CGB Industries (72) | 160 | Good targeting, slightly long. |
| `/pressure-washing-forest-glen` | Pressure Washing Forest Glen \| Driveway & Concrete Cleaning \| CGB Industries (76) | 160 | Good targeting, too long. |
| `/privacy` | Privacy Policy \| CGB Industries (31) | 109 | `noindex, follow`. This is correct. |

All titles and descriptions are unique. The homepage `og:title` differs from its `<title>`, which is fine. No page uses Twitter card tags.

## 2. Heading structure

- `/`: **no H1**. The H2s are logical (Our Services, Same Concrete. One Visit Apart., Built on the Sunshine Coast, What Our Customers Say, CTA, Contact). Service card names are `div`s rather than H3s.
- Service and suburb pages: exactly one H1 each, followed by logical H2s. The H1 on the service pages is just "Pressure Washing" and "Concrete Sealing", with no location.
- `/privacy`: one H1, then H2s. Fine.

## 3. Structured data

- **Homepage `LocalBusiness` / `HomeAndConstructionBusiness`**:
  - Valid JSON, with `@id`, phone, email, `areaServed` (ten `Place` entries) and `sameAs` (Instagram and Facebook).
  - **Problems**:
    - `priceRange: "$$"` goes against the no-prices rule.
    - Self-serving `review` and `aggregateRating` (3 reviews) are on the business entity. Google doesn't award review rich results for these, and they invite a manual action.
    - `address` has region and country only. There's no locality because it's a service-area business. That's acceptable, but it should be paired with `areaServed` as `City` / `AdministrativeArea` types.
    - No `WebSite` entity, no `openingHours`, no `knowsAbout`, no `taxID`/ABN.
  - The `OfferCatalog` lists the two services with no URLs.
- **Service pages**: valid `Service`, `BreadcrumbList` and `FAQPage`. The FAQ text matches the visible page text. The Service entities are minimal (`areaServed` is a single `Place`).
- **Suburb pages**: valid `Service`, `BreadcrumbList` (3 levels) and `FAQPage`.
- FAQ rich results are now shown only for government and health sites. The markup is harmless and still helps machine understanding, but it won't produce a visible SERP feature.

## 4. Images

- All content images are WebP at 1200×900 (150–280 KB each). Hero is 1920×1080 (617 KB) and a 1080×1920 mobile variant (450 KB). `og-image.jpg` is 1200×630 (248 KB).
- All content images have `width`/`height` and `loading="lazy"`; the hero uses `fetchpriority="high"`. However, `fetchpriority`, `width` and `height` are placed on the `<source>` element in the hero `<picture>`, where `fetchpriority` has no effect. There is also no preload for the LCP image.
- Alt text exists everywhere and is descriptive and location-aware. Gaps: the nav logo `<img>` on the homepage is not wrapped in a link, and the before/after slider `aria-label` is identical for every slider.
- File names are already descriptive (`driveway-pressure-washing-before.webp`). The gallery images are reused across the home, service and suburb pages, so there's little image variety.
- `logo.jpg`, `logo1.png` and `favicon.png` sit in the web root. `logo.jpg` is unused. The `unedited/` folder (about 2.6 MB of raw images) is public if deployed.
- No `decoding="async"` on any image.

## 5. Internal linking

- Home → both services (cards and footer). Home → suburb pages: **footer only**.
- Service pages → suburb pages: footer only. Service pages don't cross-link each other in body copy (the buttons go to `/#contact`).
- Suburb pages → both service pages in body copy, and → each other under "Also Working Around". That part is good.
- There's no service-area hub page and no page for the other seven suburbs.
- The homepage logo isn't a link. The privacy link opens in a new tab (`target="_blank"`) for no reason.

## 6. sitemap.xml and robots.txt

- `robots.txt`: present, `Allow: /`, and references `https://cgbindustries.com.au/sitemap.xml`. Correct.
- `sitemap.xml`: present, 5 URLs, all on `https://cgbindustries.com.au` with extensionless clean URLs. `lastmod` dates are stale (7 and 12 September). `changefreq` and `priority` are ignored by Google. `/privacy` is correctly excluded.
- `vercel.json` (`cleanUrls: true`) is the only reason the old host served extensionless URLs. Cloudflare static assets serves `/pressure-washing` from `pressure-washing.html` by default, so no redirect rule is needed.

## 7. Canonicals, Open Graph, Twitter

- Canonicals: present on every page, absolute, `https://cgbindustries.com.au/...`, with no trailing slash on inner pages and a slash on the homepage. Correct.
- OG: title, description, type, image (1200×630) and alt are present everywhere. **Missing**: `og:url` on the homepage, `og:site_name` and `og:locale` everywhere. OG alt on `/concrete-sealing` describes a driveway wash rather than sealing.
- Twitter: no tags on any page.

## 8. Domain consistency

Every canonical, sitemap entry, OG URL, JSON-LD URL and `llms.txt` link uses `https://cgbindustries.com.au`. There are no `www`, `vercel.app` or `workers.dev` URLs anywhere in the site files. The **only** external domain dependency in head tags is the GitHub-hosted favicon (see above).

## 9. Vercel leftovers

- `vercel.json`: present. To remove.
- No Vercel Analytics or Speed Insights scripts and no `/_vercel/` references in any page.

## 10. Performance (Core Web Vitals)

- Google Fonts stylesheet is render-blocking, with no `preconnect` to `fonts.googleapis.com` or `fonts.gstatic.com`. `display=swap` is set.
- CSS is inlined per page (about 25 KB each). That avoids a request but isn't shared between pages. This is acceptable at this size.
- The hero image is the LCP element on the homepage and is large. There is no preload hint.
- Google Tag Manager loads `async`. This is fine.
- The `.reveal` scroll animation hides below-the-fold content until JS runs. This doesn't hurt LCP, but content is invisible without JS.
- No `_headers` file, so image and asset caching is left to Cloudflare defaults.

## 11. Mobile and accessibility

- Viewport meta is present, the layout is responsive, and `100dvh` is used for the hero. There's a skip link, `:focus-visible` styles and a `prefers-reduced-motion` rule. The burger button has `aria-expanded`/`aria-controls`.
- The contrast of `--muted` (#5a5a5a) text on near-black is about 2.9:1, which fails AA for small text (nav links, labels, footer text). The footer "Privacy Policy" link is `#242424` on `#080808`, which is almost invisible. Fixing the palette would change the look, so this is flagged rather than changed, except for the privacy link.
- The form has proper `label for`/`id` pairs. Basin handling is intact and was not touched.
- Decorative hero text is correctly `aria-hidden`, but because there's no H1 the page lacks a primary heading.

## 12. NAP consistency

- Name: "CGB Industries" everywhere. Phone `0414 438 169` (`tel:0414438169`; `+61414438169` in schema). Email `cgbindustries@outlook.com.au`. ABN 12 508 435 400 in every footer.
- There is no street address. That's appropriate for a service-area business with no shopfront, but the base suburb/postcode isn't published anywhere, so I can't add it to schema. It should match the Google Business Profile exactly.

## 13. Thin or missing content

**Services with no dedicated page** (all advertised on the site already):
- Driveway cleaning (the highest-intent query for this business)
- Exposed aggregate / colour-enhancing sealing
- Commercial and body corporate pressure washing
- Pool surrounds, paths and alfresco areas
- Anti-slip coatings
- Concrete restoration (used in the homepage title, with no page behind it)

**Service area**, worked out from the schema and `llms.txt`: Sunshine Coast QLD, including Buderim, Forest Glen, Maroochydore, Mooloolaba, Caloundra, Nambour, Sippy Downs, Mountain Creek and Mons. **Only Buderim and Forest Glen have pages.** There's no hub page listing the areas.

## 14. Other

- The `llms.txt` text mentions "pricing factors" and "customer reviews". The pricing line should go (no-prices rule), and the file needs updating for any new pages.
- `$0` appears as a stat on the homepage ("Quote Cost"). It means a free quote, not a published price, so it was left alone.
- The homepage review quotes ("Price was fair") are customer words and were left as they are.

---

# Implementation log (23 October 2026)

All work is on `seo-optimisation`, one logical change per commit. Nothing was pushed or merged. No wrangler config or Worker settings were touched.

## What changed

**Homepage**
- Added an `<h1>`: "Pressure Washing & Concrete Sealing on the Sunshine Coast". It's visible, styled as a small sub-line under the "Concrete · Restoration · Protection" tagline. The "Clean." stamp stays decorative and `aria-hidden`.
- Hero images are now lighter files (`-opt` desktop, `-828w` mobile) with a width-split preload. `fetchpriority` and the dimensions moved to the `<img>` (they did nothing on `<source>`).
- Logo wraps in a link to `/`, with explicit dimensions and `width: auto` so it can't stretch.
- Reduced-motion users no longer get an invisible hero. The existing rule set `animation: none` while the elements started at `opacity: 0`.
- Removed the `review` and `aggregateRating` markup. `priceRange: "$$"` stays, as decided.
- Added a `WebSite` entity, `knowsAbout`, a service catalogue that links all six service pages, and `areaServed` as `City` entries inside the Sunshine Coast area.
- Added a link row to the new service pages and key suburbs under the service cards.

**New pages** (each has a unique title and description, one H1, Service + BreadcrumbList + FAQPage schema, canonical, OG and Twitter tags, and real job photos)
- `/driveway-cleaning`
- `/exposed-aggregate-sealing`
- `/pool-surround-and-path-cleaning`
- `/commercial-pressure-washing` (no photos, because there are none of commercial jobs; see below)
- `/service-areas` (hub for the suburbs, plus how quoting works)

**Existing pages**
- Footer on every page now has Services and Service Areas lists, so every page links every service and area page.
- In-copy links from `/pressure-washing`, `/concrete-sealing`, `/pressure-washing-buderim` and `/pressure-washing-forest-glen` to the new pages.
- The "pages for the rest are still to come" line on both suburb pages now points to `/service-areas`.
- Each before/after slider now has its own `aria-label`. `decoding="async"` was added to lazy images. The footer Privacy link opens in the same tab and is readable (`--ash` instead of `--border`). The `/concrete-sealing` OG image alt no longer describes a driveway wash.

**Housekeeping**
- `vercel.json` deleted (untracked leftover, only contained `cleanUrls`).
- `.gitignore` added with `.DS_Store`, and the two tracked `.DS_Store` files were removed from git.
- `sitemap.xml` now lists all 10 indexable URLs with today's `lastmod`. `changefreq` and `priority` were dropped because Google ignores them.
- `llms.txt` updated for the new pages. The "pricing factors" and "customer reviews" wording was removed.
- Images: eight new WebPs from the earlier session are wired in, plus five more copied from `CGB ASSETS` into `img2/` (resized to 1200px and below, WebP, descriptive names). `CGB ASSETS` was only read.

## `_headers` rules added (every rule)

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/img2/*
  Cache-Control: public, max-age=2592000     (30 days, not immutable: file names aren't hashed)

/favicon.png
  Cache-Control: public, max-age=604800      (7 days)

/logo1.png
  Cache-Control: public, max-age=604800      (7 days)
```

No `_redirects` file was added. Cloudflare static assets already serve `/pressure-washing` from `pressure-washing.html` and redirect `/x.html` to `/x`, and www is handled by your Redirect Rule.

## Skipped, and why

- **Suburb pages for Maroochydore, Mooloolaba, Caloundra, Nambour, Sippy Downs, Mountain Creek and Mons.** I don't have genuinely unique local content for them, and near-duplicate pages are doorway-page risk. They're listed on `/service-areas` instead. Add a page when there's something real to say (a job you've done there, local conditions you've seen).
- **Anti-slip coatings and concrete restoration pages.** Covered inside the sealing, aggregate and paving pages. A standalone page needs its own photos and detail.
- **Colour contrast of `--muted` text.** Fixing it changes the palette, so it's flagged only (except the privacy link, fixed).
- **`$0` "Quote Cost" stat and the customer quotes on the homepage.** Left alone. The first means a free quote, and the quotes are customers' own words.
- **"20+ Years in Concreting" on the homepage and in `llms.txt`.** Already on the site before this work and not touched. Please confirm it's accurate.
- **Commercial page photos.** `CGB ASSETS` has no commercial or pool-surround photos, so those two pages use residential paving photos (captioned honestly) or none.
- **`.assetsignore`.** `unedited/`, `doc/`, `SEO-AUDIT.md` and `llms.txt`-adjacent files are in the web root and will be served if deployed. Blocking them needs an `.assetsignore` or moving them out of the repo, and I didn't want to touch deployment config. Worth doing.

## Things to check

- The in-progress driveway photo (`driveway-pressure-washing-in-progress-sunshine-coast.webp`) shows a visible house number. Crop or blur it if you'd rather not publish that.
- I couldn't test the Basin form submission or the layout on a real phone. The form code is unchanged, and I checked desktop layouts in headless Chrome only.
- The Dulux Avista name appears once, on `/exposed-aggregate-sealing`, with no claim of accreditation or partnership.
- Commercial page: I made no claims about insurance, SWMS or out-of-hours work. Add them if they're true (see below).

## Off-site tasks for you

1. **Google Business Profile.** Claim or verify it, set it as a service-area business (hide the address), add the suburbs, services and categories (e.g. pressure washing service, concrete contractor), upload real job photos, and make the name, phone and website match the site exactly.
2. **Reviews.** Ask recent customers for Google reviews and reply to each. Real reviews on the profile do more than any on-site markup.
3. **Citations.** Add consistent name, phone, website and service area to Hello Pages, True Local, Yellow Pages, Bing Places, Apple Business Connect, Facebook and Instagram bios. Link the Facebook and Instagram profiles back to the site.
4. **Search Console.** Add `https://cgbindustries.com.au` as a domain property, submit `/sitemap.xml`, request indexing for the five new pages, and check Coverage and Core Web Vitals after a couple of weeks.
5. **Analytics.** Confirm GA4 (`G-LRVTSL17XT`) is receiving data, and mark form submissions as conversions.
6. **Photos.** Take pool surround and commercial job photos, and before/afters of more suburbs. They'd make those pages and any future suburb pages much stronger.
7. **Business facts to confirm and then add.** Public liability insurance, the base suburb/postcode for the profile, and trading hours.
8. **Cloudflare.** Optionally add `.assetsignore` (see above) and confirm cache headers took effect after deploy.
