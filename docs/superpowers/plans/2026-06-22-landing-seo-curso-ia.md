# Landing SEO y captación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la portada actual por una landing SEO orientada a docentes y estudiantes, mover el dashboard a `/dashboard` y captar suscriptores para entregar un kit de prompts.

**Architecture:** La aplicación Next.js usará route groups para separar el layout público del shell educativo sin alterar las rutas existentes. La landing será server-rendered, con componentes cliente únicamente para FAQ y formulario; Supabase almacenará suscriptores y límites de frecuencia, mientras Resend será una integración opcional de entrega.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, Vitest, Testing Library, Resend HTTP API, `pdf-lib`.

---

## File map

### Routing and layouts

- Modify `src/app/layout.tsx`: global HTML shell and shared metadata only.
- Create `src/app/(app)/layout.tsx`: authenticated-aware `AppShell` wrapper.
- Move existing educational pages into `src/app/(app)/...` without changing public URLs.
- Move current `src/app/page.tsx` to `src/app/(app)/dashboard/page.tsx`.
- Create `src/app/(marketing)/page.tsx`: public landing route `/`.
- Create `src/app/(marketing)/privacy/page.tsx`: privacy policy.
- Create `src/app/(marketing)/unsubscribe/page.tsx`: unsubscribe UI.

### Marketing UI

- Create `src/components/marketing/marketing-header.tsx`: responsive anchor navigation.
- Create `src/components/marketing/landing-page.tsx`: static landing sections and approved copy.
- Create `src/components/marketing/faq-list.tsx`: accessible accordion.
- Create `src/components/marketing/newsletter-form.tsx`: client-side action state and kit delivery.
- Create `src/components/marketing/marketing-footer.tsx`: legal and platform links.
- Modify `src/app/globals.css` and `tailwind.config.ts`: Neural blue + magenta tokens and motion rules.

### SEO

- Create `src/lib/marketing/seo.ts`: metadata and JSON-LD builders.
- Create `src/app/sitemap.ts`: public sitemap.
- Create `src/app/robots.ts`: crawl policy.
- Create `src/app/opengraph-image.tsx`: generated social image.

### Newsletter and kit

- Create `supabase/migrations/20260622190000_marketing_subscribers.sql`: subscribers, rate limits, RLS, and RPCs.
- Create `src/lib/supabase/admin.ts`: server-only service-role client.
- Create `src/lib/marketing/newsletter.ts`: validation and subscription orchestration.
- Create `src/lib/marketing/download-token.ts`: HMAC download tokens.
- Create `src/lib/marketing/resend.ts`: optional Resend request.
- Create `src/lib/marketing/analytics.ts`: provider-neutral conversion events.
- Create `src/lib/marketing/prompt-kit-pdf.ts`: in-memory PDF builder for protected delivery.
- Create `src/app/api/marketing/kit/route.ts`: signed kit download.
- Create `src/app/api/marketing/unsubscribe/route.ts`: signed unsubscribe operation.
- Create `scripts/generate-prompt-kit.ts`: reproducible PDF generator.
- Create `content/marketing/prompt-kit.ts`: source content for the PDF.
- Generate `.generated/marketing/kit-prompts-ia-educativa.pdf` only for visual QA; this ignored file is never a public download endpoint.
- Modify `.env.example`: server-only marketing settings.

### Tests

- Create `src/app/routing-layout.test.ts`.
- Create `src/components/marketing/landing-page.test.tsx`.
- Create `src/components/marketing/faq-list.test.tsx`.
- Create `src/lib/marketing/seo.test.ts`.
- Create `src/lib/marketing/newsletter.test.ts`.
- Create `src/lib/marketing/download-token.test.ts`.
- Create `src/app/api/marketing/kit/route.test.ts`.
- Create `src/app/api/marketing/unsubscribe/route.test.ts`.

---

