"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex rounded-xl border border-[#bdc8d8] px-4 py-2 text-sm font-medium text-[#121b2a] hover:bg-white/70"
    >
      Sign out
    </button>
  );
}
