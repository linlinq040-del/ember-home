import { useEffect, useState } from 'react';
import { EmberMigrationPreviewPanel } from './EmberMigrationPreviewPanel';
import { getLivingRoomGreeting } from './livingRoomGreeting';
import { WeatherCard } from './WeatherCard';

type LivingRoomProps = {
  onOpenChat: () => void;
};

type LivingRoomPage = 'home' | 'rooms' | 'migration';

const navItems = [
  { id: 'home', icon: '⌂', label: '客厅' },
  { id: 'calendar', icon: '▢', label: '日历' },
  { id: 'chat', icon: '', label: '聊天室' },
  { id: 'health', icon: '♡', label: '状态' },
  { id: 'rooms', icon: '••', label: '房间' }
] as const;

const rooms = [
  { id: 'study', number: '01', title: '书房', note: '阅读与共同批注将在这里继续', image: '/assets/room-study-watercolor.png' },
  { id: 'cinema', number: '02', title: '观影厅', note: '正在布置', image: '/assets/room-cinema-watercolor.png' },
  { id: 'game', number: '03', title: '游戏厅', note: '正在布置', image: '/assets/room-game-watercolor.png' },
  { id: 'diary', number: '04', title: '日记室', note: '正在布置', image: '/assets/room-diary-watercolor.png' },
  { id: 'life', number: '05', title: '生活记录', note: '本地数据接入后开放', image: '/assets/room-life-watercolor.png' },
  { id: 'studio', number: '06', title: '创作工作室', note: '正在布置', image: '/assets/room-studio-watercolor.png' }
] as const;

