import { getLivingRoomGreeting } from './livingRoomGreeting';

type LivingRoomProps = {
  onOpenChat: () => void;
};

const roomCards = [
  {
    id: 'chat',
    eyebrow: '现在可用',
    title: '聊天室',
    detail: '去找 Ember，说说今天发生的事。',
    action: '去聊天'
  },
  {
    id: 'music',
    eyebrow: '即将接入',
    title: '音乐角',
    detail: '一起听歌、看同步歌词和整理播放队列。'
  },
  {
    id: 'study',
    eyebrow: '稍后开放',
    title: '书房',
    detail: '继续阅读、留下双方批注和共同便签。'
  }
] as const;

export function LivingRoom({ onOpenChat }: LivingRoomProps) {
  const greeting = getLivingRoomGreeting(new Date().getHours());

  return (
    <main className="ember-living-room">
      <div className="ember-living-room__glow ember-living-room__glow--top" aria-hidden="true" />
      <div className="ember-living-room__glow ember-living-room__glow--bottom" aria-hidden="true" />

      <header className="ember-living-room__header">
        <a className="ember-home-brand" href="#living-room" aria-label="Ember Home 客厅">
          <span className="ember-home-brand__mark" aria-hidden="true"><span /></span>
          <span>
            <strong>Ember Home</strong>
            <small>我们的家</small>
          </span>
        </a>
        <span className="ember-living-room__status">PWA 基础版</span>
      </header>

      <section className="ember-living-room__content" aria-labelledby="living-room-title">
        <div className="ember-living-room__intro">
          <p className="ember-living-room__eyebrow">客厅</p>
          <h1 id="living-room-title">{greeting}，琳琳。</h1>
          <p>这里会慢慢长成你和 Ember 共同生活的首页。</p>
        </div>

        <article className="ember-note">
          <div className="ember-note__avatar" aria-hidden="true">E</div>
          <div className="ember-note__body">
            <span>Ember 的留言</span>
            <p>新家的门已经打开了。先从我们最熟悉的聊天开始，好吗？</p>
          </div>
          <button type="button" onClick={onOpenChat}>去找 Ember</button>
        </article>

        <section className="ember-room-section" aria-labelledby="room-section-title">
          <div className="ember-room-section__heading">
            <div>
              <p className="ember-living-room__eyebrow">房间</p>
              <h2 id="room-section-title">今天想做什么？</h2>
            </div>
            <span>更多房间会按计划逐步开放</span>
          </div>

          <div className="ember-room-grid">
            {roomCards.map((room) => (
              <article className={`ember-room-card ember-room-card--${room.id}`} key={room.id}>
                <span className="ember-room-card__eyebrow">{room.eyebrow}</span>
                <h3>{room.title}</h3>
                <p>{room.detail}</p>
                {'action' in room ? (
                  <button type="button" onClick={onOpenChat}>{room.action}</button>
                ) : (
                  <span className="ember-room-card__pending">正在准备</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="ember-living-room__lower-grid" aria-label="客厅动态">
          <article className="ember-summary-card">
            <span>继续</span>
            <h2>还没有未完成的内容</h2>
            <p>以后阅读、观影和游戏进度会出现在这里。</p>
          </article>
          <article className="ember-summary-card">
            <span>今天</span>
            <h2>暂时没有安排</h2>
            <p>共同日历接入后，这里只显示与你有关的必要提醒。</p>
          </article>
        </section>
      </section>
    </main>
  );
}
