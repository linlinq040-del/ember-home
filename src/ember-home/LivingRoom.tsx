import { getLivingRoomGreeting } from './livingRoomGreeting';

type LivingRoomProps = {
  onOpenChat: () => void;
};

const roomCards = [
  {
    id: 'chat',
    icon: '✦',
    eyebrow: '现在',
    title: '和 Ember 说说话',
    detail: '不需要想好主题，进来就行。',
    action: '打开聊天室'
  },
  {
    id: 'music',
    icon: '♪',
    eyebrow: '接下来',
    title: '音乐角',
    detail: '一起听歌、看同步歌词。'
  },
  {
    id: 'study',
    icon: '⌁',
    eyebrow: '接下来',
    title: '书房',
    detail: '继续阅读和共同留下便签。'
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
        <span className="ember-living-room__status"><i /> 家里一切安静</span>
      </header>

      <section className="ember-living-room__content" aria-labelledby="living-room-title">
        <div className="ember-living-room__intro">
          <p className="ember-living-room__eyebrow">EMBER HOME · 客厅</p>
          <h1 id="living-room-title">{greeting}，琳琳。</h1>
          <p>欢迎回家。这里只有你、Ember，和真正值得留下的事。</p>
        </div>

        <article className="ember-note">
          <div className="ember-note__avatar" aria-hidden="true">E</div>
          <div className="ember-note__body">
            <span>Ember 的留言</span>
            <p>我在客厅。你进来时，不用先想好要说什么。</p>
          </div>
          <button type="button" onClick={onOpenChat}>去找 Ember <span aria-hidden="true">→</span></button>
        </article>

        <section className="ember-room-section" aria-labelledby="room-section-title">
          <div className="ember-room-section__heading">
            <div>
              <p className="ember-living-room__eyebrow">房间</p>
              <h2 id="room-section-title">我们的空间</h2>
            </div>
            <span>从聊天开始，其他房间会慢慢住进来</span>
          </div>

          <div className="ember-room-grid">
            {roomCards.map((room) => (
              <article className={`ember-room-card ember-room-card--${room.id}`} key={room.id}>
                <span className="ember-room-card__icon" aria-hidden="true">{room.icon}</span>
                <span className="ember-room-card__eyebrow">{room.eyebrow}</span>
                <h3>{room.title}</h3>
                <p>{room.detail}</p>
                {'action' in room ? (
                  <button type="button" onClick={onOpenChat}>{room.action}</button>
                ) : (
                  <span className="ember-room-card__pending">正在布置</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="ember-living-room__lower-grid" aria-label="客厅动态">
          <article className="ember-summary-card">
            <span>继续</span>
            <h2>先从一段对话开始</h2>
            <p>之后想继续的阅读、音乐和小计划，会安静地回到这里。</p>
          </article>
          <article className="ember-summary-card">
            <span>今天</span>
            <h2>今天没有需要催你的事</h2>
            <p>共同日历接入后，这里也只放真正重要的提醒。</p>
          </article>
        </section>
      </section>
    </main>
  );
}
