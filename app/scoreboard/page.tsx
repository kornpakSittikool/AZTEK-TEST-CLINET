import Link from "next/link";
import { listUsersByScore } from "@/services/users.service";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
}

export default async function ScoreboardPage() {
  const users = await listUsersByScore();

  return (
    <div className="min-h-screen bg-[#efede8] px-4 py-10 text-[#16243a]">
      <main className="mx-auto w-full max-w-[760px] rounded-[34px] border border-[#dcd9d2] bg-[#f7f6f3] p-8 shadow-[0_20px_50px_-35px_rgba(16,24,40,0.55)] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#516277]">All Players</p>
            <h1 className="text-3xl font-semibold text-[#121b2a]">Scoreboard</h1>
            <p className="mt-1 text-sm text-[#516277]">Total users: {users.length}</p>
          </div>

          <Link
            href="/"
            className="inline-flex rounded-xl border border-[#bdc8d8] px-4 py-2 text-sm font-medium text-[#121b2a] hover:bg-white/70"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#d7d3cb] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f2f0eb] text-[#516277]">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#7a8796]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((player, index) => (
                  <tr key={player.id} className="border-t border-[#ece8de]">
                    <td className="px-4 py-3 font-medium text-[#121b2a]">{index + 1}</td>
                    <td className="px-4 py-3 text-[#121b2a]">{player.email}</td>
                    <td className="px-4 py-3 font-semibold text-[#121b2a]">{player.score}</td>
                    <td className="px-4 py-3 text-[#516277]">{formatDate(player.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
