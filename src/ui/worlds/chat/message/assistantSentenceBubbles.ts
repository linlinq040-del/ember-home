const SENTENCE_END = /[。！？!?；;]/;
const CLOSING_MARK = /[”’」』）)]/;
const MARKDOWN_BLOCK = /^(?:\s*```|\s*~~~|\s{0,3}#{1,6}\s|\s*>\s|\s*[-+*]\s|\s*\d+[.)]\s|\s*\|)/m;

function sentenceUnits(content: string) {
  const units: string[] = [];
  let current = '';

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    current += character;

    if (character === '\n') {
      const unit = current.trim();
      if (unit) units.push(unit);
      current = '';
      continue;
    }

    const isLatinPeriodBoundary = character === '.' && (index + 1 === content.length || /\s/.test(content[index + 1]));
    if (!SENTENCE_END.test(character) && !isLatinPeriodBoundary) continue;
    while (index + 1 < content.length && CLOSING_MARK.test(content[index + 1])) {
      current += content[index + 1];
      index += 1;
    }
    const unit = current.trim();
    if (unit) units.push(unit);
    current = '';
  }

  const tail = current.trim();
  if (tail) units.push(tail);
  return units;
}

/**
 * Presentation-only split used by Ember Home's conversational layout.
 * The persisted message remains intact so copy, speech, memory and future
 * model context always see the original reply.
 */
export function splitAssistantSentenceBubbles(content: string): string[] {
  const normalized = content.trim();
  if (!normalized || MARKDOWN_BLOCK.test(normalized)) return [normalized];

  const units = sentenceUnits(normalized);
  if (units.length < 2) return [normalized];

  const bubbles: string[] = [];
  let current = '';

  units.forEach((unit) => {
    const needsSpace = /[\x00-\x7F]$/.test(current) && /^[A-Za-z0-9(]/.test(unit);
    const candidate = current ? `${current}${needsSpace ? ' ' : ''}${unit}` : unit;
    if (current && current.length >= 18 && candidate.length > 58) {
      bubbles.push(current);
      current = unit;
    } else {
      current = candidate;
    }
  });
  if (current) bubbles.push(current);

  if (bubbles.length < 2) return [normalized];
  if (bubbles.length <= 6) return bubbles;
  return [...bubbles.slice(0, 5), bubbles.slice(5).join('')];
}
