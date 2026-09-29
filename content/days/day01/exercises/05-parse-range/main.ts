export function parseRange(text: string): { from: number; to: number } {
  const [fromText, toText = fromText] = text.split('-');
  return { from: Number(fromText), to: Number(toText) };
}
