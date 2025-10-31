import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 개발/테스트용 Credentials Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 개발 환경에서 간단한 테스트 계정 인증
        // 실제 프로덕션에서는 데이터베이스와 연동해야 합니다
        if (process.env.NODE_ENV === 'development') {
          // 테스트 계정들
          const testAccounts = [
            { email: 'test@example.com', password: 'test1234', name: '테스트 사용자' },
            { email: 'admin@example.com', password: 'admin1234', name: '관리자' },
            { email: 'user@example.com', password: 'user1234', name: '일반 사용자' }
          ]
          
          const user = testAccounts.find(
            account => account.email === credentials?.email && account.password === credentials?.password
          )
          
          if (user) {
            return {
              id: '1',
              email: user.email,
              name: user.name,
            }
          }
        }
        
        return null
      }
    }),
  ],
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
      if (token.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  // 개발 환경에서 credentials 로그인 허용
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
