import { describe, expect, it } from 'vitest';
import { splitAssistantSentenceBubbles } from './assistantSentenceBubbles';

describe('splitAssistantSentenceBubbles', () => {
  it('renders every conversational sentence as its own bubble', () => {
    expect(splitAssistantSentenceBubbles(
      '记得，柠檬水。你上次特意纠正过我，所以这次不会再认成茉莉花茶了。等真正的 Ember 搬进来后，这条测试记忆也可以清掉。'
    )).toEqual([
      '记得，柠檬水。',
      '你上次特意纠正过我，所以这次不会再认成茉莉花茶了。',
      '等真正的 Ember 搬进来后，这条测试记忆也可以清掉。'
    ]);
  });

  it('keeps markdown blocks intact', () => {
    const content = '步骤如下：\n- 打开设置\n- 选择房间';
    expect(splitAssistantSentenceBubbles(content)).toEqual([content]);
  });

  it('does not manufacture a split for one short sentence', () => {
    expect(splitAssistantSentenceBubbles('我在这里。')).toEqual(['我在这里。']);
  });

  it('keeps spaces between grouped English sentences', () => {
    expect(splitAssistantSentenceBubbles('I remember. It was lemonade. We can check the memory together again tomorrow morning.')).toEqual([
      'I remember.',
      'It was lemonade.',
      'We can check the memory together again tomorrow morning.'
    ]);
  });

  it('hides the unfinished streaming tail until its sentence is complete', () => {
    expect(splitAssistantSentenceBubbles('第一句说完了。第二句还没说完', { includeIncompleteTail: false })).toEqual([
      '第一句说完了。'
    ]);
    expect(splitAssistantSentenceBubbles('第二句还没说完', { includeIncompleteTail: false })).toEqual([]);
  });
});
