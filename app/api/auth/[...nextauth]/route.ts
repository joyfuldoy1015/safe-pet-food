import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// 프로덕션 환경에서 NEXTAUTH_SECRET 필수 체크
// 주의: 빌드 타임에는 체크하지 않음 (Vercel 빌드 시 환경 변수가 아직 로드되지 않을 수 있음)
// 런타임에 NextAuth가 사용될 때 secret이 없으면 NextAuth 자체에서 에러 발생
const getNextAuthSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  
  if (!secret) {
    // 개발 환경에서만 fallback 허용
    if (process.env.NODE_ENV === 'development') {
      console.warn('[NextAuth] Using development-only secret. Set NEXTAUTH_SECRET in production!')
      return 'development-only-secret-do-not-use-in-production'
    }
    // 프로덕션 빌드 시에는 빈 문자열 반환
    // 실제 런타임에서 NextAuth가 사용될 때 secret이 없으면 NextAuth가 에러를 발생시킴
    // 빌드 타임에는 에러를 던지지 않아야 Vercel에서 빌드가 성공함
    // Vercel 환경 변수는 빌드 후 런타임에 로드됨
    return ''
  }
  
  return secret
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
