import { customAlphabet } from "nanoid";

import { prisma } from "@/lib/prisma";

const createShortCode = customAlphabet(
  "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz",
  7,
);

export async function generateUniqueShortCode() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const shortCode = createShortCode();
    const existingLink = await prisma.link.findUnique({
      where: {
        shortCode,
      },
      select: {
        id: true,
      },
    });

    if (!existingLink) {
      return shortCode;
    }
  }

  throw new Error("Could not generate a unique short code.");
}