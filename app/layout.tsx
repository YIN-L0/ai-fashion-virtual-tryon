import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Fashion Virtual Try On',
  description: 'AI-powered virtual try-on experience using FASHN AI technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
