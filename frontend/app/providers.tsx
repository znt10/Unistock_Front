"use client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/shared/stores/authStore";

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

  const persister = createSyncStoragePersister({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  });

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

function HydrationGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) return null;

  return <>{children}</>;
}
