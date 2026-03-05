import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MatchResult = "WIN" | "LOSE" | "DRAW";

export type MatchSummary = {
  result: MatchResult;
  score: number;
  winStreak: number;
  scoreDelta: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getScoreDeltaAndStreak(currentWinStreak: number, result: MatchResult) {
  if (result === "WIN") {
    const nextStreakCandidate = currentWinStreak + 1;
    if (nextStreakCandidate >= 3) {
      return {
        scoreDelta: 2,
        nextWinStreak: 0,
      };
    }

    return {
      scoreDelta: 1,
      nextWinStreak: nextStreakCandidate,
    };
  }

  if (result === "LOSE") {
    return {
      scoreDelta: -1,
      nextWinStreak: 0,
    };
  }

  return {
    scoreDelta: 0,
    nextWinStreak: 0,
  };
}

export async function recordMatchResult(email: string, result: MatchResult): Promise<MatchSummary> {
  const normalizedEmail = normalizeEmail(email);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let user = await tx.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await tx.users.create({
        data: {
          id: randomUUID(),
          email: normalizedEmail,
        },
      });
    }

    const latestMatch = await tx.match_history.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      select: { win_streak_after: true },
    });
    const currentWinStreak = latestMatch?.win_streak_after ?? 0;

    const { scoreDelta, nextWinStreak } = getScoreDeltaAndStreak(currentWinStreak, result);

    const updatedUser = await tx.users.update({
      where: { id: user.id },
      data: {
        score: {
          increment: scoreDelta,
        },
      },
    });

    await tx.match_history.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        result,
        score_delta: scoreDelta,
        win_streak_after: nextWinStreak,
      },
    });

    return {
      result,
      score: updatedUser.score,
      winStreak: nextWinStreak,
      scoreDelta,
    };
  });
}

export async function getCurrentWinStreakByUserId(userId: string) {
  const latestMatch = await prisma.match_history.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    select: { win_streak_after: true },
  });

  return latestMatch?.win_streak_after ?? 0;
}