### Task 1: Separate marketing and application layouts

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(app)/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/(app)/dashboard/page.tsx`
- Move: educational route directories into `src/app/(app)/`
- Modify: `src/components/nav-links.tsx`
- Modify: `src/components/app-shell.tsx`
- Create: `src/app/routing-layout.test.ts`

- [ ] **Step 1: Write the failing routing test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("marketing and course route separation", () => {
  it("keeps the root layout independent from the application shell", () => {
    const rootLayout = read("src/app/layout.tsx");
    expect(rootLayout).not.toContain("AppShell");
    expect(rootLayout).not.toContain("getCurrentUser");
  });

  it("mounts the educational shell in the app route group", () => {
    const appLayout = read("src/app/(app)/layout.tsx");
    expect(appLayout).toContain("<AppShell user={user}");
    expect(read("src/components/nav-links.tsx")).toContain('href: "/dashboard"');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/app/routing-layout.test.ts`  
Expected: FAIL because `src/app/(app)/layout.tsx` does not exist.

- [ ] **Step 3: Move routes without changing their URL paths**

Run these PowerShell-safe Git commands individually:

```powershell
New-Item -ItemType Directory -Force 'src/app/(app)/dashboard'
git mv 'src/app/page.tsx' 'src/app/(app)/dashboard/page.tsx'
git mv 'src/app/account' 'src/app/(app)/account'
git mv 'src/app/auth' 'src/app/(app)/auth'
git mv 'src/app/calendar' 'src/app/(app)/calendar'
git mv 'src/app/courses' 'src/app/(app)/courses'
git mv 'src/app/live-classes' 'src/app/(app)/live-classes'
git mv 'src/app/modules' 'src/app/(app)/modules'
git mv 'src/app/program' 'src/app/(app)/program'
git mv 'src/app/reflection' 'src/app/(app)/reflection'
git mv 'src/app/visual' 'src/app/(app)/visual'
```

Do not move `src/app/api`, `src/app/layout.tsx`, `src/app/globals.css`, metadata files, or test files.

- [ ] **Step 4: Reduce the root layout to global concerns**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Academia IA Educativa", template: "%s | Academia IA" },
  description: "Curso gratuito de inteligencia artificial aplicada a la educación con NotebookLM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
