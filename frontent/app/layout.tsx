import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import CreatePostModal from "@/components/CreatePostModal";
import SearchModal from "@/components/SearchModal";
import { GlobalProvider } from "@/context/GlobalContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReaidyVerse",
  description: "Instagram built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
            <MobileNav />
            <CreatePostModal />
            <SearchModal />
          </div>
        </GlobalProvider>
      </body>
    </html>
  );
}
