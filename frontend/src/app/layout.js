export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen m-0 p-0 overflow-hidden">{children}</body>
    </html>
  );
}