import { auth, clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
};

function buildUserName(email: string | null, firstName: string | null, lastName: string | null, username: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (username) {
    return username;
  }

  return email?.split("@")[0] ?? null;
}

function isEmailUniqueConstraint(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes("email");
  }

  return target === "email";
}

async function syncClerkUser(userId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email =
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const name = buildUserName(email, clerkUser.firstName, clerkUser.lastName, clerkUser.username);
  const data = {
    email,
    name,
    image: clerkUser.imageUrl,
  };

  const existingById = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (existingById) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: userSelect,
    });
  }

  if (email) {
    const existingByEmail = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: {
          id: existingByEmail.id,
        },
        data,
        select: userSelect,
      });
    }
  }

  try {
    return await prisma.user.create({
      data: {
        id: userId,
        ...data,
      },
      select: userSelect,
    });
  } catch (error) {
    if (email && isEmailUniqueConstraint(error)) {
      const existingByEmail = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (existingByEmail) {
        return prisma.user.update({
          where: {
            id: existingByEmail.id,
          },
          data,
          select: userSelect,
        });
      }
    }

    throw error;
  }
}

export const getAuthSession = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await syncClerkUser(userId);

  return {
    user,
  };
});

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}