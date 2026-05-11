import { notFound } from "next/navigation";

import { VisitRedirector } from "@/components/visit-redirector";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type VisitPageProps = {
  params: Promise<{
    visitId: string;
  }>;
};

export default async function VisitPage({ params }: VisitPageProps) {
  const { visitId } = await params;
  const visit = await prisma.visit.findUnique({
    where: {
      id: visitId,
    },
    select: {
      id: true,
      link: {
        select: {
          originalUrl: true,
        },
      },
    },
  });

  if (!visit) {
    notFound();
  }

  return <VisitRedirector visitId={visit.id} originalUrl={visit.link.originalUrl} />;
}
