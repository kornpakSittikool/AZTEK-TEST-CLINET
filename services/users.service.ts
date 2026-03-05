import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

type UpdateUserInput = {
  email?: string;
  score?: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserById(id: string) {
  return prisma.users.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

export async function createUser(email: string) {
  return prisma.users.create({
    data: {
      id: randomUUID(),
      email: normalizeEmail(email),
    },
  });
}

export async function updateUserById(id: string, input: UpdateUserInput) {
  const data: UpdateUserInput = {
    ...input,
  };

  if (data.email) {
    data.email = normalizeEmail(data.email);
  }

  return prisma.users.update({
    where: { id },
    data,
  });
}

export async function deleteUserById(id: string) {
  return prisma.users.delete({
    where: { id },
  });
}

export async function upsertUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return prisma.users.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: {
      id: randomUUID(),
      email: normalizedEmail,
    },
  });
}

export async function listUsersByScore() {
  return prisma.users.findMany({
    orderBy: [{ score: "desc" }, { created_at: "asc" }],
    select: {
      id: true,
      email: true,
      score: true,
      created_at: true,
    },
  });
}
