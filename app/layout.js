import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Heralune - AI Journal",
  description: "A premium glassmorphic AI journaling experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="mesh-background" />
        {children}
      </body>
    </html>
  );
}
