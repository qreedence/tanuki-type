import { toRomaji } from "wanakana"
import { writeFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_URL =
  "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/out/all.csv"

type WordEntry = {
  expression: string
  reading: string
  romaji: string
  meaning: string
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

function getJlptLevel(tags: string): number | null {
  const match = tags.match(/JLPT_(\d)/)
  return match ? parseInt(match[1]!) : null
}

function isValidReading(reading: string): boolean {
  if (!reading) return false
  // Skip readings with kanji, Latin chars, or special markers
  if (/[a-zA-Z0-9]/.test(reading)) return false
  if (/[～〜・]/.test(reading)) return false
  // Must be at least 2 characters for word mode
  if ([...reading].length < 2) return false
  return true
}

function alignNn(reading: string, romaji: string): string {
  // Rebuild romaji character by character from the reading,
  // using wanakana's output but replacing ん → "nn"
  const chars = [...reading]
  let result = ""
  let romajiPos = 0

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!

    if (ch === "ん" || ch === "ン") {
      // wanakana outputs single "n" for ん — we want "nn"
      // Skip the "n" in the original romaji and write "nn"
      if (romaji[romajiPos] === "n") {
        result += "nn"
        romajiPos += 1
        // wanakana sometimes outputs "nn" already (before vowels/y)
        if (romaji[romajiPos] === "n" && chars[i + 1] !== "な" && chars[i + 1] !== "に" && chars[i + 1] !== "ぬ" && chars[i + 1] !== "ね" && chars[i + 1] !== "の") {
          romajiPos += 1
        }
      }
    } else if (ch === "っ" || ch === "ッ") {
      // Small tsu doubles the next consonant — wanakana handles this,
      // just consume the doubled consonant from romaji
      if (romajiPos < romaji.length) {
        result += romaji[romajiPos]!
        romajiPos += 1
      }
    } else {
      // Regular kana — consume romaji chars until we hit the next kana boundary
      // Find how many romaji chars this kana takes by trying lengths 1-4
      const remaining = romaji.slice(romajiPos)
      const nextReading = chars.slice(i + 1).join("")
      const nextRomaji = toRomaji(ch).toLowerCase()

      if (remaining.startsWith(nextRomaji)) {
        result += nextRomaji
        romajiPos += nextRomaji.length
      } else {
        // Fallback: combination kana or edge case, consume from wanakana output
        // Try to figure out how many chars to consume
        const fullRemaining = toRomaji(chars.slice(i).join("")).toLowerCase()
        const nextCharRomaji = chars[i + 1]
          ? toRomaji(chars.slice(i + 1).join("")).toLowerCase()
          : ""
        const consumed = fullRemaining.length - nextCharRomaji.length
        result += romaji.slice(romajiPos, romajiPos + consumed)
        romajiPos += consumed
      }
    }
  }

  return result
}

async function main() {
  console.log("Fetching JLPT word list...")
  const response = await fetch(CSV_URL)
  const csv = await response.text()
  const lines = csv.split("\n").slice(1) // skip header

  const wordsByLevel: Record<number, WordEntry[]> = {
    5: [],
    4: [],
    3: [],
    2: [],
    1: [],
  }

  for (const line of lines) {
    if (!line.trim()) continue
    const fields = parseCsvLine(line)
    if (fields.length < 4) continue

    const [expression, reading, meaning, tags] = fields as [
      string,
      string,
      string,
      string,
    ]
    const level = getJlptLevel(tags)
    if (!level) continue
    if (!isValidReading(reading)) continue

    let romaji = toRomaji(reading).toLowerCase()
    // Skip if romaji conversion produced anything unexpected
    if (/[^a-z]/.test(romaji)) continue

    // Post-process: replace single "n" from ん with "nn" to match kana mode.
    // Walk through reading and romaji in parallel to find ん positions.
    romaji = alignNn(reading, romaji)

    wordsByLevel[level]!.push({
      expression,
      reading,
      romaji,
      meaning,
    })
  }

  // Deduplicate by reading within each level
  for (const level of Object.keys(wordsByLevel)) {
    const seen = new Set<string>()
    wordsByLevel[Number(level)] = wordsByLevel[Number(level)]!.filter((w) => {
      if (seen.has(w.reading)) return false
      seen.add(w.reading)
      return true
    })
  }

  // Log stats
  for (const [level, words] of Object.entries(wordsByLevel)) {
    console.log(`  N${level}: ${words.length} words`)
  }

  // Build cumulative tiers
  const n5 = wordsByLevel[5]!
  const n4 = [...n5, ...wordsByLevel[4]!]
  const n3 = [...n4, ...wordsByLevel[3]!]

  const outDir = resolve(__dirname, "../public/data")
  mkdirSync(outDir, { recursive: true })

  writeFileSync(resolve(outDir, "words-n5.json"), JSON.stringify(n5))
  writeFileSync(resolve(outDir, "words-n4.json"), JSON.stringify(n4))
  writeFileSync(resolve(outDir, "words-n3.json"), JSON.stringify(n3))

  console.log(`\nGenerated:`)
  console.log(`  words-n5.json: ${n5.length} words`)
  console.log(`  words-n4.json: ${n4.length} words`)
  console.log(`  words-n3.json: ${n3.length} words`)
}

main().catch(console.error)
