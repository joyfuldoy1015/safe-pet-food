import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // 테스트용 Credentials Provider (프로덕션에서도 임시로 작동)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 테스트 계정들 (프로덕션에서도 임시로 허용)
        // 실제 프로덕션에서는 데이터베이스와 연동해야 합니다
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
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key-for-development-only',
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