```

- [ ] **Step 5: Create the application layout**

```tsx
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
```

- [ ] **Step 6: Update dashboard navigation**

In `src/components/nav-links.tsx`, change the Cursos item to:

```ts
{ href: "/dashboard", label: "Cursos", icon: BookOpen },
```

Change `isActivePath` so `/dashboard` is active for `/dashboard` and `/courses/*`. In `src/components/app-shell.tsx`, keep the brand link pointed at `/` so the public landing remains discoverable.

- [ ] **Step 7: Run focused tests and build**

Run: `npm test -- src/app/routing-layout.test.ts`  
Expected: PASS.

Run: `npm run build`  
Expected: all previous routes plus `/dashboard` compile without duplicate route errors.

- [ ] **Step 8: Commit**

```powershell
git add src/app src/components/nav-links.tsx src/components/app-shell.tsx
git commit -m "refactor: separate marketing and course layouts"
```

---

### Task 2: Add the Neural marketing system and static landing

**Files:**
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/components/marketing/marketing-header.tsx`
- Create: `src/components/marketing/landing-page.tsx`
- Create: `src/components/marketing/marketing-footer.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `src/components/marketing/landing-page.test.tsx`

- [ ] **Step 1: Write the failing landing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "@/app/(marketing)/page";

describe("marketing landing", () => {
  it("renders the value proposition, evidence and real course links", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Aprendé inteligencia artificial/i })).toBeInTheDocument();
    expect(screen.getByText("11 módulos progresivos")).toBeInTheDocument();
    expect(screen.getByText("33 lecciones prácticas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Empezar el curso gratis/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Explorar los 11 módulos/i })).toHaveAttribute("href", "/modules");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/components/marketing/landing-page.test.tsx`  
Expected: FAIL because the marketing page does not exist.

- [ ] **Step 3: Add approved theme tokens**

Extend `tailwind.config.ts` with:

```ts
"neural-night": "#07091A",
"neural-panel": "#0C1029",
"neural-blue": "#336EFF",
"neural-magenta": "#F43CB0",
"neural-muted": "#A3AECF",
```

Add `.marketing-page`, `.neural-grid`, `.neural-glow`, and reduced-motion rules to `globals.css`. The grid must use CSS gradients only, and all transitions must be disabled under `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Create focused static components**

`marketing-header.tsx` must expose anchor links `#beneficios`, `#programa`, `#preguntas`, and a real `/dashboard` link. `marketing-footer.tsx` must expose `/privacy`, `/unsubscribe`, and `/dashboard`.

`landing-page.tsx` must define these exact data arrays and map them into semantic sections:

```ts
export const landingStats = [
  ["11", "módulos progresivos"],
  ["33", "lecciones prácticas"],
  ["22 h", "a tu propio ritmo"],
  ["100%", "gratuito y abierto"],
] as const;

export const landingBenefits = [
  ["Comprender", "IA sin tecnicismos innecesarios", "Entendé cómo funciona, qué puede hacer y dónde están sus límites."],
  ["Aplicar", "NotebookLM para aprender y enseñar", "Trabajá con tus propias fuentes, guías, resúmenes y materiales."],
  ["Verificar", "Criterio, ética y evidencia", "Tomá decisiones responsables sin delegar tu pensamiento."],
] as const;
```

Use `courseSeed.modules` for the 11-module summary so visible content and course data cannot drift. Keep all sections server-rendered and use CSS decoration with `aria-hidden="true"`.

- [ ] **Step 5: Create the route page**

```tsx
import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Curso de inteligencia artificial gratis para docentes y estudiantes",
  description: "Aprendé IA y NotebookLM con 11 módulos gratuitos, actividades, exámenes y recursos para enseñar y estudiar mejor.",
  alternates: { canonical: "/" },
};

export default function MarketingHomePage() {
  return <LandingPage />;
}
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/components/marketing/landing-page.test.tsx src/app/theme.test.ts`  
Expected: PASS, including the existing IA Cognitiva theme assertions.

- [ ] **Step 7: Commit**

```powershell
git add src/app/'(marketing)' src/components/marketing src/app/globals.css tailwind.config.ts
git commit -m "feat: add SEO-focused course landing"
```

---

### Task 3: Add accessible FAQ behavior

**Files:**
- Create: `src/components/marketing/faq-list.tsx`
- Create: `src/components/marketing/faq-list.test.tsx`
- Modify: `src/components/marketing/landing-page.tsx`

- [ ] **Step 1: Write the failing accessibility test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqList } from "./faq-list";

it("links each FAQ button to visible server-provided answer content", () => {
  render(<FaqList items={[{ question: "¿Es gratuito?", answer: "Sí, todo el curso es gratuito." }]} />);
  const button = screen.getByRole("button", { name: "¿Es gratuito?" });
  expect(button).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Sí, todo el curso es gratuito.")).toBeVisible();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/components/marketing/faq-list.test.tsx`  
Expected: FAIL because `FaqList` does not exist.

- [ ] **Step 3: Implement the accordion**

Create a client component with a `Set<number>` open state. Each `button` must set `aria-expanded`, `aria-controls="faq-answer-N"`; each answer must use `id="faq-answer-N"`, `role="region"`, and `aria-labelledby="faq-question-N"`. Render answers in the initial HTML and collapse them with the `hidden` attribute only after hydration.

Use the five approved questions from the design and explicit answers derived from `courseSeed`: free access, no prerequisites, both audiences, module certificates after passing, and a plain-language NotebookLM explanation.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- src/components/marketing/faq-list.test.tsx src/components/marketing/landing-page.test.tsx`  
Expected: PASS.

```powershell
git add src/components/marketing
git commit -m "feat: add accessible course FAQ"
```

---

### Task 4: Add metadata, JSON-LD, sitemap, robots and social image

**Files:**
- Create: `src/lib/marketing/seo.ts`
- Create: `src/lib/marketing/seo.test.ts`
- Modify: `src/app/(marketing)/page.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Write failing SEO tests**

```ts
import { describe, expect, it } from "vitest";
import { buildCourseJsonLd, getCanonicalOrigin } from "./seo";

describe("marketing SEO", () => {
  it("normalizes the canonical origin", () => {
    expect(getCanonicalOrigin("https://academia.example/")).toBe("https://academia.example");
  });

  it("describes only verified course facts", () => {
    const jsonLd = buildCourseJsonLd("https://academia.example");
    expect(jsonLd["@type"]).toBe("Course");
    expect(jsonLd.isAccessibleForFree).toBe(true);
    expect(jsonLd.numberOfCredits).toBeUndefined();
    expect(jsonLd.aggregateRating).toBeUndefined();
    expect(jsonLd.provider).toMatchObject({ "@type": "Organization", name: "Academia IA Educativa" });
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/lib/marketing/seo.test.ts`  
Expected: FAIL because `seo.ts` does not exist.

- [ ] **Step 3: Implement SEO builders**

`getCanonicalOrigin` must use `NEXT_PUBLIC_APP_URL`, remove a trailing slash, and fall back to `http://localhost:3000`. `buildCourseJsonLd` must return a typed JSON object with `@context`, `@type`, `name`, `description`, `url`, `inLanguage: "es"`, `isAccessibleForFree: true`, `provider`, `educationalLevel: "Principiante"`, and `about` values for IA, NotebookLM and educación.

Render the JSON-LD in the landing with:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd).replace(/</g, "\\u003c") }}
/>
```

- [ ] **Step 4: Add metadata files**

`sitemap.ts` must include `/`, `/dashboard`, `/program`, `/modules`, `/privacy` with correct priorities and the canonical origin. `robots.ts` must allow `/`, disallow `/account`, `/auth`, `/api`, and include the absolute sitemap URL. `opengraph-image.tsx` must use `ImageResponse`, 1200×630, the Neural blue + magenta palette, the title, `Curso gratuito`, and the verified `11 módulos · 33 lecciones` line.

- [ ] **Step 5: Run tests and inspect metadata routes**

Run: `npm test -- src/lib/marketing/seo.test.ts`  
Expected: PASS.

Run: `npm run dev`, then request `/sitemap.xml`, `/robots.txt`, and `/opengraph-image` in the browser.  
Expected: valid XML/text/image responses using the configured canonical origin.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/marketing src/app/sitemap.ts src/app/robots.ts src/app/opengraph-image.tsx src/app/'(marketing)'/page.tsx
git commit -m "feat: add course SEO metadata"
```

---

### Task 5: Add newsletter database schema and private admin client

**Files:**
- Create: `supabase/migrations/20260622190000_marketing_subscribers.sql`
- Create: `src/lib/supabase/admin.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add the SQL migration**

The migration must create:

```sql
create table public.marketing_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(trim(email))),
  display_name text,
  consented_at timestamptz not null,
  source text not null default 'landing_prompt_kit',
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketing_rate_limits (
  origin_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null check (attempts > 0)
);

alter table public.marketing_subscribers enable row level security;
alter table public.marketing_rate_limits enable row level security;
revoke all on public.marketing_subscribers from anon, authenticated;
revoke all on public.marketing_rate_limits from anon, authenticated;
```

Add `public.consume_marketing_rate_limit(p_origin_hash text)` as a `security definer` function with a fixed 15-minute window. It must return `true` for attempts 1–5, `false` thereafter, reset after 15 minutes, set `search_path = public`, and revoke execution from `public`, `anon`, and `authenticated` while granting it to `service_role`.

Add `updated_at` trigger behavior and indexes for `created_at` and active subscribers.

- [ ] **Step 2: Add the private client**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
```

- [ ] **Step 3: Document environment variables**

Add server-only entries to `.env.example`:

```dotenv
MARKETING_HASH_SECRET=
MARKETING_DOWNLOAD_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=Academia IA <recursos@example.com>
```

- [ ] **Step 4: Validate migration and commit**

Run: `npx supabase db reset`  
Expected: all migrations apply and course seed completes.

```powershell
git add supabase/migrations/20260622190000_marketing_subscribers.sql src/lib/supabase/admin.ts .env.example
git commit -m "feat: add marketing subscriber storage"
```

---

### Task 6: Implement validated, idempotent newsletter subscription

**Files:**
- Create: `src/lib/marketing/newsletter.ts`
- Create: `src/lib/marketing/newsletter.test.ts`
- Create: `src/lib/marketing/download-token.ts`
- Create: `src/lib/marketing/download-token.test.ts`
- Create: `src/lib/marketing/resend.ts`

- [ ] **Step 1: Write validation and token tests**

```ts
import { describe, expect, it } from "vitest";
import { validateNewsletterInput } from "./newsletter";

it("normalizes valid consented subscriber input", () => {
  expect(validateNewsletterInput({ email: " Docente@Example.com ", name: " Ana ", consent: true, company: "" })).toEqual({
    ok: true,
    value: { email: "docente@example.com", name: "Ana", consent: true },
  });
});

it("rejects missing consent and honeypot submissions", () => {
  expect(validateNewsletterInput({ email: "a@b.com", name: "", consent: false, company: "" }).ok).toBe(false);
  expect(validateNewsletterInput({ email: "a@b.com", name: "", consent: true, company: "bot" }).ok).toBe(false);
});
```

```ts
import { describe, expect, it } from "vitest";
import { createDownloadToken, verifyDownloadToken } from "./download-token";

it("accepts current signed tokens and rejects tampering", () => {
  const token = createDownloadToken("docente@example.com", "secret", 1_800_000_000);
  expect(verifyDownloadToken(token, "secret", 1_800_000_001)).toBe("docente@example.com");
  expect(verifyDownloadToken(`${token}x`, "secret", 1_800_000_001)).toBeNull();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/lib/marketing/newsletter.test.ts src/lib/marketing/download-token.test.ts`  
Expected: FAIL because implementation files do not exist.

- [ ] **Step 3: Implement validation and HMAC tokens**

`validateNewsletterInput` must normalize name and email, reuse the email grammar from auth validation, require consent, reject a non-empty `company` honeypot, cap name at 80 characters, and return Spanish field-safe errors.

`download-token.ts` must use Node `createHmac("sha256", secret)` and `timingSafeEqual`. The URL-safe payload must contain normalized email and a 24-hour expiry. Export `createDownloadToken`, `verifyDownloadToken`, `createUnsubscribeToken`, and `verifyUnsubscribeToken`; use distinct HMAC namespaces `download:` and `unsubscribe:`.

- [ ] **Step 4: Implement subscription orchestration**

Export:

```ts
export type NewsletterResult =
  | { status: "success" | "already_subscribed"; downloadUrl: string; emailSent: boolean }
  | { status: "invalid" | "rate_limited" | "unavailable"; message: string };
```

`subscribeToNewsletter(input, requestContext, dependencies)` must:

1. validate input;
2. hash the request origin with `MARKETING_HASH_SECRET`;
3. call `consume_marketing_rate_limit`;
4. upsert the normalized subscriber, clearing `unsubscribed_at` only after new explicit consent;
5. create signed download and unsubscribe links;
6. call `sendPromptKitEmail` only when Resend configuration exists;
7. return the download URL even when email sending fails;
8. never expose Supabase or Resend error text to the client.

Use dependency injection for admin client, clock, token functions and email sender so tests cover success, duplicate, re-subscription, rate limit, missing Supabase and email failure without network access.

- [ ] **Step 5: Implement Resend using fetch**

POST to `https://api.resend.com/emails` with bearer authorization, configured `from`, recipient, subject `Tu kit de prompts de Academia IA`, a plain-text body, and an HTML body containing signed download and unsubscribe links. Return `false` for missing configuration or any non-2xx response; do not throw into the action.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- src/lib/marketing/newsletter.test.ts src/lib/marketing/download-token.test.ts`  
Expected: PASS for valid, invalid, duplicate, rate-limited and degraded email cases.

```powershell
git add src/lib/marketing
git commit -m "feat: add newsletter subscription service"
```

---

### Task 7: Generate and protect the prompt kit download

**Files:**
- Create: `content/marketing/prompt-kit.ts`
- Create: `src/lib/marketing/prompt-kit-pdf.ts`
- Create: `scripts/generate-prompt-kit.ts`
- Modify: `package.json`
- Generate for QA: `.generated/marketing/kit-prompts-ia-educativa.pdf`
- Create: `src/app/api/marketing/kit/route.ts`
- Create: `src/app/api/marketing/kit/route.test.ts`

- [ ] **Step 1: Define the kit content**

Create at least 20 original prompts grouped into four exact categories: planificar clases, estudiar y comprender, investigar con fuentes, verificar respuestas. Every prompt must contain `Objetivo`, `Prompt`, and `Cómo adaptarlo`; avoid third-party copied text and unsupported claims.

- [ ] **Step 2: Add a deterministic PDF generator**

Use the existing `pdf-lib` dependency. Export `createPromptKitPdf(): Promise<Uint8Array>` from `src/lib/marketing/prompt-kit-pdf.ts`; it must create A4 pages, embed a standard font, wrap lines at a fixed width, add page numbers, and include the Academia IA title and production URL. The script calls that function and writes exactly `.generated/marketing/kit-prompts-ia-educativa.pdf` for visual inspection. The API route calls the same function in memory, so the PDF cannot be bypassed through a public static URL.

Add:

```json
"kit:generate": "tsx scripts/generate-prompt-kit.ts"
```

Run: `npm run kit:generate`  
Expected: the PDF is regenerated without network access and has at least five pages.

- [ ] **Step 3: Write the failing route test**

Test the route with a valid token, expired token and tampered token. Valid requests must return status 200, `Content-Type: application/pdf`, and `Content-Disposition: attachment; filename="kit-prompts-ia-educativa.pdf"`; invalid requests must return 403.

- [ ] **Step 4: Implement the signed download route**

Read `token` from the query string, require `MARKETING_DOWNLOAD_SECRET`, verify the token, call `createPromptKitPdf()`, and return private download headers:

```ts
{
  "Content-Type": "application/pdf",
  "Content-Disposition": 'attachment; filename="kit-prompts-ia-educativa.pdf"',
  "Cache-Control": "private, no-store",
}
```

- [ ] **Step 5: Run tests, render PDF pages and commit**

Run: `npm test -- src/app/api/marketing/kit/route.test.ts`  
Expected: PASS.

Render the PDF to images with the workspace PDF tooling and inspect the first, middle and final page for clipping, missing accents, blank pages and page-number overlap.

```powershell
git add content/marketing src/lib/marketing/prompt-kit-pdf.ts scripts/generate-prompt-kit.ts package.json package-lock.json src/app/api/marketing/kit
git commit -m "feat: add downloadable prompt kit"
```

---

### Task 8: Connect the newsletter form to the landing

**Files:**
- Create: `src/components/marketing/newsletter-form.tsx`
- Create: `src/components/marketing/newsletter-form.test.tsx`
- Create: `src/lib/marketing/actions.ts`
- Create: `src/lib/marketing/analytics.ts`
- Create: `src/lib/marketing/analytics.test.ts`
- Modify: `src/components/marketing/landing-page.tsx`

- [ ] **Step 1: Write failing form tests**

Use Testing Library to verify: required email, required consent, hidden `company` honeypot, disabled pending button, accessible error region, success download link, and the same success UI for `already_subscribed`.

Also test `trackMarketingEvent` with no analytics provider and with a `window.dataLayer` array. It must never throw and must append only these event names: `course_cta_click`, `newsletter_subscribed`, `prompt_kit_download`.

- [ ] **Step 2: Implement the server action**

`subscribeNewsletterAction` must read `name`, `email`, `consent`, `company`; obtain `x-forwarded-for` and `user-agent` through `headers()`; call `subscribeToNewsletter`; and return the typed result. It must not redirect because the client component needs inline feedback.

- [ ] **Step 3: Implement the client form**

Use `useActionState` and `useFormStatus`. Include:

- optional name input;
- required email input with `type="email"` and `autoComplete="email"`;
- visually hidden honeypot excluded from tab order;
- required consent checkbox linking to `/privacy`;
- pending label `Preparando tu kit…`;
- `role="status" aria-live="polite"` result area;
- signed download link on success;
- retry-preserving fields for temporary errors.

Add event calls to the hero course CTA, successful subscription state, and kit download link. `analytics.ts` must be provider-neutral: push `{ event: name }` only when `window.dataLayer` exists, otherwise perform no network request. This prepares measurement without installing a tracker or changing consent behavior.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- src/components/marketing/newsletter-form.test.tsx src/lib/marketing/newsletter.test.ts src/lib/marketing/analytics.test.ts`  
Expected: PASS.

```powershell
git add src/components/marketing src/lib/marketing/actions.ts
git commit -m "feat: connect landing newsletter form"
```

---

### Task 9: Add privacy and unsubscribe flows

**Files:**
- Create: `src/app/(marketing)/privacy/page.tsx`
- Create: `src/app/(marketing)/unsubscribe/page.tsx`
- Create: `src/app/api/marketing/unsubscribe/route.ts`
- Create: `src/app/api/marketing/unsubscribe/route.test.ts`
- Modify: `src/components/marketing/marketing-footer.tsx`

- [ ] **Step 1: Write unsubscribe route tests**

Valid signed tokens must set `unsubscribed_at` for the token email and redirect to `/unsubscribe?status=success`. Invalid or expired tokens must redirect to `/unsubscribe?status=invalid`. Database failures must redirect to `/unsubscribe?status=error` without exposing details.

- [ ] **Step 2: Implement the route**

Verify the namespaced unsubscribe token, call the admin client update filtered by normalized email, and issue only the three specified redirects.

- [ ] **Step 3: Add legal pages**

The privacy page must state: data collected, purpose, lawful consent basis, storage provider, email provider when configured, retention until unsubscribe, user rights, and a contact sourced from `NEXT_PUBLIC_CONTACT_EMAIL`. Add that variable to `.env.example` with an empty default; when absent, show the repository owner contact route rather than inventing an email address.

The unsubscribe page must render explicit success, invalid-link and temporary-error messages from the `status` query parameter, plus a link back to `/`.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- src/app/api/marketing/unsubscribe/route.test.ts`  
Expected: PASS.

```powershell
git add src/app/'(marketing)'/privacy src/app/'(marketing)'/unsubscribe src/app/api/marketing/unsubscribe src/components/marketing/marketing-footer.tsx .env.example
git commit -m "feat: add newsletter privacy controls"
```

---

### Task 10: Full verification and production handoff

**Files:**
- Modify: `README.md`
- Verify: all implementation files

- [ ] **Step 1: Update operational documentation**

Document `/`, `/dashboard`, required Supabase migration, `npm run kit:generate`, optional Resend variables, `MARKETING_HASH_SECRET`, `MARKETING_DOWNLOAD_SECRET`, Search Console steps, sitemap URL, and the fact that ranking is not guaranteed.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test`  
Expected: all old and new Vitest tests pass.

Run: `npm run lint`  
Expected: zero ESLint errors.

Run: `npm run build`  
Expected: successful production build with `/`, `/dashboard`, metadata endpoints and marketing APIs listed.

- [ ] **Step 3: Verify the complete browser story**

Run the production build locally. Check at 375×812, 768×1024 and 1440×900:

1. landing loads without course sidebar;
2. header anchors work and keyboard focus is visible;
3. reduced-motion mode removes nonessential motion;
4. hero CTA opens `/dashboard`;
5. dashboard and all sidebar routes work;
6. FAQ buttons expose correct `aria-expanded` state;
7. invalid form input is announced;
8. valid signup produces a kit download;
9. signed kit link downloads a valid PDF;
10. unsubscribe link updates the subscriber;
11. `/sitemap.xml`, `/robots.txt`, canonical and social image are correct.

- [ ] **Step 4: Measure the production-like page**

Run Lighthouse against `/` in mobile mode. Record Performance, Accessibility, Best Practices and SEO scores in the implementation handoff. Investigate any accessibility or SEO score below 95 and any CLS above 0.1 before completion.

- [ ] **Step 5: Check repository state and commit docs**

Run: `git status --short`  
Expected: only the intended README change remains.

```powershell
git add README.md
git commit -m "docs: add marketing landing operations"
```

- [ ] **Step 6: Deployment checklist**

Before publishing, configure production Supabase migration and server-only secrets in Vercel, regenerate the prompt kit, deploy, verify production canonical URL, submit `/sitemap.xml` to Google Search Console, and confirm that no service-role or Resend key appears in client bundles or logs.
