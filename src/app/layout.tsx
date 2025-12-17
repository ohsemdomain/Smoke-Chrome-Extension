//src/app/layout.tsx
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smoke Break Tracker',
  description: 'A minimalist app to help manage your cigarette habit.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isExtensionBuild = process.env.EXTENSION_BUILD === 'true';

  return (
    <html lang="en" className="light" data-extension-popup={isExtensionBuild ? 'true' : undefined}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body
        data-extension-popup={isExtensionBuild ? 'true' : undefined}
      >
        {children}
      </body>
    </html>
  );
}
