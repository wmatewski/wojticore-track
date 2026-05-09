import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

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

export const getAuthSession = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email =
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const name = buildUserName(email, clerkUser.firstName, clerkUser.lastName, clerkUser.username);

  const user = await prisma.user.upsert({
    where: {
      id: userId,
    },
    update: {
      email,
      name,
      image: clerkUser.imageUrl,
    },
    create: {
      id: userId,
      email,
      name,
      image: clerkUser.imageUrl,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

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