export async function exportCardAsImage(elementId: string): Promise<Blob | null> {
  const el = document.getElementById(elementId)
  if (!el) return null
  try {
    const html2canvas = (await import('html2canvas')).default
    const rect = el.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)

    const canvas = await html2canvas(el, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: '#ffffff',
      width: w,
      height: h,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: h,
    })
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  } catch {
    return null
  }
}

export async function downloadCard(elementId: string, filename: string) {
  const blob = await exportCardAsImage(elementId)
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function shareResult(params: {
  elementId: string
  petName: string
  score: number
  jipsaType: string
  filename: string
}) {
  const { elementId, petName, score, jipsaType, filename } = params
  const shareText = `나는 ${score}점짜리 ${jipsaType} 집사! ${petName}이/가 인정한 집사력 테스트 해보기 → https://safe-pet-food.vercel.app/butler-test`

  const blob = await exportCardAsImage(elementId)
  if (!blob) {
    // 이미지 생성 실패 시 텍스트만 공유
    try {
      if (navigator.share) await navigator.share({ text: shareText })
      else await navigator.clipboard.writeText(shareText)
    } catch { /* ignore */ }
    return
  }

  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: shareText })
      return
    } catch { /* fallthrough */ }
  }

  // Web Share API 미지원 or 실패 → 이미지 다운로드 + 텍스트 클립보드 복사
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  try {
    await navigator.clipboard.writeText(shareText)
    alert('이미지가 저장됐어요! 공유 텍스트도 클립보드에 복사됐습니다 🐾')
  } catch { /* ignore */ }
}
