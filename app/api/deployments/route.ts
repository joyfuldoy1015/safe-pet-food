import { NextResponse } from 'next/server'

// Vercel API 토큰이 필요합니다
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID // 선택사항
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'safe-pet-food'

export async function GET() {
  try {
    if (!VERCEL_TOKEN) {
      // 토큰이 없는 경우 샘플 데이터 반환
      return NextResponse.json({
        deployments: [
          {
            uid: 'sample-1',
            name: 'safe-pet-food',
            url: 'safe-pet-food.vercel.app',
            created: Date.now(),
            state: 'READY',
            meta: {
              githubCommitMessage: 'fix: 모바일/웹 일관성 개선',
              githubCommitSha: '106b0d8c',
              githubCommitAuthorName: 'doheekong',
              githubCommitRef: 'main'
            },
            target: 'production'
          }
        ],
        pagination: {
          count: 1,
          next: null,
          prev: null
        }
      })
    }

    // Vercel API 호출
    const baseUrl = 'https://api.vercel.com'
    const endpoint = VERCEL_TEAM_ID 
      ? `/v6/deployments?teamId=${VERCEL_TEAM_ID}&projectId=${VERCEL_PROJECT_ID}&limit=20`
      : `/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=20`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Deployment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}

// 재배포 API
export async function POST(request: Request) {
  try {
    const { deploymentId, action } = await request.json()

    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: 'VERCEL_TOKEN is not configured' },
        { status: 400 }
      )
    }

    if (action === 'redeploy') {
      // 재배포 로직
      const baseUrl = 'https://api.vercel.com'
      const endpoint = VERCEL_TEAM_ID
        ? `/v13/deployments?teamId=${VERCEL_TEAM_ID}`
        : '/v13/deployments'

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: VERCEL_PROJECT_ID,
          gitSource: {
            type: 'github',
            ref: 'main', // 브랜치명
            repoId: process.env.GITHUB_REPO_ID
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({ success: true, deployment: data })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Deployment action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform deployment action' },
      { status: 500 }
    )
  }
}

