import feedGradeCriteria from '../data/feed-grade-criteria.json'

export interface FeedAnalysisInput {
  ingredient_quality: 'premium' | 'high' | 'medium' | 'low'
  ingredient_transparency: 'premium' | 'high' | 'medium' | 'low'
  safety_record: 'premium' | 'high' | 'medium' | 'low'
  nutritional_standards: 'premium' | 'high' | 'medium' | 'low'
  preservative_type: 'premium' | 'high' | 'medium' | 'low'
}

export interface FeedGradeResult {
  overall_grade: string
  overall_score: number
  grade_color: string
  grade_description: string
  breakdown: {
    criterion: string
    level: string
    score: number
    weight: number
    weighted_score: number
    color: string
    description: string
  }[]
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}

export class FeedGradeAnalyzer {
  private criteria = feedGradeCriteria.criteria
  private gradeThresholds = feedGradeCriteria.grade_thresholds

  /**
   * 사료 등급을 분석합니다
   */
  analyzeFeedGrade(input: FeedAnalysisInput): FeedGradeResult {
    const breakdown = this.calculateBreakdown(input)
    const overallScore = this.calculateOverallScore(breakdown)
    const grade = this.determineGrade(overallScore)
    const recommendations = this.generateRecommendations(breakdown)
    const strengths = this.identifyStrengths(breakdown)
    const weaknesses = this.identifyWeaknesses(breakdown)

    return {
      overall_grade: grade.name,
      overall_score: Math.round(overallScore),
      grade_color: grade.color,
      grade_description: grade.description,
      breakdown,
      recommendations,
      strengths,
      weaknesses
    }
  }

  /**
   * 각 기준별 세부 점수를 계산합니다
   */
  private calculateBreakdown(input: FeedAnalysisInput) {
    const breakdown = []

    for (const [criterionKey, criterion] of Object.entries(this.criteria)) {
      const inputValue = input[criterionKey as keyof FeedAnalysisInput]
      const level = criterion.levels[inputValue]
      
      const weightedScore = level.score * (criterion.weight / 100)
      
      breakdown.push({
        criterion: criterion.name,
        level: level.name,
        score: level.score,
        weight: criterion.weight,
        weighted_score: Math.round(weightedScore),
        color: level.color,
        description: level.description
      })
    }

    return breakdown
  }

  /**
   * 전체 점수를 계산합니다
   */
  private calculateOverallScore(breakdown: any[]): number {
    return breakdown.reduce((sum, item) => sum + item.weighted_score, 0)
  }

  /**
   * 등급을 결정합니다
   */
  private determineGrade(score: number) {
    const thresholds = Object.entries(this.gradeThresholds)
      .sort(([,a], [,b]) => b.min - a.min)

    for (const [grade, threshold] of thresholds) {
      if (score >= threshold.min) {
        return {
          name: grade,
          color: threshold.color,
          description: threshold.description
        }
      }
    }

    return {
      name: 'F',
      color: this.gradeThresholds.F.color,
      description: this.gradeThresholds.F.description
    }
  }

  /**
   * 개선 권장사항을 생성합니다
   */
  private generateRecommendations(breakdown: any[]): string[] {
    const recommendations = []

    for (const item of breakdown) {
      if (item.score < 80) {
        switch (item.criterion) {
          case '원료 생육':
            recommendations.push('더 신선한 원료 사용을 고려해보세요')
            break
          case '상세성분표기 여부':
            recommendations.push('성분 표기를 더 투명하게 개선하세요')
            break
          case '안전성':
            recommendations.push('품질 관리 시스템을 강화하세요')
            break
          case '영양협회 기준 만족':
            recommendations.push('영양 기준을 더 엄격하게 준수하세요')
            break
          case '보존제 종류':
            recommendations.push('천연 보존제 사용을 고려해보세요')
            break
        }
      }
    }

    return recommendations
  }

  /**
   * 강점을 식별합니다
   */
  private identifyStrengths(breakdown: any[]): string[] {
    const strengths = []

    for (const item of breakdown) {
      if (item.score >= 90) {
        strengths.push(`${item.criterion}: ${item.description}`)
      }
    }

    return strengths
  }

  /**
   * 약점을 식별합니다
   */
  private identifyWeaknesses(breakdown: any[]): string[] {
    const weaknesses = []

    for (const item of breakdown) {
      if (item.score < 70) {
        weaknesses.push(`${item.criterion}: ${item.description}`)
      }
    }

    return weaknesses
  }

  /**
   * 사료 비교 분석을 수행합니다
   */
  compareFeeds(feeds: FeedAnalysisInput[]): {
    rankings: Array<{
      index: number
      grade: string
      score: number
      color: string
    }>
    best_feed: number
    worst_feed: number
  } {
    const results = feeds.map((feed, index) => {
      const analysis = this.analyzeFeedGrade(feed)
      return {
        index,
        grade: analysis.overall_grade,
        score: analysis.overall_score,
        color: analysis.grade_color
      }
    })

    results.sort((a, b) => b.score - a.score)

    return {
      rankings: results,
      best_feed: results[0].index,
      worst_feed: results[results.length - 1].index
    }
  }
}

// 싱글톤 인스턴스
export const feedGradeAnalyzer = new FeedGradeAnalyzer()
