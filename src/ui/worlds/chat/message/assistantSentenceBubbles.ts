const SENTENCE_END = /[。！？!?；;]/;
const CLOSING_MARK = /[”’」』）)]/;
const MARKDOWN_BLOCK = /^(?:\s*```|\s*~~~|\s{0,3}#{1,6}\s|\s*>\s|\s*[-+*]\s|\s*\d+[.)]\s|\s*\|)/m;

function sentenceUnits(content: string, includeIncompleteTail: boolean) {
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
  if (includeIncompleteTail && tail) units.push(tail);
  return units;
}

/**
 * Presentation-only split used by Ember Home's conversational layout.
 * The persisted message remains intact so copy, speech, memory and future
 * model context always see the original reply.
 */
export function canRenderAssistantSentenceBubbles(content: string) {
  return Boolean(content.trim()) && !MARKDOWN_BLOCK.test(content);
}

export function splitAssistantSentenceBubbles(
  content: string,
  options: { includeIncompleteTail?: boolean } = {}
): string[] {
  const normalized = content.trim();
  if (!normalized) return [];
  if (!canRenderAssistantSentenceBubbles(normalized)) return [normalized];

  return sentenceUnits(normalized, options.includeIncompleteTail ?? true);
}
