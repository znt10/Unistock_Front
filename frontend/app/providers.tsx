"use client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ThemeProvider } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        disableTransitionOnChange
        enableSystem={false}
        value={{
          dark: "dark-blue",
          light: "light",
        }}
      >
        <HydrationGuard>{children}</HydrationGuard>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

// Nunca muda: o "external store" aqui e a propria fase de renderizacao, que
// nao emite eventos. Fica fora do componente para a identidade ser estavel
// entre renders.
const subscribeNoop = () => () => {};
const noServidor = () => false;
const noCliente = () => true;

// Segura a arvore ate a hidratacao terminar.
//
// Nao use o `hydrated` do authStore aqui. O store usa `persist` com
// localStorage, que e sincrono: o zustand rehidrata durante a avaliacao do
// modulo, entao `hydrated` ja chega `true` no primeiro render do cliente. No
// servidor localStorage nao existe, o zustand descarta o storage e `hydrated`
// fica `false`. Servidor renderiza nada, cliente renderiza tudo no mesmo
// primeiro render, e o React acusa hydration mismatch em toda pagina.
//
// `useSyncExternalStore` resolve porque o React usa o snapshot do servidor
// tanto no SSR quanto no primeiro render do cliente, e so troca pelo snapshot
// do cliente depois que a hidratacao termina. Os dois lados comecam iguais.
function HydrationGuard({ children }: { children: React.ReactNode }) {
  const hidratado = useSyncExternalStore(subscribeNoop, noCliente, noServidor);

  if (!hidratado) return null;

  return <>{children}</>;
}
