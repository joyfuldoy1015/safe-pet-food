import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// 프로덕션 환경에서 NEXTAUTH_SECRET 필수 체크
const getNextAuthSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error(
      'NEXTAUTH_SECRET or AUTH_SECRET environment variable is required in production. ' +
      'Please set it in your environment variables.'
    )
  }
  
  // 개발 환경에서만 fallback 허용
  return secret || 'development-only-secret-do-not-use-in-production'
}

// 개발 환경에서만 테스트 계정 제공
const getProviders = () => {
  const providers: any[] = [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ]

  // 개발 환경에서만 Credentials Provider 추가
  if (process.env.NODE_ENV === 'development') {
    providers.push(
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          // 개발 환경에서만 사용되는 테스트 계정
          const testAccounts = [
            { email: 'test@example.com', password: 'test1234', name: '테스트 사용자', id: '1' },
            { email: 'admin@example.com', password: 'admin1234', name: '관리자', id: '2' },
            { email: 'user@example.com', password: 'user1234', name: '일반 사용자', id: '3' }
          ]
          
          const user = testAccounts.find(
            account => account.email === credentials?.email && account.password === credentials?.password
          )
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          }
          
          return null
        }
      })
    )
  }

  return providers
}

const handler = NextAuth({
  providers: getProviders(),
  secret: getNextAuthSecret(),
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        // NextAuth User 타입 확장을 위해 타입 단언 사용
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
