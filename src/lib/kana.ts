export type KanaEntry = {
  kana: string
  romaji: string[]
}

export type KanaMode = "hiragana" | "katakana" | "mixed"

const HIRAGANA: KanaEntry[] = [
  // Vowels
  { kana: "あ", romaji: ["a"] },
  { kana: "い", romaji: ["i"] },
  { kana: "う", romaji: ["u"] },
  { kana: "え", romaji: ["e"] },
  { kana: "お", romaji: ["o"] },
  // K-row
  { kana: "か", romaji: ["ka"] },
  { kana: "き", romaji: ["ki"] },
  { kana: "く", romaji: ["ku"] },
  { kana: "け", romaji: ["ke"] },
  { kana: "こ", romaji: ["ko"] },
  // S-row
  { kana: "さ", romaji: ["sa"] },
  { kana: "し", romaji: ["shi", "si"] },
  { kana: "す", romaji: ["su"] },
  { kana: "せ", romaji: ["se"] },
  { kana: "そ", romaji: ["so"] },
  // T-row
  { kana: "た", romaji: ["ta"] },
  { kana: "ち", romaji: ["chi", "ti"] },
  { kana: "つ", romaji: ["tsu", "tu"] },
  { kana: "て", romaji: ["te"] },
  { kana: "と", romaji: ["to"] },
  // N-row
  { kana: "な", romaji: ["na"] },
  { kana: "に", romaji: ["ni"] },
  { kana: "ぬ", romaji: ["nu"] },
  { kana: "ね", romaji: ["ne"] },
  { kana: "の", romaji: ["no"] },
  // H-row
  { kana: "は", romaji: ["ha"] },
  { kana: "ひ", romaji: ["hi"] },
  { kana: "ふ", romaji: ["fu", "hu"] },
  { kana: "へ", romaji: ["he"] },
  { kana: "ほ", romaji: ["ho"] },
  // M-row
  { kana: "ま", romaji: ["ma"] },
  { kana: "み", romaji: ["mi"] },
  { kana: "む", romaji: ["mu"] },
  { kana: "め", romaji: ["me"] },
  { kana: "も", romaji: ["mo"] },
  // Y-row
  { kana: "や", romaji: ["ya"] },
  { kana: "ゆ", romaji: ["yu"] },
  { kana: "よ", romaji: ["yo"] },
  // R-row
  { kana: "ら", romaji: ["ra"] },
  { kana: "り", romaji: ["ri"] },
  { kana: "る", romaji: ["ru"] },
  { kana: "れ", romaji: ["re"] },
  { kana: "ろ", romaji: ["ro"] },
  // W-row + N
  { kana: "わ", romaji: ["wa"] },
  { kana: "を", romaji: ["wo"] },
  { kana: "ん", romaji: ["nn"] },
  // Dakuten
  { kana: "が", romaji: ["ga"] },
  { kana: "ぎ", romaji: ["gi"] },
  { kana: "ぐ", romaji: ["gu"] },
  { kana: "げ", romaji: ["ge"] },
  { kana: "ご", romaji: ["go"] },
  { kana: "ざ", romaji: ["za"] },
  { kana: "じ", romaji: ["ji", "zi"] },
  { kana: "ず", romaji: ["zu"] },
  { kana: "ぜ", romaji: ["ze"] },
  { kana: "ぞ", romaji: ["zo"] },
  { kana: "だ", romaji: ["da"] },
  { kana: "ぢ", romaji: ["di", "dji"] },
  { kana: "づ", romaji: ["du", "dzu"] },
  { kana: "で", romaji: ["de"] },
  { kana: "ど", romaji: ["do"] },
  { kana: "ば", romaji: ["ba"] },
  { kana: "び", romaji: ["bi"] },
  { kana: "ぶ", romaji: ["bu"] },
  { kana: "べ", romaji: ["be"] },
  { kana: "ぼ", romaji: ["bo"] },
  // Handakuten
  { kana: "ぱ", romaji: ["pa"] },
  { kana: "ぴ", romaji: ["pi"] },
  { kana: "ぷ", romaji: ["pu"] },
  { kana: "ぺ", romaji: ["pe"] },
  { kana: "ぽ", romaji: ["po"] },
]

