import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import SessionProvider from './providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://safe-pet-food.vercel.app' 
    : 'http://localhost:3000'),
  title: 'Safe Pet Food - 우리 아이 사료 영양 계산기',
  description: '반려동물 사료의 영양성분을 간단히 분석하고 점수로 확인해보세요. 건물기준 영양소 계산과 등급 평가를 제공합니다.',
  keywords: '반려동물, 사료, 영양분석, 건물기준, 개사료, 고양이사료',
  authors: [{ name: 'Safe Pet Food Team' }],
  openGraph: {
    title: 'Safe Pet Food - 반려동물 사료 영양 계산기',
    description: '사료 영양성분을 분석하고 점수로 확인해보세요',
    url: 'https://safe-pet-food.vercel.app',
    siteName: 'Safe Pet Food',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Safe Pet Food - 반려동물 사료 영양 계산기',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safe Pet Food - 반려동물 사료 영양 계산기',
    description: '사료 영양성분을 분석하고 점수로 확인해보세요',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          {children}
          <Footer isAdmin={false} />
        </SessionProvider>
      </body>
    </html>
  )
} 