import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#efede8] px-4 py-10 text-[#16243a]">
      <main className="mx-auto w-full max-w-[560px] rounded-[34px] border border-[#dcd9d2] bg-[#f7f6f3] p-10 shadow-[0_20px_50px_-35px_rgba(16,24,40,0.55)] sm:p-12">
        <p className="text-sm text-[#516277]">Signed in as</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#121b2a]">Dashboard</h1>

        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#d7d3cb] bg-white/60 p-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#d7d3cb] text-sm font-semibold text-[#121b2a]">
              {user.name?.slice(0, 1)?.toUpperCase() ?? "U"}
            </div>
          )}

          <div>
            <p className="font-medium text-[#121b2a]">{user.name ?? "Google User"}</p>
            <p className="text-sm text-[#516277]">{user.email}</p>
          </div>
        </div>

        <SignOutButton />
      </main>
    </div>
  );
}
