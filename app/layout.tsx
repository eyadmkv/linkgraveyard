import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { arSA } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { Layers } from "lucide-react";
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "صندوق الروابط",
  description: "Modern Link Management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <ClerkProvider 
      localization={arSA}
      appearance={{
        baseTheme: dark,
        variables: {
          fontFamily: "'Alexandria', sans-serif",
          colorPrimary: "#6366f1",
          colorBackground: "#09090b",
          colorInputBackground: "#18181b",
          colorInputText: "#f4f4f5",
          colorText: "#f4f4f5",
          borderRadius: "0.75rem",
        },
        layout: { shimmer: true },
        elements: {
          card: 'border border-zinc-800 shadow-2xl rounded-2xl bg-[#09090b]',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium text-white',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
        }
      }}
    >
      <html lang="ar" dir="rtl">
        <body className="antialiased min-h-screen flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 bg-[#09090b]">
          
          <header className="bg-[#09090b]/70 backdrop-blur-lg border-b border-zinc-800/80 sticky top-0 z-50 transition-all">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
              
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-500 p-1.5 rounded-lg text-white">
                  <Layers size={18} strokeWidth={2.5} />
                </div>
                <h1 className="text-lg font-bold tracking-wide text-zinc-100 font-['Inter']">
                  Sandooq
                </h1>
              </div>

              <div>
                {!userId ? (
                  <SignInButton mode="modal">
                    <button className="bg-white text-zinc-950 font-semibold px-5 py-2 text-sm rounded-full shadow-sm hover:bg-zinc-200 transition-colors">
                      تسجيل الدخول
                    </button>
                  </SignInButton>
                ) : (
                  <UserButton 
                    appearance={{
                      baseTheme: dark,
                      variables: {
                        colorPrimary: "#6366f1",
                        colorBackground: "#18181b", 
                        colorText: "#ffffff",
                        colorTextSecondary: "#d4d4d8",
                      },
                      elements: {
                        avatarBox: "w-9 h-9 rounded-full ring-2 ring-zinc-800 hover:ring-indigo-500 transition-all",
                        userButtonPopoverCard: "!bg-[#18181b] !border !border-zinc-700 !shadow-2xl !rounded-2xl",
                        userButtonPopoverActionButton: "!text-white hover:!bg-zinc-700/50",
                        userButtonPopoverActionButtonText: "!text-white !font-medium",
                        userPreviewMainIdentifier: "!text-white",
                        userPreviewSecondaryIdentifier: "!text-zinc-300",
                        userButtonPopoverFooter: "!border-t !border-zinc-700",
                        rootBox: "text-white",
                      }
                    }} 
                  />
                )}
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}