# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Players** arriving from a store page, a trailer, a social post or a search. Their job: understand
  in seconds what Crystalysis is, see it move, and get to the store for their device.
- **Press and content creators** sent to `press.html`. Their job: take a fact sheet, a description,
  the trailer and images, and know what they may do with them, without writing to ask.
- **Store reviewers and platform forms** that need a working website, privacy policy and data
  deletion page (`privacy.html`, `delete-data.html`). These pages are legal surfaces, not marketing.

## Product Purpose

The public home of Crystalysis, a 2D arena game by one developer (Trikyname, Spain). The site
points every visitor to the store where they can play, shows the game with its own visuals, and
hosts the press kit and the legal pages the stores require. Success: a visitor reaches the right
store in one click, and a journalist leaves with everything without emailing.

## Positioning

One ball, aimed by hand, is the whole weapon: it never dies but it slows, and damage is speed.
Around it sit survivors-like builds (weapons, passives, Aspects), artifacts that change how the ball
is controlled, and a crystal to defend. The game has several cores; the site never reduces it to
the aim freeze, which is bounded and paid.

## Operating Context

- Static site on GitHub Pages (`github.com/Trikyname/crystalysis-site`); a push to `main` publishes.
  Nothing is pushed without the author's approval of the local version.
- Game repo is separate (`Proyectos/Crystal Ball`). Store art, trailers and screenshots are rendered
  there (`StoreAssets/`, `Builds/Upload/`) and copied here.
- Copy rules come from the game repo: every claim about the game is checked against its GDD, code or
  localisation table before publishing; vocabulary comes from the localisation table
  (`Settings/Localization/Tables/GameStrings_*.asset`); the style guide is
  `.docs/reference/escribir-sin-sonar-a-ia.md`. The most recent verified long copy is the Steam
  *About* text (`.docs/reference/steam-store-localization-2026-09-28.json`).

## Capabilities and Constraints

- Platforms and their state are data the author flips: Google Play (Android, free, open testing),
  Steam (PC, Early Access, page in review as Coming Soon, app 5282020), itch.io (browser and Windows
  demo, draft until the Steam page is public), App Store (iOS, in Apple review). Only live stores
  get a link.
- Steam demo exists as its own app (5346790), not yet public.
- Trailers on YouTube: pre-release `qAkrmIxKML0`, release-day cut `LYj-Nd-_KMo` (ends on "Out now
  in Early Access"; not for use before launch).
- English and Spanish on the press kit; the landing is English.
- No analytics, no cookies, no third-party script except the YouTube player, loaded on click from
  `youtube-nocookie.com`.

## Brand Commitments

- Tokens come from the game (`UI/Tokens.uss`): arena `#0A0D11`, cyan `#59D9F2`, amber `#F4CB6E`,
  text `#EAF2F6` / `#C3D0D8` / `#8A99A4`. The wordmark is CRYSTAL in white and YSIS in cyan, widely
  tracked. The arena background (`arena.js`) is the game's own menu field of drifting outlined
  triangles, with a breakable crystal. The site does not invent a brand.
- Name: Crystalysis. Developer: Trikyname (Álvaro Colom). Contact: trikyname@gmail.com.
- AI disclosure, when stated, follows the Steam text: interface icons designed with an AI design
  tool and edited by the developer; text written in English and Spanish and machine-translated into
  the other eleven languages; code and store copy written with an AI assistant. Art is drawn by code
  and audio is synthesized: never call either AI-generated.

## Evidence on Hand

- Trailers (YouTube above; MP4 16:9 and 9:16 in `press/`).
- Screenshots: eight portrait 1440×2560 (`press/screenshots/`), five landscape 1920×1080 from one
  PC run (`press/screenshots-pc/`).
- Steam capsules and library art, logo, icon, Google Play feature graphic (`press/`).
- No reviews, quotes, awards, sales or player counts exist to cite; none may be invented.

## Product Principles

1. The game's own pixels carry the page: captures, capsules and the live arena, never stock or
   illustration.
2. Every sentence about the game is true today; when in doubt, cut it.
3. One click to the right store; a store that is not live is not a link.
4. The press kit answers before it is asked: rights, sizes, contact, all on the page.

## Accessibility & Inclusion

Text contrast at WCAG AA on the dark ground; the interactive crystal is keyboard reachable; motion
respects `prefers-reduced-motion`.
