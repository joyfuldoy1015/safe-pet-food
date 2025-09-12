import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { petInfo, analysisResult, timestamp } = await request.json()
    
    // 실제 구현에서는 데이터베이스에 저장
    // const savedReport = await db.healthReports.create({
    //   data: {
    //     userId: getCurrentUserId(),
    //     petInfo,
    //     analysisResult,
    //     timestamp: new Date(timestamp)
    //   }
    // })
    
    // 모의 저장 응답
    const mockSavedReport = {
      id: Date.now().toString(),
      petInfo,
      analysisResult,
      timestamp,
      createdAt: new Date().toISOString()
    }
    
    console.log('Health report saved:', mockSavedReport)
    
    return NextResponse.json({ 
      success: true, 
      reportId: mockSavedReport.id,
      message: '리포트가 성공적으로 저장되었습니다.' 
    })
    
  } catch (error) {
    console.error('Save report error:', error)
    return NextResponse.json(
      { error: '리포트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
