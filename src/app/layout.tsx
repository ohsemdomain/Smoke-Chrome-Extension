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
  const extensionSizeClasses = isExtensionBuild
    ? 'w-[420px] min-w-[420px] h-[420px] min-h-[420px] overflow-hidden'
    : '';

  return (
    <html
      lang="en"
      className={`h-full ${extensionSizeClasses}`}
      data-extension-popup={isExtensionBuild ? 'true' : undefined}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`h-full bg-onyx-100 font-sans text-onyx-950 antialiased ${extensionSizeClasses}`}
        data-extension-popup={isExtensionBuild ? 'true' : undefined}
      >
        {children}
      </body>
    </html>
  );
}
