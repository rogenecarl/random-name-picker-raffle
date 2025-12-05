"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getParticipants() {
  return prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function addParticipants(names: string) {
  const nameList = names
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (nameList.length === 0) {
    return { error: "At least one name is required" };
  }

  // Get existing names for duplicate check (case-insensitive)
  const existingParticipants = await prisma.participant.findMany();
  const existingNames = new Set(
    existingParticipants.map((p) => p.name.toLowerCase())
  );

  // Filter out duplicates
  const uniqueNames = nameList.filter(
    (name) => !existingNames.has(name.toLowerCase())
  );

  // Also remove duplicates within the input itself
  const uniqueNewNames = [...new Set(uniqueNames.map((n) => n.toLowerCase()))]
    .map((lowerName) => uniqueNames.find((n) => n.toLowerCase() === lowerName)!)
    .filter(Boolean);

  if (uniqueNewNames.length === 0) {
    return { error: "All names already exist", duplicates: nameList.length };
  }

  const result = await prisma.participant.createMany({
    data: uniqueNewNames.map((name) => ({ name })),
  });

  const skipped = nameList.length - uniqueNewNames.length;
  revalidatePath("/");
  return { count: result.count, skipped };
}

export async function deleteParticipant(id: number) {
  await prisma.participant.delete({
    where: { id },
  });
  revalidatePath("/");
  return { success: true };
}

export async function clearAllParticipants() {
  await prisma.participant.deleteMany();
  revalidatePath("/");
  return { success: true };
}

export async function getWinners() {
  return prisma.winner.findMany({
    orderBy: { drawnAt: "desc" },
  });
}

export async function clearWinners() {
  await prisma.winner.deleteMany();
  revalidatePath("/");
  return { success: true };
}

export async function drawWinner() {
  const participants = await prisma.participant.findMany();

  if (participants.length === 0) {
    return { error: "No participants available" };
  }

  const randomIndex = Math.floor(Math.random() * participants.length);
  const winner = participants[randomIndex];

  await prisma.winner.create({
    data: { name: winner.name },
  });

  await prisma.participant.delete({
    where: { id: winner.id },
  });

  revalidatePath("/");
  return { winner: winner.name };
}
