# TERRAL — from the mountain to the cup

[Português](README.pt-BR.md) · [English](README.md)

A scroll-driven web experience about specialty coffee, built as a concept portfolio project by [MilWeb](https://milweb.com.br). TERRAL is a **fictional brand**: the roastery, address, products, prices and numbers shown on the site are illustrative.

> **Type:** concept (portfolio) · **Demo:** [terral-cafe.vercel.app](https://terral-cafe.vercel.app)

![TERRAL home with the 3D coffee bean](docs/screenshots/home.webp)

## What the site does

- **Hero with a 3D coffee bean** rendered in real time with Three.js / React Three Fiber (procedural geometry and custom shaders), with a loading screen.
- **Five chapters** — Caparaó, Terreiro, Tambor, Moenda and Xícara — each a pinned horizontal panel driven by scroll (GSAP ScrollTrigger + Lenis), with its own colour, stats, photos and a short looping video.
- **Coffee showcase** with three illustrative blends (Nascente, Vertente, Vulcânico) and a subscription club; "order" buttons open a pre-filled WhatsApp message.
- **Hidden page** (`/casa-do-torrador`): holding the footer button for six seconds unlocks it; it is not indexed.
- Custom 404 page, magnetic buttons, and a separate mobile layout.

![Coffee showcase](docs/screenshots/coffees.webp)

## Stack

- Next.js 16.3 (App Router), React 19.2 and TypeScript
- Tailwind CSS 4
- GSAP (+ ScrollTrigger, `@gsap/react`) and Lenis
- Three.js, React Three Fiber and drei

Exact versions are in [package.json](package.json).

## Running locally

Requirements: Node.js 20.9+ (CI uses Node 22) and pnpm 10.

```bash
git clone https://github.com/rickjs2005/terral.git
cd terral
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. No environment variables are required.

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Structure

- `src/app/` — home page, `/casa-do-torrador`, 404 and root layout (fonts, metadata).
- `src/components/` — nav, hero and 3D scene, intro/manifesto, chapters, coffees and footer.
- `src/lib/chapters.ts` — texts, colours, stats and media paths of the five chapters.
- `src/lib/` — bean geometry, scroll and animation helpers.
- `public/shot/` — chapter photos, cut-outs and videos; `public/products/` — product images.
- `docs/screenshots/` — images used in this README.

## Limitations

- Concept site only: there is no checkout, backend or real stock. The WhatsApp buttons point to MilWeb's business number, not to a real roastery.
- Content is in Brazilian Portuguese only.
- There are no automated tests; CI runs lint and the production build.

## Media credits

- Product package photos were generated with an AI image tool (Higgsfield), according to the project's commit history.
- The origin of the chapter photos, cut-outs and videos in `public/shot/` is not documented.
- `public/draco/` holds a copy of the Google Draco decoder (third-party) and `public/model/bean.glb` a 3D model; neither is loaded by the current code, since the hero bean is generated procedurally.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

No license has been chosen yet; all rights reserved by the author.
