/**
 * Brands JSON 데이터를 Supabase로 마이그레이션하는 스크립트
 * 
 * 실행 방법:
 * 1. .env.local에 Supabase 환경 변수 설정
 * 2. npm install tsx --save-dev (또는 전역 설치)
 * 3. npx tsx scripts/migrate-brands-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

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

async function migrateBrands() {
  console.log('📦 Brands 데이터 마이그레이션 시작...\n')

  try {
    // JSON 파일 읽기
    const brandsFilePath = path.join(process.cwd(), 'data', 'brands.json')
    const brandsData = JSON.parse(fs.readFileSync(brandsFilePath, 'utf-8'))

    console.log(`총 ${brandsData.length}개의 브랜드 데이터를 마이그레이션합니다.\n`)

    let successCount = 0
    let errorCount = 0

    for (const brand of brandsData) {
      try {
        // Supabase에 삽입 (image 컬럼 제외 - 추후 추가 가능)
        const { data, error } = await supabase
          .from('brands')
          .insert({
            name: brand.name,
            manufacturer: brand.manufacturer || '',
            country: brand.country || '',
            overall_rating: brand.overall_rating || 0,
            established_year: brand.established_year || null,
            product_lines: brand.product_lines || [],
            certifications: brand.certifications || [],
            recall_history: brand.recall_history || [],
            brand_description: brand.description || brand.brand_description || '',
            manufacturing_info: brand.manufacturing_info || '',
            brand_pros: brand.brand_pros || [],
            brand_cons: brand.brand_cons || []
            // image 컬럼은 테이블에 추가 후 다시 마이그레이션 가능
          })
          .select()
          .single()

        if (error) {
          // 중복 키 오류는 무시 (이미 존재하는 데이터)
          if (error.code === '23505') {
            console.log(`⚠️  이미 존재: ${brand.name}`)
          } else {
            throw error
          }
        } else {
          console.log(`✅ 성공: ${brand.name}`)
          successCount++
        }
      } catch (error: any) {
        console.error(`❌ 실패: ${brand.name}`, error.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ 성공: ${successCount}개`)
    console.log(`❌ 실패: ${errorCount}개`)
    console.log('='.repeat(50))
  } catch (error: any) {
    console.error('❌ 마이그레이션 중 오류:', error.message)
    process.exit(1)
  }
}

async function main() {
  try {
    await migrateBrands()
    console.log('\n✅ Brands 마이그레이션이 완료되었습니다!')
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    process.exit(1)
  }
}

main()

