import { Inter, Merriweather } from 'next/font/google';
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";
import Link from "next/link";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '800']
});

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['700']
});

export const metadata = {
  title: "AI Career Coach",
  description: "AI-powered career coaching and interview preparation",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.webp", type: "image/webp" }
    ],
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
            <footer className="bg-muted/50 py-8 md:py-12 border-t border-gray-800">
              <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-muted-foreground transition-colors hover:text-primary">
                    <Link
                      href="https://www.linkedin.com/in/mustafa-ahmed002"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 hover:text-primary transition-all duration-200 ease-in-out group"
                    >
                      <span className="font-medium group-hover:underline">
                        Made with ❤️ by Mustafa
                      </span>
                    </Link>
                  </p>
                  <div className="text-sm text-muted-foreground opacity-75">
                    © {new Date().getFullYear()} AI Career Coach. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}