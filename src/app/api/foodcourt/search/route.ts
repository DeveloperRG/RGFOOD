// app/api/foodcourts/search/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const results = await db.foodcourt.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mapped = results.map((fc) => ({
    id: fc.id,
    name: fc.name,
    address: fc.address ?? "-",
    isActive: fc.isActive,
    createdAt: fc.createdAt,
    imageUrl: fc.logo ?? "",
    owner: fc.owner ?? null,
  }));

  return NextResponse.json(mapped);
}
