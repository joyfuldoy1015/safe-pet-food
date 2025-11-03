/**
 * Pet Feeding Calculator - Calculation Logic
 * 
 * This module contains pure calculation functions for determining
 * Resting Energy Requirement (RER), Daily Energy Requirement (DER),
 * and daily feeding amounts for dogs and cats.
 */

/**
 * Calculate Resting Energy Requirement (RER)
 * Formula: RER = 70 × (weightKg ^ 0.75)
 */
export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) return 0
  return Math.round(70 * Math.pow(weightKg, 0.75))
}

/**
 * Get activity factor based on species, age, activity level, neutered status
 * 
 * DOG Activity Factors:
 *   Growth (puppy):
 *     - < 4 months: 3.0
 *     - 4-11 months: 2.0
 *   Adult (1-7y):
 *     - weight_loss: 1.0
 *     - low: neutered ? 1.4 : 1.6
 *     - normal: neutered ? 1.6 : 1.8
 *     - high: 2.0
 *   Senior (7y+):
 *     - weight_loss: 1.0
 *     - low: neutered ? 1.3 : 1.5
 *     - normal: neutered ? 1.5 : 1.7
 *     - high: 1.8
 * 
 * CAT Activity Factors:
 *   Growth (kitten):
 *     - < 4 months: 2.5
 *     - 4-11 months: 2.0
 *   Adult:
 *     - weight_loss: 1.0
 *     - low: neutered ? 1.1 : 1.2
 *     - normal: neutered ? 1.2 : 1.4
 *     - high: 1.4
 *   Senior:
 *     - weight_loss: 1.0
 *     - low: neutered ? 1.0 : 1.1
 *     - normal: neutered ? 1.1 : 1.3
 *     - high: 1.3
 */
export function getActivityFactor(params: {
  species: 'dog' | 'cat'
  age: 'puppy' | 'adult' | 'senior'
  activity: 'low' | 'normal' | 'high' | 'weight_loss'
  neutered: boolean
  ageMonths?: number // Optional: age in months for more precise puppy/kitten calculations
}): number {
  const { species, age, activity, neutered, ageMonths } = params

  // Weight loss always returns 1.0
  if (activity === 'weight_loss') {
    return 1.0
  }

  if (species === 'dog') {
    // Growth (puppy)
    if (age === 'puppy') {
      // If ageMonths is provided, use precise thresholds
      if (ageMonths !== undefined) {
        if (ageMonths < 4) return 3.0
        if (ageMonths <= 11) return 2.0
      }
      // Default to < 4 months factor if ageMonths not provided
      return 3.0
    }
    
    // Adult (1-7y)
    if (age === 'adult') {
      switch (activity) {
        case 'low':
          return neutered ? 1.4 : 1.6
        case 'normal':
          return neutered ? 1.6 : 1.8
        case 'high':
          return 2.0
        default:
          return neutered ? 1.6 : 1.8
      }
    }
    
    // Senior (7y+)
    if (age === 'senior') {
      switch (activity) {
        case 'low':
          return neutered ? 1.3 : 1.5
        case 'normal':
          return neutered ? 1.5 : 1.7
        case 'high':
          return 1.8
        default:
          return neutered ? 1.5 : 1.7
      }
    }
  } else {
    // CAT
    // Growth (kitten)
    if (age === 'puppy') { // kitten
      // If ageMonths is provided, use precise thresholds
      if (ageMonths !== undefined) {
        if (ageMonths < 4) return 2.5
        if (ageMonths <= 11) return 2.0
      }
      // Default to < 4 months factor if ageMonths not provided
      return 2.5
    }
    
    // Adult
    if (age === 'adult') {
      switch (activity) {
        case 'low':
          return neutered ? 1.1 : 1.2
        case 'normal':
          return neutered ? 1.2 : 1.4
        case 'high':
          return 1.4
        default:
          return neutered ? 1.2 : 1.4
      }
    }
    
    // Senior
    if (age === 'senior') {
      switch (activity) {
        case 'low':
          return neutered ? 1.0 : 1.1
        case 'normal':
          return neutered ? 1.1 : 1.3
        case 'high':
          return 1.3
        default:
          return neutered ? 1.1 : 1.3
      }
    }
  }

  // Fallback default (should not reach here)
  return neutered ? 1.6 : 1.8
}

/**
 * Calculate Daily Energy Requirement (DER)
 * Formula: DER = RER × activityFactor
 */
export function calculateDER(rer: number, factor: number): number {
  return Math.round(rer * factor)
}

/**
 * Calculate daily feeding amount in grams
 * Formula: feedingGrams = (DER / kcalPerKg) × 1000
 */
export function calculateFeedingGrams(der: number, kcalPerKg: number): number {
  if (kcalPerKg <= 0) return 0
  return Math.round((der / kcalPerKg) * 1000 * 10) / 10 // Round to 1 decimal place
}

/**
 * Main calculation function that ties everything together
 */
export function calculateFeeding(params: {
  species: 'dog' | 'cat'
  age: 'puppy' | 'adult' | 'senior'
  weightKg: number
  activity: 'low' | 'normal' | 'high' | 'weight_loss'
  neutered: boolean
  kcalPerKg: number
  ageMonths?: number
}): {
  rer: number
  factor: number
  der: number
  feedingGrams: number
} | null {
  // Validation
  if (params.weightKg <= 0 || params.kcalPerKg <= 0) {
    return null
  }

  const rer = calculateRER(params.weightKg)
  const factor = getActivityFactor({
    species: params.species,
    age: params.age,
    activity: params.activity,
    neutered: params.neutered,
    ageMonths: params.ageMonths
  })
  const der = calculateDER(rer, factor)
  const feedingGrams = calculateFeedingGrams(der, params.kcalPerKg)

  return {
    rer,
    factor,
    der,
    feedingGrams
  }
}

