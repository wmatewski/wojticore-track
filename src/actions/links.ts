"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { generateUniqueShortCode } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { buildShortUrl, normalizeDestinationUrl } from "@/lib/site";
import {
  createLinkSchema,
  getValidationMessage,
  type LinkActionState,
} from "@/lib/validation";

export async function createLinkAction(
  _previousState: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const session = await requireUser();
  const parsed = createLinkSchema.safeParse({
    url: formData.get("url"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: getValidationMessage(parsed.error),
    };
  }

  const normalizedUrl = normalizeDestinationUrl(parsed.data.url);

  if (!normalizedUrl) {
    return {
      status: "error",
      message: "Podaj poprawny adres URL z protokolem http lub https.",
    };
  }

  try {
    const shortCode = await generateUniqueShortCode();

    await prisma.link.create({
      data: {
        userId: session.user.id,
        originalUrl: normalizedUrl,
        shortCode,
      },
    });

    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Link zostal zapisany i jest gotowy do wysylki.",
      shortUrl: buildShortUrl(shortCode),
    };
  } catch {
    return {
      status: "error",
      message: "Nie udalo sie zapisac linku. Sprobuj ponownie.",
    };
  }
}

export async function updateLinkDestinationAction(
  _previousState: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const session = await requireUser();
  const linkId = formData.get("linkId");
  const parsed = createLinkSchema.safeParse({
    url: formData.get("url"),
  });

  if (typeof linkId !== "string" || !linkId) {
    return {
      status: "error",
      message: "Nie mozna zaktualizowac linku bez identyfikatora.",
    };
  }

  if (!parsed.success) {
    return {
      status: "error",
      message: getValidationMessage(parsed.error),
    };
  }

  const normalizedUrl = normalizeDestinationUrl(parsed.data.url);

  if (!normalizedUrl) {
    return {
      status: "error",
      message: "Podaj poprawny adres URL z protokolem http lub https.",
    };
  }

  const ownedLink = await prisma.link.findFirst({
    where: {
      id: linkId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!ownedLink) {
    return {
      status: "error",
      message: "Nie znaleziono linku lub nie masz do niego dostepu.",
    };
  }

  await prisma.link.update({
    where: {
      id: ownedLink.id,
    },
    data: {
      originalUrl: normalizedUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/links/${ownedLink.id}`);

  return {
    status: "success",
    message: "Adres docelowy zostal zaktualizowany.",
  };
}

export async function deleteLinkAction(formData: FormData) {
  const session = await requireUser();
  const linkId = formData.get("linkId");

  if (typeof linkId !== "string" || !linkId) {
    return;
  }

  const ownedLink = await prisma.link.findFirst({
    where: {
      id: linkId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!ownedLink) {
    return;
  }

  await prisma.link.delete({
    where: {
      id: ownedLink.id,
    },
  });

  revalidatePath("/dashboard");
}