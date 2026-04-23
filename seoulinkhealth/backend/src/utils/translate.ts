/**
 * Free Google Translate API (unofficial but works for basic use).
 * Auto-detects source language via sl=auto.
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = (await res.json()) as [Array<[string, ...unknown[]]>, ...unknown[]]
    return data[0].map((item) => item[0]).join('')
  } catch {
    return text // Return original if translation fails
  }
}