const KATAKANA: KanaEntry[] = [
  // Vowels
  { kana: "ア", romaji: ["a"] },
  { kana: "イ", romaji: ["i"] },
  { kana: "ウ", romaji: ["u"] },
  { kana: "エ", romaji: ["e"] },
  { kana: "オ", romaji: ["o"] },
  // K-row
  { kana: "カ", romaji: ["ka"] },
  { kana: "キ", romaji: ["ki"] },
  { kana: "ク", romaji: ["ku"] },
  { kana: "ケ", romaji: ["ke"] },
  { kana: "コ", romaji: ["ko"] },
  // S-row
  { kana: "サ", romaji: ["sa"] },
  { kana: "シ", romaji: ["shi", "si"] },
  { kana: "ス", romaji: ["su"] },
  { kana: "セ", romaji: ["se"] },
  { kana: "ソ", romaji: ["so"] },
  // T-row
  { kana: "タ", romaji: ["ta"] },
  { kana: "チ", romaji: ["chi", "ti"] },
  { kana: "ツ", romaji: ["tsu", "tu"] },
  { kana: "テ", romaji: ["te"] },
  { kana: "ト", romaji: ["to"] },
  // N-row
  { kana: "ナ", romaji: ["na"] },
  { kana: "ニ", romaji: ["ni"] },
  { kana: "ヌ", romaji: ["nu"] },
  { kana: "ネ", romaji: ["ne"] },
  { kana: "ノ", romaji: ["no"] },
  // H-row
  { kana: "ハ", romaji: ["ha"] },
  { kana: "ヒ", romaji: ["hi"] },
  { kana: "フ", romaji: ["fu", "hu"] },
  { kana: "ヘ", romaji: ["he"] },
  { kana: "ホ", romaji: ["ho"] },
  // M-row
  { kana: "マ", romaji: ["ma"] },
  { kana: "ミ", romaji: ["mi"] },
  { kana: "ム", romaji: ["mu"] },
  { kana: "メ", romaji: ["me"] },
  { kana: "モ", romaji: ["mo"] },
  // Y-row
  { kana: "ヤ", romaji: ["ya"] },
  { kana: "ユ", romaji: ["yu"] },
  { kana: "ヨ", romaji: ["yo"] },
  // R-row
  { kana: "ラ", romaji: ["ra"] },
  { kana: "リ", romaji: ["ri"] },
  { kana: "ル", romaji: ["ru"] },
  { kana: "レ", romaji: ["re"] },
  { kana: "ロ", romaji: ["ro"] },
  // W-row + N
  { kana: "ワ", romaji: ["wa"] },
  { kana: "ヲ", romaji: ["wo"] },
  { kana: "ン", romaji: ["nn"] },
  // Dakuten
  { kana: "ガ", romaji: ["ga"] },
  { kana: "ギ", romaji: ["gi"] },
  { kana: "グ", romaji: ["gu"] },
  { kana: "ゲ", romaji: ["ge"] },
  { kana: "ゴ", romaji: ["go"] },
  { kana: "ザ", romaji: ["za"] },
  { kana: "ジ", romaji: ["ji", "zi"] },
  { kana: "ズ", romaji: ["zu"] },
  { kana: "ゼ", romaji: ["ze"] },
  { kana: "ゾ", romaji: ["zo"] },
  { kana: "ダ", romaji: ["da"] },
  { kana: "ヂ", romaji: ["di", "dji"] },
  { kana: "ヅ", romaji: ["du", "dzu"] },
  { kana: "デ", romaji: ["de"] },
  { kana: "ド", romaji: ["do"] },
  { kana: "バ", romaji: ["ba"] },
  { kana: "ビ", romaji: ["bi"] },
  { kana: "ブ", romaji: ["bu"] },
  { kana: "ベ", romaji: ["be"] },
  { kana: "ボ", romaji: ["bo"] },
  // Handakuten
  { kana: "パ", romaji: ["pa"] },
  { kana: "ピ", romaji: ["pi"] },
  { kana: "プ", romaji: ["pu"] },
  { kana: "ペ", romaji: ["pe"] },
  { kana: "ポ", romaji: ["po"] },
]

const KANA_TO_ROMAJI = new Map<string, string>()
for (const entry of [...HIRAGANA, ...KATAKANA]) {
  KANA_TO_ROMAJI.set(entry.kana, entry.romaji[0]!)
}
const SMALL_Y = "ゃゅょャュョ"
const SMALL_TSU = "っッ"

