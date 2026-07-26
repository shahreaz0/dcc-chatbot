"use client";

import { Toaster } from "@dcc-chatbot/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
