/**
 * Supabase 스키마 확인 스크립트
 * 
 * 실행 방법:
 * npx tsx scripts/check-supabase-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 확인할 테이블 목록
const requiredTables = [
  'brands',
  'profiles',
  'pets',
  'review_logs',
  'pet_log_posts',
  'pet_log_feeding_records',
  'pet_log_comments',
  'feed_grade_analyses',
  'health_analyses',
  'pet_profiles'
]

async function checkTable(tableName: string): Promise<{ exists: boolean; rowCount?: number; error?: string }> {
  try {
    // 간단한 SELECT 쿼리로 테이블 존재 여부 확인
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      // 테이블이 존재하지 않는 경우
      if (error.code === '42P01') {
        return { exists: false, error: '테이블이 존재하지 않습니다' }
      }
      // RLS 정책 문제인 경우도 테이블은 존재할 수 있음
      if (error.code === '42501' || error.message.includes('permission')) {
        return { exists: true, rowCount: 0, error: 'RLS 정책으로 인해 접근 불가 (테이블은 존재함)' }
      }
      return { exists: false, error: `${error.code}: ${error.message}` }
    }

    return { exists: true, rowCount: count || 0 }
  } catch (error: any) {
    // 네트워크 오류인 경우
    if (error.message?.includes('fetch failed') || error.cause) {
      return { exists: false, error: `연결 오류: ${error.message || '네트워크 문제'}` }
    }
    return { exists: false, error: error.message }
  }
}

async function checkSchema() {
  console.log('🔍 Supabase 스키마 확인 중...\n')
  console.log(`📡 연결 URL: ${supabaseUrl}\n`)

  const results: Array<{ table: string; exists: boolean; rowCount?: number; error?: string }> = []

  for (const table of requiredTables) {
    const result = await checkTable(table)
    results.push({ table, ...result })
    
    if (result.exists) {
      console.log(`✅ ${table.padEnd(30)} 존재 (데이터: ${result.rowCount}개)`)
    } else {
      console.log(`❌ ${table.padEnd(30)} ${result.error || '존재하지 않음'}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  
  const existingTables = results.filter(r => r.exists)
  const missingTables = results.filter(r => !r.exists)

  console.log(`\n📊 결과 요약:`)
  console.log(`   ✅ 존재하는 테이블: ${existingTables.length}개`)
  console.log(`   ❌ 누락된 테이블: ${missingTables.length}개`)

  if (missingTables.length > 0) {
    console.log(`\n⚠️  다음 테이블들이 생성되지 않았습니다:`)
    missingTables.forEach(r => {
      console.log(`   - ${r.table}`)
    })
    console.log(`\n💡 해결 방법:`)
    console.log(`   1. Supabase Dashboard → SQL Editor 접속`)
    console.log(`   2. scripts/supabase-schema.sql 파일 내용 복사`)
    console.log(`   3. SQL Editor에 붙여넣고 실행`)
  }

  // brands 테이블에 데이터가 있는지 확인
  const brandsTable = results.find(r => r.table === 'brands')
  if (brandsTable?.exists) {
    if (brandsTable.rowCount === 0) {
      console.log(`\n📦 brands 테이블이 비어있습니다. 데이터 마이그레이션이 필요합니다.`)
      console.log(`   실행: npx tsx scripts/migrate-brands-to-supabase.ts`)
    } else {
      console.log(`\n✅ brands 테이블에 ${brandsTable.rowCount}개의 데이터가 있습니다.`)
    }
  }

  console.log('\n' + '='.repeat(60))
}

async function main() {
  try {
    await checkSchema()
  } catch (error: any) {
    console.error('❌ 확인 중 오류:', error.message)
    process.exit(1)
  }
}

main()

