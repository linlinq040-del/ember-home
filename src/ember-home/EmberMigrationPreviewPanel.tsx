import { useState } from 'react';
import {
  previewEmberMigrationPackage,
  type EmberMigrationPreview
} from './emberMigrationPreview';

export function EmberMigrationPreviewPanel() {
  const [preview, setPreview] = useState<EmberMigrationPreview | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);

  const readPackage = async (file: File | null) => {
    if (!file) return;
    setReading(true);
    setError('');
    setPreview(null);
    try {
      setPreview(await previewEmberMigrationPackage(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '无法读取这个备份包');
    } finally {
      setReading(false);
    }
  };

  const recommended = preview?.candidates.find(
    (candidate) => candidate.collaboratorId === preview.recommendedCollaboratorId
  ) ?? null;

  return (
    <div className="ember-migration-preview">
      <div className="ember-preview-rooms-intro">
        <span className="ember-preview-eyebrow">LOCAL MIGRATION</span>
        <h1>先看看，再决定</h1>
        <p>备份只在这台设备上读取。本页不会导入、覆盖或上传任何资料。</p>
      </div>

      <label className="ember-migration-picker">
        <input
          type="file"
          accept=".zip,application/zip"
          disabled={reading}
          onChange={(event) => void readPackage(event.target.files?.[0] ?? null)}
        />
        <span aria-hidden="true">⌁</span>
        <strong>{reading ? '正在本地读取…' : '选择 Polaris 备份包'}</strong>
        <small>目前只生成预览，不会执行导入</small>
      </label>

      {error ? <div className="ember-migration-error" role="alert">{error}</div> : null}

      {preview ? (
        <section className="ember-migration-result" aria-live="polite">
          <div className="ember-migration-summary">
            <span><small>角色</small><strong>{preview.personaCount}</strong></span>
            <span><small>对话</small><strong>{preview.conversationCount}</strong></span>
            <span><small>写入</small><strong>0</strong></span>
          </div>

          {recommended ? (
            <article className="ember-migration-recommendation">
              <span className="ember-preview-eyebrow">识别到的 EMBER 候选</span>
              <h2>{recommended.name}</h2>
              <p>{recommended.conversationCount} 个对话 · {recommended.messageCount} 条消息</p>
              <ul>{recommended.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              <strong className="ember-migration-confirm-note">正式导入前仍需要你亲自确认</strong>
            </article>
          ) : (
            <article className="ember-migration-recommendation">
              <span className="ember-preview-eyebrow">需要确认</span>
              <h2>没有唯一候选</h2>
              <p>备份里存在多个相似角色，正式迁移时会让你明确选择唯一的 Ember。</p>
            </article>
          )}

          <div className="ember-migration-candidates">
            {preview.candidates.map((candidate) => (
              <div key={candidate.collaboratorId}>
                <span><strong>{candidate.name}</strong><small>{candidate.conversationCount} 个对话</small></span>
                <em>{candidate.confidence === 'high' ? '高匹配' : candidate.confidence === 'medium' ? '可能' : '待确认'}</em>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
