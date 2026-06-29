# CraftPortfolio — AI-Powered Portfolio Generator

CraftPortfolio is a modern, high-performance web application designed to generate stunning, professional, and recruiter-ready personal portfolios in under 60 seconds from a single English prompt.

Live URL: **[brocaption.vercel.app](https://brocaption.vercel.app)**
---

##  Key Features

* **AI-Driven Portfolio Generation**: Describe your background, education, projects, and skills in plain English. The AI automatically compiles a fully styled, multi-section portfolio.
* **Interactive Live Editor Workspace**: Custom sidebar editor sheets allow users to update texts, toggle sections, adjust layout styles, and upload images.
* **AI Chat Assistant**: Refine and iterate on the generated portfolio dynamically using a built-in AI chatbot that updates the underlying HTML.
* **Download Standalone HTML**: Export your fully compiled portfolio as a single, lightweight `index.html` file packaged with Tailwind CSS structure and Flowbite data attributes for offline hosting and easy deployment (e.g. Vercel, Netlify, Github Pages).
* **Credit-Based Tiers**: Atomic credits check system with Clerk authentication integration, Razorpays payment gateways, and custom credit balances.
* **Ambient Neon Aesthetic**: A sleek Onyx and Saffron dark theme featuring responsive scroll reveal animations, custom thin dark scrollbars, and interactive layout elements.

---

##  Technology Stack

* **Frontend**: Next.js 16 (App Router, Turbopack), React, Tailwind CSS v4, Shadcn UI Components.
* **Database & ORM**: PostgreSQL (Neon Serverless Database), Drizzle ORM.
* **Authentication**: Clerk authentication.
* **Payment Gateway**: Razorpay.
* **Icons & Animation**: Lucide Icons, IntersectionObserver Scroll Reveal, Tailwind Animations.
* **Error Tracking**: Sentry.

---

##  Getting Started

### Prerequisites

* Node.js v20 or newer
* npm, yarn, pnpm, or bun package manager
* Neon PostgreSQL connection URI
* Clerk API publishable keys
* OpenRouter API key

### 1. Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/Fenil-Techy/site-craft-ai.git
cd site-craft-ai
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
DATABASE_URL=postgres://...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

OPENROUTER_API_KEY=sk-or-v1-...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### 3. Database Migrations

Apply the Drizzle schema migrations to your Neon database branch:

```bash
npx drizzle-kit push
```

### 4. Run Development Server

Launch the Next.js development build locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

---

##  Commands Reference

* **Start Development**: `npm run dev`
* **Production Build**: `npm run build`
* **Lint Files**: `npm run lint`
* **Run Unit Tests**: `npm run test`
* **Database Studio**: `npx drizzle-kit studio`
