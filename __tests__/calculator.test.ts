// Unit tests for calculation logic
describe('Calculation Logic', () => {
  // Helper functions (copied from main component for testing)
  const calculateDryMatter = (crudeValue: number, moisture: number): number => {
    const dryMatterPercentage = 100 - moisture
    return (crudeValue / dryMatterPercentage) * 100
  }

  const gradeProtein = (dmValue: number): 'Good' | 'So-so' | 'Bad' => {
    if (dmValue > 30) return 'Good'
    if (dmValue >= 22) return 'So-so'
    return 'Bad'
  }

  const gradeFat = (dmValue: number): 'Good' | 'So-so' | 'Bad' => {
    if (dmValue >= 15 && dmValue <= 25) return 'Good'
    if (dmValue >= 10 && dmValue < 15) return 'So-so'
    return 'Bad'
  }

  const gradeFiber = (dmValue: number): 'Good' | 'So-so' | 'Bad' => {
    if (dmValue < 5) return 'Good'
    return 'So-so'
  }

  const calculateOverallScore = (grades: ('Good' | 'So-so' | 'Bad')[]): number => {
    const gradePoints = { 'Good': 3, 'So-so': 2, 'Bad': 1 }
    const totalPoints = grades.reduce((sum, grade) => sum + gradePoints[grade], 0)
    return Math.round((totalPoints / 9) * 100)
  }

  describe('Dry Matter Calculation', () => {
    it('should calculate dry matter percentages correctly', () => {
      // Test case: protein 25%, moisture 10% -> DM protein should be ~27.7%
      const result = calculateDryMatter(25, 10)
      expect(result).toBeCloseTo(27.78, 1)
    })

    it('should handle zero moisture correctly', () => {
      const result = calculateDryMatter(25, 0)
      expect(result).toBe(25)
    })

    it('should handle high moisture content', () => {
      const result = calculateDryMatter(10, 80)
      expect(result).toBe(50)
    })
  })

  describe('Protein Grading', () => {
    it('should assign Good grade for high protein (>30%)', () => {
      expect(gradeProtein(32)).toBe('Good')
      expect(gradeProtein(35)).toBe('Good')
    })

    it('should assign So-so grade for moderate protein (22-30%)', () => {
      expect(gradeProtein(25)).toBe('So-so')
      expect(gradeProtein(30)).toBe('So-so')
      expect(gradeProtein(22)).toBe('So-so')
    })

    it('should assign Bad grade for low protein (<22%)', () => {
      expect(gradeProtein(20)).toBe('Bad')
      expect(gradeProtein(15)).toBe('Bad')
    })
  })

  describe('Fat Grading', () => {
    it('should assign Good grade for optimal fat (15-25%)', () => {
      expect(gradeFat(20)).toBe('Good')
      expect(gradeFat(15)).toBe('Good')
      expect(gradeFat(25)).toBe('Good')
    })

    it('should assign So-so grade for moderate fat (10-15%)', () => {
      expect(gradeFat(12)).toBe('So-so')
      expect(gradeFat(10)).toBe('So-so')
      expect(gradeFat(14.9)).toBe('So-so')
    })

    it('should assign Bad grade for too low or too high fat', () => {
      expect(gradeFat(8)).toBe('Bad')
      expect(gradeFat(30)).toBe('Bad')
    })
  })

  describe('Fiber Grading', () => {
    it('should assign Good grade for low fiber (<5%)', () => {
      expect(gradeFiber(3)).toBe('Good')
      expect(gradeFiber(4.9)).toBe('Good')
    })

    it('should assign So-so grade for high fiber (>=5%)', () => {
      expect(gradeFiber(5)).toBe('So-so')
      expect(gradeFiber(8)).toBe('So-so')
    })
  })

  describe('Overall Score Calculation', () => {
    it('should calculate 100 points for all Good grades', () => {
      const score = calculateOverallScore(['Good', 'Good', 'Good'])
      expect(score).toBe(100)
    })

    it('should calculate 67 points for all So-so grades', () => {
      const score = calculateOverallScore(['So-so', 'So-so', 'So-so'])
      expect(score).toBe(67)
    })

    it('should calculate 33 points for all Bad grades', () => {
      const score = calculateOverallScore(['Bad', 'Bad', 'Bad'])
      expect(score).toBe(33)
    })

    it('should calculate mixed grades correctly', () => {
      const score = calculateOverallScore(['Good', 'So-so', 'Bad'])
      expect(score).toBe(67) // (3+2+1)/9 * 100 = 66.67 -> 67
    })
  })

  describe('Integration Test', () => {
    it('should calculate realistic pet food example correctly', () => {
      // Example: High-quality dry dog food
      const crudeProtein = 28
      const crudeFat = 18
      const crudeFiber = 3
      const moisture = 10

      const proteinDM = calculateDryMatter(crudeProtein, moisture)
      const fatDM = calculateDryMatter(crudeFat, moisture)
      const fiberDM = calculateDryMatter(crudeFiber, moisture)

      expect(proteinDM).toBeCloseTo(31.11, 1)
      expect(fatDM).toBeCloseTo(20, 1)
      expect(fiberDM).toBeCloseTo(3.33, 1)

      const proteinGrade = gradeProtein(proteinDM)
      const fatGrade = gradeFat(fatDM)
      const fiberGrade = gradeFiber(fiberDM)

      expect(proteinGrade).toBe('Good')
      expect(fatGrade).toBe('Good')
      expect(fiberGrade).toBe('Good')

      const overallScore = calculateOverallScore([proteinGrade, fatGrade, fiberGrade])
      expect(overallScore).toBe(100)
    })
  })
}) 