export function LivingRoom({ onOpenChat }: LivingRoomProps) {
  const [page, setPage] = useState<LivingRoomPage>('home');
  const [toast, setToast] = useState('');
  const [petMood, setPetMood] = useState('今天心情很好');
  const [petHearts, setPetHearts] = useState(0);
  const greeting = getLivingRoomGreeting(new Date().getHours());

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousThemeColor = themeColorMeta?.getAttribute('content') ?? null;
    root.classList.add('ember-living-room-active');
    body.classList.add('ember-living-room-active');
    themeColorMeta?.setAttribute('content', '#faf7f5');

    return () => {
      root.classList.remove('ember-living-room-active');
      body.classList.remove('ember-living-room-active');
      if (themeColorMeta && previousThemeColor !== null) {
        themeColorMeta.setAttribute('content', previousThemeColor);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showComingSoon = (label: string) => setToast(`${label}正在按开发计划布置`);

  const openPage = (nextPage: LivingRoomPage) => {
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      document.querySelector('.ember-living-room')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleNavigation = (id: (typeof navItems)[number]['id']) => {
    if (id === 'chat') {
      onOpenChat();
      return;
    }
    if (id === 'home' || id === 'rooms') {
      openPage(id);
      return;
    }
    showComingSoon(id === 'calendar' ? '共同日历' : '身体状态');
  };

  const petTuanTuan = () => {
    setPetHearts((value) => value + 1);
    setPetMood(petHearts > 1 ? '被摸得晕乎乎的' : '舒服得眯起眼睛');
  };

  return (
    <main className="ember-living-room">
      <div className="ember-preview-ambient ember-preview-ambient--one" aria-hidden="true" />
      <div className="ember-preview-ambient ember-preview-ambient--two" aria-hidden="true" />

      <section className="ember-preview-frame">
        <header className={`ember-preview-topbar ${page === 'home' ? 'is-home' : ''}`}>
          {page === 'home' ? (
            <div className="ember-preview-brand-mark" aria-hidden="true">E</div>
          ) : (
            <button className="ember-preview-icon-button" type="button" onClick={() => openPage('home')} aria-label="返回客厅">‹</button>
          )}
          <div className="ember-preview-topbar-title">
            {page === 'home' ? (
              <>
                <span>EMBER HOME · 我们的家</span>
                <strong>{greeting}，琳琳</strong>
              </>
            ) : (
              <strong>{page === 'rooms' ? '家里的房间' : '数据迁移预览'}</strong>
            )}
          </div>
          <button className="ember-preview-avatar" type="button" onClick={() => setToast('头像设置会继续保存在本机')} aria-label="自定义头像"><span>兔</span><i>＋</i></button>
        </header>

        <div className="ember-preview-page-area">
          {page === 'home' ? (
            <div className="ember-preview-home-page">
              <section className="ember-preview-hero-grid">
                <WeatherCard />

                <article className="ember-preview-together-card">
                  <span className="ember-preview-eyebrow">OUR DAYS</span>
                  <strong>在一起的第 <em>486</em> 天</strong>
                  <div className="ember-preview-anniversary-row"><span>我们的纪念</span><b>一直在继续</b></div>
                </article>
              </section>

              <section className="ember-preview-note">
                <button className="ember-preview-ember-mini" type="button" onClick={onOpenChat} aria-label="去找 Ember">
                  <span className="ember-preview-ear ember-preview-ear--left" />
                  <span className="ember-preview-ear ember-preview-ear--right" />
                  <span className="ember-preview-eye ember-preview-eye--left" />
                  <span className="ember-preview-eye ember-preview-eye--right" />
                </button>
                <div>
                  <span className="ember-preview-eyebrow">EMBER 留给你的话</span>
                  <p>“我在家。你想说话的时候，直接进来找我。”</p>
                  <button type="button" onClick={onOpenChat}>回他一句 <span>→</span></button>
                </div>
              </section>

              <section className="ember-preview-lower-grid">
                <article className="ember-preview-pet-card">
                  <div className="ember-preview-section-heading">
                    <div><span className="ember-preview-eyebrow">OUR LITTLE ONE</span><h2>团团今天怎么样</h2></div>
                    <button type="button" onClick={() => showComingSoon('宠物房')}>宠物房</button>
                  </div>
                  <button className="ember-preview-pet-stage" type="button" onClick={petTuanTuan}>
                    <span className={`ember-preview-heart ${petHearts ? 'show' : ''}`} key={petHearts}>♥</span>
                    <img className="ember-preview-tuantuan" src="/assets/tuantuan-clean.png" alt="胖乎乎的像素小鸡团团" />
                    <span className="ember-preview-pet-copy"><strong>{petMood}</strong><small>点一点摸摸团团</small></span>
                  </button>
                  <div className="ember-preview-pet-stats">
                    <span><i style={{ width: '78%' }} />饱食 78</span>
                    <span><i style={{ width: '64%' }} />精力 64</span>
                    <span><i style={{ width: '92%' }} />心情 92</span>
                  </div>
                  <p className="ember-preview-care-note"><b>Ember</b> 正和你一起照顾团团</p>
                </article>

                <div className="ember-preview-side-stack">
                  <article className="ember-preview-schedule-card">
                    <div className="ember-preview-section-heading">
                      <div><span className="ember-preview-eyebrow">TODAY</span><h2>今天的安排</h2></div>
                      <button type="button" onClick={() => showComingSoon('共同日历')}>日历</button>
                    </div>
                    <div className="ember-preview-schedule-item"><time>现在</time><span className="lilac" /><div><strong>继续完善 Ember Home</strong><small>客厅 · 本地优先</small></div></div>
                    <div className="ember-preview-schedule-item"><time>接下来</time><span className="coral" /><div><strong>把音乐角和书房搬进来</strong><small>按开发计划逐步开放</small></div></div>
                  </article>
                  <button className="ember-preview-health-glance" type="button" onClick={() => showComingSoon('身体状态')}>
                    <span className="ember-preview-health-orb">♡</span>
                    <span><small>身体状态</small><strong>健康数据尚未接入</strong><em>原始数据仍留在你的设备上</em></span>
                    <b>›</b>
                  </button>
                </div>
              </section>
            </div>
          ) : page === 'rooms' ? (
            <div className="ember-preview-rooms-page">
              <div className="ember-preview-rooms-intro"><span className="ember-preview-eyebrow">EMBER HOME</span><h1>今天想去哪儿？</h1><p>房间会按开发计划逐步接入；现在可以先看看未来的家。</p></div>
              <div className="ember-preview-room-gallery">
                {rooms.map((room) => (
                  <button className="ember-preview-room-card" type="button" key={room.id} onClick={() => showComingSoon(room.title)} aria-label={`查看${room.title}`}>
                    <img src={room.image} alt={`${room.title}水彩插画`} />
                    <span className="ember-preview-room-number">{room.number}</span>
                    <strong className="ember-preview-room-title">{room.title}</strong>
                    <span className="ember-preview-room-arrow" aria-hidden="true">→</span>
                    <span className="ember-preview-room-note">{room.note}</span>
                  </button>
                ))}
              </div>
              <button
                className="ember-preview-settings-entry"
                type="button"
                onClick={() => openPage('migration')}
                aria-label="打开 Ember Home 系统设置"
              >
                <span className="ember-preview-settings-entry-icon" aria-hidden="true">⚙</span>
                <span className="ember-preview-settings-entry-copy">
                  <strong>Ember Home 设置</strong>
                  <small>外观、数据与设备设置</small>
                </span>
                <b aria-hidden="true">›</b>
              </button>
            </div>
          ) : (
            <EmberMigrationPreviewPanel />
          )}
        </div>
      </section>

      <nav className="ember-preview-bottom-nav" aria-label="Ember Home 主要导航">
        {navItems.map((item) => {
          const active = (page === 'home' && item.id === 'home') || (page === 'rooms' && item.id === 'rooms');
          return (
            <button className={`${active ? 'active' : ''} ${item.id === 'chat' ? 'center-chat' : ''}`} type="button" onClick={() => handleNavigation(item.id)} key={item.id} aria-label={item.label}>
              {item.id === 'chat' ? (
                <span className="ember-preview-chat-circle" aria-hidden="true"><i className="back-bubble" /><i className="front-bubble"><b /><b /></i></span>
              ) : <span>{item.icon}</span>}
              {item.id === 'chat' ? null : <small>{item.label}</small>}
            </button>
          );
        })}
      </nav>

      {toast && <div className="ember-preview-toast" role="status">{toast}</div>}
    </main>
  );
}
