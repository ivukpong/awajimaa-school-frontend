import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
 
 

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Awajimaa School — Unified School Management System",
  description:
    "A unified school management system with examinations, e-learning, regulators, revenue, parents, students, sponsors, and messaging.",
  icons: {
    icon: "/logo.jpeg",
    apple: "/full_logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans`}>  
        <Providers>{children}</Providers>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
