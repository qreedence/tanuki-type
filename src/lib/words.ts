import type { KanaEntry, KanaMode } from "@/lib/kana"

export type GameType = "kana" | "words"

type WordData = {
  expression: string
  reading: string
  romaji: string
  meaning: string
}

let wordCache: Map<string, WordData[]> = new Map()

export async function loadWords(pool: string): Promise<WordData[]> {
  const cached = wordCache.get(pool)
  if (cached) return cached

  const response = await fetch(`/data/words-${pool}.json`)
  const data: WordData[] = await response.json()
  wordCache.set(pool, data)
  return data
}

function toKatakana(text: string): string {
  return text.replace(/[ぁ-ゖ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 96)
  )
}

function isKatakanaWord(reading: string): boolean {
  return /[゠-ヿ]/.test(reading)
}

function generateAlternatives(romaji: string): string[] {
  const alts = new Set<string>([romaji])
  // っち: "tchi" ↔ "cchi"
  if (romaji.includes("tchi")) alts.add(romaji.replace(/tchi/g, "cchi"))
  if (romaji.includes("tcha")) alts.add(romaji.replace(/tcha/g, "ccha"))
  if (romaji.includes("tchu")) alts.add(romaji.replace(/tchu/g, "cchu"))
  if (romaji.includes("tcho")) alts.add(romaji.replace(/tcho/g, "ccho"))
  // っし: "sshi" is standard, also accept "shi" doubling as "sshi" (already correct)
  // Kunrei alternatives: "si" for "shi", "ti" for "chi", "tu" for "tsu", "hu" for "fu"
  if (romaji.includes("shi")) alts.add(romaji.replace(/shi/g, "si"))
  if (romaji.includes("chi")) alts.add(romaji.replace(/chi/g, "ti"))
  if (romaji.includes("tsu")) alts.add(romaji.replace(/tsu/g, "tu"))
  if (romaji.includes("fu")) alts.add(romaji.replace(/fu/g, "hu"))
  return [...alts]
}

export function wordsToSequence(
  words: WordData[],
  count: number,
  mode: KanaMode
): KanaEntry[] {
  let pool: WordData[]

  if (mode === "katakana") {
    pool = words
  } else if (mode === "hiragana") {
    pool = words.filter((w) => !isKatakanaWord(w.reading))
  } else {
    pool = words
  }

  if (pool.length === 0) pool = words

  const sequence: KanaEntry[] = []
  for (let i = 0; i < count; i++) {
    const word = pool[Math.floor(Math.random() * pool.length)]!
    let reading = word.reading

    if (mode === "katakana") {
      reading = toKatakana(reading)
    }

    const alternatives = generateAlternatives(word.romaji)
    sequence.push({
      kana: reading,
      romaji: alternatives,
    })
  }
  return sequence
}
