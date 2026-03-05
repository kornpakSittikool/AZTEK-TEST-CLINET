"use client";

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#efede8] px-4 py-10 text-[#16243a]">
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[560px] items-center">
        <section className="w-full rounded-[34px] border border-[#dcd9d2] bg-[#f7f6f3] p-10 shadow-[0_20px_50px_-35px_rgba(16,24,40,0.55)] sm:p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#bdc8d8] bg-white/60 shadow-sm">
              <span className="text-xl font-bold tracking-tight text-[#121b2a]">XO</span>
            </div>
          </div>

          <h1 className="mt-8 text-[52px] font-semibold leading-[0.95] tracking-tight text-[#121b2a]">
            Sign in
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#516277]">
            with Google to access your dashboard and start playing.
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#bdc8d8] bg-white/55 px-5 py-4 text-[20px] font-semibold text-[#121b2a] shadow-sm transition hover:bg-white/80 hover:shadow-md active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#d7d3cb] bg-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.874h5.387a4.608 4.608 0 0 1-1.996 3.022v2.51h3.228c1.89-1.74 2.981-4.305 2.981-7.36Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 22c2.7 0 4.964-.895 6.619-2.412l-3.228-2.51c-.895.6-2.04.954-3.39.954-2.606 0-4.815-1.76-5.605-4.124H3.06v2.588A9.994 9.994 0 0 0 12 22Z"
                  fill="#34A853"
                />
                <path
                  d="M6.395 13.908A5.997 5.997 0 0 1 6.08 12c0-.663.114-1.308.315-1.909V7.503H3.06A9.994 9.994 0 0 0 2 12c0 1.615.387 3.145 1.06 4.497l3.335-2.589Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.968c1.468 0 2.786.504 3.823 1.495l2.868-2.868C16.959 2.982 14.695 2 12 2a9.994 9.994 0 0 0-8.94 5.503l3.335 2.588C7.185 7.727 9.394 5.968 12 5.968Z"
                  fill="#EA4335"
                />
              </svg>
            </span>

            <span>Continue with Google</span>
          </button>
          <p className="mt-8 text-xs text-[#7a8796]">
            You&apos;ll be redirected to your dashboard after signing in.
          </p>
        </section>
      </main>
    </div>
  );
}
