export interface FrequencyScale {
  scaleIndex: number
  frequencyMS: number
  label: string
}

export const FrequencyScales: FrequencyScale[] = [
  // [10, '10s'],
  // [60, '1m'],
  // [60 * 5, '5m'],
  // [60 * 10, '10m'],
  // [60 * 15, '15m'],
  // [60 * 30, '30m'],
  // [60 * 60, '1h'],
  // [60 * 60 * 12, '12h'],
  // [60 * 60 * 24, '24h'],
  { scaleIndex: 0, frequencyMS: 10, label: '10s' },
  { scaleIndex: 1, frequencyMS: 60, label: '1m' },
  { scaleIndex: 2, frequencyMS: 60 * 5, label: '5m' },
  { scaleIndex: 3, frequencyMS: 60 * 10, label: '10m' },
  { scaleIndex: 4, frequencyMS: 60 * 15, label: '15m' },
  { scaleIndex: 5, frequencyMS: 60 * 30, label: '30m' },
  { scaleIndex: 6, frequencyMS: 60 * 60, label: '1h' },
  { scaleIndex: 7, frequencyMS: 60 * 60 * 12, label: '12h' },
  { scaleIndex: 8, frequencyMS: 60 * 60 * 24, label: '24h' },
]

//given frequency in ms, return scale index
export function frequencyMSToScale(frequencyMS: number) {
  for (let i = 0; i < FrequencyScales.length; i++) {
    if (FrequencyScales[i].frequencyMS === frequencyMS) {
      return i
    }
  }
  return 0
}

//given scale index, return frequency in ms
export function scaleToFrequencyMS(scaleIndex: number) {
  return FrequencyScales[scaleIndex].frequencyMS
}

//given scale index, return frequency label
export function scaleToLabel(scaleIndex: number) {
  return FrequencyScales[scaleIndex].label
}

//given frequency ms, return la
export function frequencyMSToLabel(frequencyMS: number) {
  for (let i = 0; i < FrequencyScales.length; i++) {
    if (FrequencyScales[i].frequencyMS === frequencyMS) {
      return FrequencyScales[i].label
    }
  }
  return '10s'
}
