// ~src/app/(dashboard)/admin/tables/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { UserRole } from "~/lib/shared-types";
import EditTableForm from "~/components/dashboard/admin/tables/edit-table-form";

interface EditTablePageProps {
  params: {
    id: string;
  };
}

export default async function EditTablePage({ params }: EditTablePageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    notFound(); // or redirect("/login")
  }

  const table = await db.table.findUnique({
    where: { id: params.id },
  });

  if (!table) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="mb-4 text-3xl font-bold">Edit Table</h1>
      <EditTableForm table={table} />
    </div>
  );
}
