import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'COSMIC ATLAS — Explore Everything We Know About the Universe',
  description: 'A scientifically responsible interactive 3D atlas of known and catalogued astronomical objects.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
