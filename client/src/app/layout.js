import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientLayout from "./ClientLayout";
import { CartProvider } from "./context/CartContext";
import { ModalProvider } from "./context/ModalContext";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GutTalks",
  description: "GutTalks is your personal gateway to digestive health and wellness. Connect with India's leading gastroenterologists through secure, one-on-one video consultations, access AI-powered gut health insights, and shop curated wellness products delivered right to your door.",
  icons: {
    icon: "/logo.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">

        <Providers>
          <CartProvider>
            <ModalProvider>
              <ClientLayout>

                {children}

              </ClientLayout>
            </ModalProvider>
          </CartProvider>
        </Providers>
      </body>

    </html>
  );
}
