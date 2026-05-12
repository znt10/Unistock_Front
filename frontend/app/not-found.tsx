"use client";

import { Button, Card } from "@heroui/react";
import { Home, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-lg border border-gray-200 bg-white p-4 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <Card.Header className="flex flex-col items-center gap-4">
          <SearchX className="h-16 w-16 text-teal-600" />
          <div className="space-y-1">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Pagina nao encontrada
            </h2>
          </div>
        </Card.Header>

        <Card.Content>
          <p className="text-gray-600 dark:text-gray-400">
            Nao encontramos essa area do UniStock. Verifique o endereco ou use
            uma das opcoes abaixo para voltar ao sistema.
          </p>
        </Card.Content>

        <Card.Footer className="flex flex-col gap-3 pt-6">
          <Button
            fullWidth
            className="font-bold"
            size="lg"
            variant="primary"
            onPress={() => router.push("/login")}
          >
            <span className="flex w-full items-center justify-center gap-2">
              <Home className="h-5 w-5" />
              <span>Ir para minha area</span>
            </span>
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
