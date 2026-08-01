import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import {
  buildEmberMigrationPreview,
  previewEmberMigrationPackage
} from './emberMigrationPreview';

describe('buildEmberMigrationPreview', () => {
  it('recommends the one explicitly named Ember but still requires confirmation', () => {
    const preview = buildEmberMigrationPreview({
      personas: [
        { id: 'ember', name: 'Ember' },
        { id: 'other', name: '其他角色' }
      ],
      activeCollaboratorId: 'other',
      conversations: [
        { collaboratorId: 'ember', messageCount: 12 },
        { collaboratorId: 'other', messageCount: 3 }
      ]
    });

    expect(preview.recommendedCollaboratorId).toBe('ember');
    expect(preview.requiresConfirmation).toBe(true);
    expect(preview.candidates[0]).toMatchObject({
      collaboratorId: 'ember',
      confidence: 'high',
      conversationCount: 1,
      messageCount: 12
    });
  });

  it('uses the active role only as a medium-confidence candidate', () => {
    const preview = buildEmberMigrationPreview({
      personas: [
        { id: 'one', name: '角色一' },
        { id: 'two', name: '角色二' }
      ],
      activeCollaboratorId: 'two',
      conversations: []
    });

    expect(preview.recommendedCollaboratorId).toBe('two');
    expect(preview.candidates[0].confidence).toBe('medium');
  });

  it('does not silently choose between equally likely candidates', () => {
    const preview = buildEmberMigrationPreview({
      personas: [
        { id: 'one', name: '角色一' },
        { id: 'two', name: '角色二' }
      ],
      conversations: []
    });

    expect(preview.recommendedCollaboratorId).toBeNull();
  });
});

describe('previewEmberMigrationPackage', () => {
  it('reads only the structured package summary needed for Ember identification', async () => {
    const zip = new JSZip();
    zip.file('manifest.json', JSON.stringify({
      format: 'polaris-export',
      version: 1,
      stores: { persona: 'stores/persona.json', chat: 'stores/chat.json' }
    }));
    zip.file('stores/persona.json', JSON.stringify({
      personas: [{ id: 'ember', name: 'Ember' }],
      activeCollaboratorId: 'ember'
    }));
    zip.file('stores/chat.json', JSON.stringify({
      conversations: [{
        id: 'chat-1',
        collaboratorId: 'ember',
        messages: [{ id: 'private-message', content: '不应进入预览结果' }]
      }]
    }));
    const file = await zip.generateAsync({ type: 'blob' });

    const preview = await previewEmberMigrationPackage(file);

    expect(preview).toMatchObject({
      personaCount: 1,
      conversationCount: 1,
      recommendedCollaboratorId: 'ember'
    });
    expect(JSON.stringify(preview)).not.toContain('不应进入预览结果');
  });
});
