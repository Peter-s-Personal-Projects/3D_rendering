export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 w-screen h-screen overflow-hidden">{children}</body>
    </html>
  );
}