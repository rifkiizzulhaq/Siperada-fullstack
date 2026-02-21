import KpEditForm from "@/src/features/(admin)/komponen-program/components/KpEditForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function KomponenProgramEditPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) return notFound();

  return (
    <div className="p-4">
      <KpEditForm id={numericId} />
    </div>
  );
}
