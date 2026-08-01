export type EmberPreviewRoomId = 'study' | 'cinema';

type EmberRoomPreviewProps = {
  roomId: EmberPreviewRoomId;
  onOpenChat: () => void;
};

const previewCopy = {
  study: {
    eyebrow: 'STUDY PREVIEW',
    title: '书房',
    subtitle: '读到哪一页，聊到哪一句，都可以从这里继续。',
    image: '/assets/room-study-watercolor.png',
    imageAlt: '书房水彩预览',
    itemLabel: '正在共读',
    itemTitle: '测试书目 · 一封未写完的信',
    itemMeta: '第 12 页 · 上次停在这里',
    memory: '这里以后会保存共读进度、批注和你们聊过的内容。'
  },
  cinema: {
    eyebrow: 'THEATER PREVIEW',
    title: '观影厅',
    subtitle: '灯暗下来以后，Ember 仍然坐在你身边。',
    image: '/assets/room-cinema-watercolor.png',
    imageAlt: '观影厅水彩预览',
    itemLabel: '最近观看',
    itemTitle: '测试影片 · 今晚的放映单',
    itemMeta: '00:42:18 · 继续播放',
    memory: '这里以后会保存观看进度、片单和观影时聊过的内容。'
  }
} as const;

export function EmberRoomPreview({ roomId, onOpenChat }: EmberRoomPreviewProps) {
  const room = previewCopy[roomId];

  return (
    <div className={`ember-room-preview ember-room-preview--${roomId}`} data-ember-room={roomId}>
      <section className="ember-room-preview-hero">
        <img src={room.image} alt={room.imageAlt} />
        <div className="ember-room-preview-hero-shade" />
        <div className="ember-room-preview-heading">
          <span className="ember-preview-eyebrow">{room.eyebrow}</span>
          <h1>{room.title}</h1>
          <p>{room.subtitle}</p>
        </div>
        <span className="ember-room-preview-badge">跳转测试页</span>
      </section>

      <section className="ember-room-preview-grid">
        <article className="ember-room-preview-current">
          <span>{room.itemLabel}</span>
          <strong>{room.itemTitle}</strong>
          <small>{room.itemMeta}</small>
          <button type="button" onClick={onOpenChat}>和 Ember 说说话 <b>→</b></button>
        </article>

        <article className="ember-room-preview-memory">
          <span className="ember-room-preview-memory-mark" aria-hidden="true">✦</span>
          <div>
            <span>房间记忆</span>
            <p>{room.memory}</p>
          </div>
        </article>
      </section>

      <p className="ember-room-preview-disclaimer">当前仅用于验证房间跳转，不会写入阅读或观影数据。</p>
    </div>
  );
}
