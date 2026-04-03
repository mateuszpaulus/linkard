import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkard — Link-in-bio dla profesjonalistów",
  description: "Twój profesjonalny profil w 5 minut. Jedna strona, wszystkie usługi, jeden link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pl" className="h-full antialiased">
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
