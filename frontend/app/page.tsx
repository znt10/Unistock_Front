"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";

/**
 * Esta é a página raiz do site ('/').
 * Sua única função é redirecionar o usuário para a página de login.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Assim que o componente montar, redireciona o usuário.
    router.replace("/login");
  }, [router]);

  // Enquanto o redirecionamento acontece, mostramos um indicador de carregamento
  // para que o usuário não veja uma tela em branco.
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3">
      <Spinner color="success" />
      <span className="text-sm font-medium text-success">
        Carregando Unistock
      </span>
    </div>
  );
}
