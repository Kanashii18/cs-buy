import "./globals.css";
import localFont from 'next/font/local';

const bannerFont = localFont({
     src: [
          {
               path: "../../public/assets/fonts/banner/TALIWANGKE.ttf",
          },
     ],
     variable: "--font-banner",
});

const optionsFont = localFont({
     src: [
          {
               path: "../../public/assets/fonts/nav/HighGameFont.ttf",
          },
     ],
     variable: "--font-options",
});

const contentFont = localFont({
     src: [
          {
               path: "../../public/assets/fonts/not_found/CSCalebMono-Regular.woff2",
          },
     ],
     variable: "--font-content",
});  

const textFont = localFont({
     src: [
          {
               path: "../../public/assets/fonts/text/Klutch.ttf",
          },
     ],
     variable: "--font-product",
});

export const metadata = {
     icons: {
          icon: "/assets/icons/logo.svg",
     },
};


export default function RootLayout({ children }) {
     return (
          <html lang="en" className={`${bannerFont.variable} ${optionsFont.variable} ${textFont.variable} ${contentFont.variable}`}  suppressHydrationWarning>
               <body className="bg-[#050505]">{children}</body>
          </html>
     );
}