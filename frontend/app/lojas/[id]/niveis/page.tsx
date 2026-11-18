import { redirect } from "next/navigation";

// A tela de minimo e maximo virou uma so, com escolha de loja (/lojas/niveis).
export default async function NiveisDaLojaRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/lojas/niveis?loja=${encodeURIComponent(id)}`);
}
