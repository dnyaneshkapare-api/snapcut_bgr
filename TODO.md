# SnapCut AI delivery outcomes

## 1. Responsive neon SaaS shell
- Provide a default dark-mode application with neon pink `#FF2BD6`, cyan `#00F5FF`, aqua `#22D3EE`, dark background `#070014`, card background `#120B24`, high-contrast text, rounded 14px surfaces, glassmorphism-lite cards, restrained hover glows, and mobile-first responsive behavior.
- Include a persistent navigation model for Dashboard, Upload Workspace, History, Billing & Credits, API Keys, and Admin.

## 2. Working upload workspace
- Allow drag/drop or browse upload.
- Validate JPG, PNG, and WEBP formats, a maximum file size of 10 MB, and a maximum resolution of 5000x5000.
- Show upload progress, processing states, transparent checkerboard output, clear error feedback, and a download action.

## 3. Usage and monetization surfaces
- Show upload history for the last 7 days, credit usage, remaining quota, subscription status, and download history.
- Show Free (5 images/day), Pro Monthly (unlimited), and credit-pack options with Razorpay integration seams.

## 4. Integration-ready contracts
- Include typed interfaces for n8n webhook processing, Cloudinary temporary storage, Supabase metadata, and Razorpay order/webhook handoff.
- Document environment keys and API examples without storing secrets.

## 5. Public product surfaces
- Include crawlable metadata, route manifest, robots, sitemap, API documentation surface, and a clear product explanation.

## 6. Production hygiene
- Keep the code modular and fully typed.
- Run diagnostics and production build successfully.
- Preserve a documented deployment path for Vercel/Netlify frontend and n8n/Supabase/Cloudinary/Razorpay services.
