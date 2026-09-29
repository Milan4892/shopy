"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f9f5] text-[#111713]">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[850px] -translate-x-1/2 rounded-full bg-lime-300/20 blur-[140px]" />
        <div className="absolute -right-40 top-[500px] h-[450px] w-[450px] rounded-full bg-emerald-200/20 blur-[130px]" />
      </div>

      <nav className="relative z-20 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-black shadow-lg shadow-lime-400/20">
              S
            </div>

            <span className="text-xl font-black tracking-tight">
              SHOPY
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            <Link
              href="/"
              className="text-[#111713] transition hover:text-lime-600"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="transition hover:text-[#111713]"
            >
              E-Bikes
            </Link>

            <a
              href="#how-it-works"
              className="transition hover:text-[#111713]"
            >
              How It Works
            </a>

            <a
              href="#features"
              className="transition hover:text-[#111713]"
            >
              Features
            </a>

            <Link
              href="/login"
              className="transition hover:text-[#111713]"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#111713] px-5 py-2.5 font-semibold text-white transition hover:bg-black"
            >
              Get Started
            </Link>
          </div>

          <Link
            href="/products"
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold md:hidden"
          >
            Explore
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-700">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
              Smart Mobility Platform
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] md:text-7xl lg:text-8xl">
              Move
              <span className="text-lime-500"> smarter.</span>
              <br />
              Live
              <span className="text-gray-400"> better.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Discover modern electric mobility with Shoppy.
              Explore e-bikes, manage your digital experience and
              access powerful platform features in one place.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="group flex items-center justify-center gap-2 rounded-xl bg-[#111713] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-black"
              >
                Explore E-Bikes
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/register"
                className="flex items-center justify-center rounded-xl border border-black/10 bg-white px-7 py-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-black/20"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-5 border-t border-black/[0.08] pt-7">
              <div>
                <p className="text-2xl font-black">9</p>
                <p className="mt-1 text-xs text-gray-500">
                  E-Bike Models
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">2×</p>
                <p className="mt-1 text-xs text-gray-500">
                  Daily Mining Limit
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-lime-600">
                  24/7
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Platform Access
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-10 rounded-full bg-lime-300/30 blur-[100px]" />

            <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white p-6 shadow-2xl shadow-black/10">
              <div className="absolute right-5 top-5 rounded-full border border-lime-500/20 bg-lime-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-lime-700">
                SHOPY ELECTRIC
              </div>

              <div className="flex h-[430px] items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-black tracking-tight text-lime-500 drop-shadow-xl transition duration-500 hover:scale-110 md:text-[150px]">
                    S9
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.35em] text-gray-400">
                    Smart electric mobility
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-black/[0.06] bg-white/90 p-5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Featured
                    </p>

                    <p className="mt-1 font-bold">
                      Shoppy E-Bike S9
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Price
                    </p>

                    <p className="mt-1 font-black text-lime-600">
                      ₦200,000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 border-y border-black/[0.06] bg-white/60 px-6 py-20 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-600">
              Why Shoppy
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              More than just an e-bike.
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Shoppy combines modern mobility with useful digital
              features in one simple platform.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon="01"
              title="E-Bike Marketplace"
              text="Explore different electric bike models and choose the one that fits you."
            />

            <FeatureCard
              icon="02"
              title="Daily Mining"
              text="Eligible bikes can participate in the Shoppy daily mining system."
            />

            <FeatureCard
              icon="03"
              title="Digital Wallet"
              text="Manage your Shoppy balance and platform transactions in one place."
            />

            <FeatureCard
              icon="04"
              title="Referral Rewards"
              text="Invite others and participate in the Shoppy referral system."
            />
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-600">
              Simple Process
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              How Shoppy works
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-gray-600">
              Getting started is simple. Explore, choose your bike,
              and manage your Shoppy experience.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <StepCard
              number="01"
              title="Create an account"
              text="Register your Shoppy account and access your personal platform dashboard."
            />

            <StepCard
              number="02"
              title="Choose your bike"
              text="Browse the marketplace and select an e-bike based on your preferred specifications."
            />

            <StepCard
              number="03"
              title="Start your journey"
              text="Manage your bike, explore available platform features and track your activity."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20 md:px-10 md:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-lime-500/10 bg-lime-400/10 p-8 md:p-14">
          <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-lime-300/30 blur-[100px]" />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-700">
                Get Started
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                Your smarter journey starts here.
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Explore the marketplace and discover what Shoppy
                has to offer.
              </p>
            </div>

            <Link
              href="/products"
              className="shrink-0 rounded-xl bg-[#111713] px-7 py-4 text-sm font-bold text-white transition hover:bg-black"
            >
              Explore E-Bikes →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] bg-white/60 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-gray-500 md:flex-row">
          <p>© 2026 Shoppy. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/products" className="hover:text-gray-900">
              E-Bikes
            </Link>

            <Link href="/login" className="hover:text-gray-900">
              Login
            </Link>

            <Link href="/register" className="hover:text-gray-900">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-lime-500/20 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/15 text-sm font-black text-lime-700 transition group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mt-6 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-7 shadow-sm">
      <span className="text-5xl font-black text-lime-500/20">
        {number}
      </span>

      <h3 className="mt-4 text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}