const COMBO_MAP: Record<string, Record<string, string>> = {
  き: { ゃ: "kya", ゅ: "kyu", ょ: "kyo" },
  し: { ゃ: "sha", ゅ: "shu", ょ: "sho" },
  ち: { ゃ: "cha", ゅ: "chu", ょ: "cho" },
  に: { ゃ: "nya", ゅ: "nyu", ょ: "nyo" },
  ひ: { ゃ: "hya", ゅ: "hyu", ょ: "hyo" },
  み: { ゃ: "mya", ゅ: "myu", ょ: "myo" },
  り: { ゃ: "rya", ゅ: "ryu", ょ: "ryo" },
  ぎ: { ゃ: "gya", ゅ: "gyu", ょ: "gyo" },
  じ: { ゃ: "ja", ゅ: "ju", ょ: "jo" },
  ぢ: { ゃ: "dya", ゅ: "dyu", ょ: "dyo" },
  び: { ゃ: "bya", ゅ: "byu", ょ: "byo" },
  ぴ: { ゃ: "pya", ゅ: "pyu", ょ: "pyo" },
}

function toHiraganaChar(ch: string): string {
  const code = ch.charCodeAt(0)
  if (code >= 0x30a1 && code <= 0x30f6) return String.fromCharCode(code - 96)
  return ch
}

function smallYToHiragana(ch: string): string {
  const map: Record<string, string> = {
    ャ: "ゃ",
    ュ: "ゅ",
    ョ: "ょ",
  }
  return map[ch] ?? ch
}

export type HintGroup = { chars: string; romaji: string }

export function groupKanaHints(kana: string): HintGroup[] {
  const chars = [...kana]
  const groups: HintGroup[] = []

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!
    const next = chars[i + 1]

    if (next && SMALL_Y.includes(next)) {
      const baseH = toHiraganaChar(ch)
      const smallH = smallYToHiragana(toHiraganaChar(next))
      const combo = COMBO_MAP[baseH]?.[smallH]
      groups.push({ chars: ch + next, romaji: combo ?? KANA_TO_ROMAJI.get(ch)! + KANA_TO_ROMAJI.get(next)! })
      i++
    } else if (SMALL_TSU.includes(ch) && next) {
      const nextNext = chars[i + 2]
      if (nextNext && SMALL_Y.includes(nextNext)) {
        const baseH = toHiraganaChar(next)
        const smallH = smallYToHiragana(toHiraganaChar(nextNext))
        const combo = COMBO_MAP[baseH]?.[smallH] ?? ""
        groups.push({
          chars: ch + next + nextNext,
          romaji: combo[0] + combo,
        })
        i += 2
      } else {
        const nextRomaji = KANA_TO_ROMAJI.get(toHiraganaChar(next)) ?? KANA_TO_ROMAJI.get(next) ?? next
        groups.push({
          chars: ch + next,
          romaji: nextRomaji[0] + nextRomaji,
        })
        i++
      }
    } else if (ch === "ー" && groups.length > 0) {
      const prevRomaji = groups[groups.length - 1]!.romaji
      const lastVowel = prevRomaji.match(/[aiueo]$/)?.[0] ?? ""
      groups.push({ chars: ch, romaji: lastVowel })
    } else {
      groups.push({
        chars: ch,
        romaji: KANA_TO_ROMAJI.get(ch) ?? ch,
      })
    }
  }

  return groups
}

export function getKanaPool(mode: KanaMode): KanaEntry[] {
  switch (mode) {
    case "hiragana":
      return HIRAGANA
    case "katakana":
      return KATAKANA
    case "mixed":
      return [...HIRAGANA, ...KATAKANA]
  }
}

export function generateSequence(mode: KanaMode, count: number): KanaEntry[] {
  const pool = getKanaPool(mode)
  const sequence: KanaEntry[] = []
  for (let i = 0; i < count; i++) {
    sequence.push(pool[Math.floor(Math.random() * pool.length)]!)
  }
  return sequence
}

export function isValidPrefix(input: string, romaji: string[]): boolean {
  return romaji.some((r) => r.startsWith(input))
}

export function isCompleteMatch(input: string, romaji: string[]): boolean {
  return romaji.includes(input)
}
