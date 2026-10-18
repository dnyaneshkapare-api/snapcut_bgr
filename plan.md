# SnapCut AI implementation plan

## Scope
Build a production-shaped React/Vite SaaS workspace for AI background removal. The first release prioritizes the core user loop: upload, validate, locally preview a transparent cut, download, review recent usage, and navigate billing/API/admin surfaces. External systems remain behind typed adapters and configuration seams so the app is ready for Supabase, n8n, Cloudinary, Razorpay, and a provider-grade background-removal API without fabricating credentials.

## Architecture
- `src/App.tsx`: application shell, route/view state, upload state, and product surfaces.
- `src/lib/backgroundRemoval.ts`: local quick-cut implementation using Canvas for a working browser preview and export.
- `src/lib/services.ts`: typed integration contracts for the n8n processing webhook, Cloudinary temp storage, Supabase metadata, and Razorpay billing handoff.
- `src/styles.css`: neon pink/cyan design system, responsive layout, states, and motion.
- `public/manus-routes.json`: complete page route manifest.
- `public/robots.txt` and `public/sitemap.xml`: crawl behavior for the public shell.

## Design direction
### Design movement
Neon editorial SaaS: a dark, high-contrast control room softened by glass surfaces, oversized typography, and precise electric color accents.

### Core principles
1. Make the upload action the visual hero and reduce everything else to useful context.
2. Pair neon pink energy with cyan/aqua clarity; never use glow as decoration without hierarchy.
3. Favor quiet surfaces, crisp data, and restrained motion over noisy cyberpunk effects.
4. Keep every screen legible at mobile widths and keyboard-friendly.

### Color philosophy
The near-black plum canvas gives the interface depth; neon pink marks the product's expressive energy while cyan/aqua signals progress, trust, and successful processing. Muted lavender-gray copy protects contrast so the glow remains intentional rather than fatiguing.

### Layout paradigm
A persistent rail + wide workbench: navigation anchors the left edge while the main content alternates between one dominant action and compact supporting signals. On mobile, the rail collapses into a top bar.

### Signature elements
- A split pink/cyan SnapCut mark and matching dual-color progress line.
- Checkerboard transparency tiles behind output previews.
- Hairline neon borders that brighten only on focus, hover, or active processing.

### Interaction philosophy
Interactions should feel immediate and explicit: file validation surfaces beside the drop zone, progress phases appear in plain language, and every success offers a next action. Focus rings use cyan and never rely on color alone.

### Animation
Use short 160–260ms ease-out transitions for hover, route changes, and status updates. Reserve shimmer for processing only. No perpetual decorative motion.

### Typography system
Inter/Poppins-style system stack. Use compact uppercase labels at 11px with tracking, bold display copy at 44–64px for the hero, and 14–16px body text with generous line height.

### Brand essence
Backgrounds, gone — for creators and product teams who need transparent assets without the drag of a full editor. Personality: precise, electric, composed.

### Brand voice
Direct, confident, and a little playful. Example lines: “Drop it. We’ll handle the edges.” and “Clean cut, no detour.”

### Wordmark & logo
A compact `SC` monogram inside a split pink/cyan aperture shape, paired with a bold SnapCut wordmark and a quiet `AI` suffix.

### Signature brand color
Neon pink `#FF2BD6`, always paired with cyan/aqua `#00F5FF` or `#22D3EE`.

## Delivery workflow
1. Install the pinned pnpm toolchain and reviewed dependencies.
2. Implement the shared shell and responsive design system.
3. Implement local quick-cut upload flow with file validation and download.
4. Add typed service contracts and integration-ready artifacts.
5. Run diagnostics, typecheck, and production build.
6. Start Preview on port 3000, verify route manifest, and save a checkpoint.
