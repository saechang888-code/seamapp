// 새암교회 앱 — 설교·예배·소식·함께하기·교회 소개
// 화면은 주소 끝(#/home 등)에 따라 바뀐다. 자료는 data/church.json(교회 정보)·data/sermons.json(설교, 액션이 주일마다 갱신).
(function () {
  'use strict';
  const $app = document.getElementById('app');
  const D = { church: null, sermons: [] };
  const APP_URL = 'https://saechang888-code.github.io/seamapp/';

  const store = {
    get(k, d) { try { const v = localStorage.getItem('seam.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('seam.' + k, JSON.stringify(v)); } catch (e) { /* 사생활 보호 창 등 */ } }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000); }
  const dateKo = iso => { const [y, m, d] = iso.split('-').map(Number); return `${y}년 ${m}월 ${d}일`; };
  const yt = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const I = {
    home: '<path d="M4 11l8-7 8 7v9H4z"/>', play: '<path d="M8 5v14l11-7z"/>',
    church: '<path d="M12 2v6M9 5h6M5 21V12l7-4 7 4v9z"/><path d="M10 21v-5h4v5"/>',
    hands: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    book: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z"/>',
    next: '<path d="M9 5l7 7-7 7"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
  };
  const ico = (n, color, size) => `<svg class="icon" width="${size || 22}" height="${size || 22}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
  function tabbar(on) {
    const t = [['home', '홈', 'home'], ['sermons', '설교', 'play'], ['worship', '예배', 'clock'], ['together', '함께', 'hands'], ['about', '교회', 'church']];
    return `<nav class="tabbar" aria-label="주 메뉴">${t.map(([r, n, i]) => `<a href="#/${r}" class="${on === r ? 'on' : ''}"${on === r ? ' aria-current="page"' : ''}>${ico(i)}${n}</a>`).join('')}</nav>`;
  }
  const videoBox = (s, id, badge) => `<div class="video" id="${id}">${badge ? `<span class="badge">${badge}</span>` : ''}<img src="${yt(s.video)}" alt="">
      <button class="play" data-play="${esc(s.video)}" data-box="${id}" aria-label="${esc(s.title)} 영상 재생"><span>${ico('play', '#fff', 22)}</span></button></div>`;

  // ---------- 홈 ----------
  function viewHome() {
    const c = D.church, s = D.sermons[0];
    if (!c) return `<main><p class="muted">불러오는 중입니다…</p></main>${tabbar('home')}`;
    const ev = c.events.filter(e => e.date >= new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10));
    return `<main>
      <div class="hero"><img src="images/hero.jpg" alt="">
        <div class="cap"><span style="display:flex;align-items:center;gap:10px"><img src="images/logo.png" alt="" width="40" height="40" style="border-radius:10px;background:#fff;padding:3px"><span class="serif" style="font-size:24px;font-weight:700">${esc(c.name)}</span></span>
          <span style="font-size:13px;opacity:.9">${esc(c.motto)}</span></div></div>
      <div class="grid4" style="grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">
        <a class="quick" href="#/worship"><span class="ic">${ico('clock', '#1F5A3E', 20)}</span>예배 시간</a>
        <a class="quick" href="#/worship"><span class="ic">${ico('pin', '#1F5A3E', 20)}</span>오시는 길</a>
        <a class="quick" href="tel:${c.phone.replace(/-/g, '')}"><span class="ic">${ico('phone', '#1F5A3E', 20)}</span>전화하기</a>
        <a class="quick" href="#/give"><span class="ic">${ico('gift', '#1F5A3E', 20)}</span>헌금</a>
        <button class="quick" data-invite style="font-family:inherit"><span class="ic">${ico('share', '#1F5A3E', 20)}</span>초대하기</button>
      </div>
      ${s ? `<section style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><h2>이주의 설교</h2><a href="#/sermons" class="muted" style="font-size:13px">지난 설교 ›</a></div>
        ${videoBox(s, 'hbox', '이주의 설교')}
        <div><div class="serif" style="font-size:17px;font-weight:700;color:var(--navy-deep)">${esc(s.title)}</div><div class="muted" style="font-size:13px;margin-top:3px">${dateKo(s.date)} 주일예배 · ${esc(s.preacher)}</div></div>
      </section>` : ''}
      ${ev.length ? `<section style="display:flex;flex-direction:column;gap:10px"><h2>교회 소식</h2>
        ${ev.map(e => `<a class="card" href="${esc(e.url)}" target="_blank" rel="noopener" style="display:flex;gap:14px;align-items:center">
          <span style="width:54px;height:54px;flex-shrink:0;border-radius:14px;background:var(--navy);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:11px">${Number(e.date.slice(5, 7))}월</span><span class="serif" style="font-size:20px;font-weight:700;line-height:1">${Number(e.date.slice(8))}</span></span>
          <span style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-weight:700;color:var(--navy-deep)">${esc(e.title)}</span><span class="muted" style="font-size:12px;line-height:1.5">${esc(e.desc)}</span></span>${ico('next', '#4A5263', 16)}</a>`).join('')}
      </section>` : ''}
      <a class="card" href="https://saechang888-code.github.io/berith/" target="_blank" rel="noopener" style="display:flex;gap:14px;align-items:center;background:var(--navy-soft);border-color:transparent">
        ${ico('book', '#1F5A3E', 26)}<span style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-weight:700;color:var(--navy-deep)">베리트365 — 매일 말씀과 묵상</span><span class="muted" style="font-size:12px">오늘의 말씀 영상 · 성경 · 나의 묵상 기록</span></span>${ico('ext', '#1F5A3E', 16)}</a>
    </main>${tabbar('home')}`;
  }

  // ---------- 설교 ----------
  function viewSermons() {
    const q = store.get('q', ''), cur = store.get('cur', null);
    const list = D.sermons.filter(s => !q || s.title.includes(q));
    const top = D.sermons.find(s => s.video === cur) || D.sermons[0];
    return `<main>
      <div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">SERMON</span><h1>주일 설교</h1><span class="muted" style="font-size:13px">이재선 담임목사 · 유튜브 「[새암교회]비전센터」</span></div>
      ${top ? `${videoBox(top, 'sbox')}<div><div class="serif" style="font-size:17px;font-weight:700;color:var(--navy-deep)">${esc(top.title)}</div><div class="muted" style="font-size:13px;margin-top:3px">${dateKo(top.date)} 주일예배 · ${esc(top.preacher)}</div></div>` : ''}
      <label style="display:flex;align-items:center;gap:8px;background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:0 14px;height:46px">${ico('search', '#4A5263', 18)}<span class="sr">설교 찾기</span>
        <input type="text" id="sq" value="${esc(q)}" placeholder="설교 제목으로 찾기" style="border:0;padding:0;background:none;height:44px"></label>
      <div class="list">${list.map(s => `<a href="#/sermons" data-cur="${esc(s.video)}" data-title="${esc(s.title)}"><img class="thumb" src="${yt(s.video)}" alt="" loading="lazy">
          <span class="grow"><span style="font-weight:700;color:var(--navy-deep);font-size:15px">${esc(s.title)}</span><span class="sub">${dateKo(s.date)} · ${esc(s.preacher)}</span></span></a>`).join('') || '<p class="muted">찾는 설교가 없습니다.</p>'}</div>
      <a class="btn btn-line" href="https://www.youtube.com/@seamvision" target="_blank" rel="noopener">유튜브에서 모든 영상 보기 ${ico('ext', '#12382A', 16)}</a>
    </main>${tabbar('sermons')}`;
  }

  // ---------- 예배 · 오시는 길 ----------
  function viewWorship() {
    const c = D.church; if (!c) return `<main></main>${tabbar('worship')}`;
    return `<main>
      <div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">WORSHIP</span><h1>예배 안내</h1><span class="muted serif" style="font-size:14px">하나님은 영이시니 예배하는 자가 영과 진리로 예배할지니라 (요 4:24)</span></div>
      <div class="card" style="padding:6px 18px"><div class="list">${c.worship.map(w => `<div class="row"><span class="grow"><span style="font-weight:700;color:var(--navy-deep)">${esc(w.name)}</span>${w.note ? `<span class="sub">${esc(w.note)}</span>` : ''}</span><span class="serif" style="color:var(--gold-text);font-weight:700">${esc(w.time)}</span></div>`).join('')}</div></div>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>온라인으로 함께하기</h2>
        <div class="grid2">
          <a class="card" href="https://www.youtube.com/@seamvision" target="_blank" rel="noopener" style="display:flex;flex-direction:column;gap:6px">${ico('play', '#1F5A3E')}<b style="color:var(--navy-deep)">주일 설교 영상</b><span class="muted" style="font-size:12px">유튜브 [새암교회]비전센터</span></a>
          <a class="card" href="https://saechang888-code.github.io/berith/" target="_blank" rel="noopener" style="display:flex;flex-direction:column;gap:6px">${ico('book', '#1F5A3E')}<b style="color:var(--navy-deep)">베리트365</b><span class="muted" style="font-size:12px">매일 말씀 묵상</span></a>
        </div></section>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>오시는 길</h2>
        <img src="images/vision-center.jpg" alt="새암교회 비전센터 전경" style="border-radius:16px;aspect-ratio:16/9;object-fit:cover;width:100%">
        <div class="card" style="display:flex;flex-direction:column;gap:8px"><span style="font-weight:700;color:var(--navy-deep)">${esc(c.address)}</span><span class="muted" style="font-size:13px">전화 ${esc(c.phone)}</span></div>
        <div class="grid2"><a class="btn btn-navy" href="${esc(c.maps.naver)}" target="_blank" rel="noopener">네이버 지도</a><a class="btn btn-line" href="${esc(c.maps.kakao)}" target="_blank" rel="noopener">카카오맵</a></div>
        <a class="btn btn-line" href="tel:${c.phone.replace(/-/g, '')}">${ico('phone', '#12382A', 18)}교회로 전화하기</a>
      </section>
    </main>${tabbar('worship')}`;
  }

  // ---------- 헌금 안내 (계좌 이체) ----------
  function offeringCard() {
    const o = D.church && D.church.offering; if (!o) return '';
    return `<section id="offering" class="card pearl-dark" style="display:flex;flex-direction:column;gap:12px;color:#fff">
      <span class="eyebrow" style="color:#E9C97A">OFFERING</span>
      <b class="serif" style="font-size:19px">헌금 안내</b>
      <span style="font-size:13px;opacity:.85;line-height:1.6">각각 그 마음에 정한 대로 할 것이요 인색함으로나 억지로 하지 말지니 하나님은 즐겨 내는 자를 사랑하시느니라 (고후 9:7)</span>
      <div style="display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:14px;background:rgba(255,255,255,.1)">
        <span style="font-size:13px;opacity:.85">${esc(o.bank)}</span>
        <span class="serif" style="font-size:22px;font-weight:700;letter-spacing:.02em">${esc(o.account)}</span>
        <span style="font-size:13px;opacity:.85">예금주 ${esc(o.holder)}</span>
      </div>
      <button class="btn" data-copyacc style="background:#E9C97A;color:var(--navy-deep)">계좌번호 복사</button>
    </section>`;
  }

  // ---------- 함께하기: 기도 요청 · 새가족 · 문의 ----------
  const CARDS = [['prayer', '기도 요청', '함께 기도할 제목을 나눠 주세요.'], ['newcomer', '새가족 등록', '처음 오셨나요? 반갑습니다. 알려 주시면 연락드릴게요.'], ['ask', '궁금한 점', '교회에 묻고 싶은 것을 적어 주세요.']];
  function viewTogether() {
    const k = store.get('card', 'prayer'), card = CARDS.find(x => x[0] === k) || CARDS[0];
    return `<main>
      <div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">TOGETHER</span><h1>함께하기</h1><span class="muted" style="font-size:13px">기도 요청 · 새가족 등록 · 문의를 교회에 전해 드립니다.</span></div>
      <div class="chips" role="tablist" aria-label="카드 종류">${CARDS.map(([v, n]) => `<button class="chip${v === k ? ' on' : ''}" role="tab" aria-selected="${v === k}" data-card="${v}">${n}</button>`).join('')}</div>
      <div class="card" style="display:flex;flex-direction:column;gap:12px">
        <span class="muted" style="font-size:14px">${card[2]}</span>
        <div style="display:flex;flex-direction:column;gap:6px"><label class="lab" for="fname">이름</label><input type="text" id="fname" autocomplete="name"></div>
        <div style="display:flex;flex-direction:column;gap:6px"><label class="lab" for="ftel">연락처 (선택)</label><input type="tel" id="ftel" autocomplete="tel"></div>
        <div style="display:flex;flex-direction:column;gap:6px"><label class="lab" for="fmsg">${k === 'prayer' ? '기도 제목' : k === 'newcomer' ? '하고 싶은 말 (선택)' : '내용'}</label><textarea id="fmsg"></textarea></div>
        <button class="btn btn-navy" data-send>교회에 보내기</button>
        <span class="muted" style="font-size:12px;line-height:1.6">'교회에 보내기'를 누르면 문자·카카오톡 보내기 창이 열려요. 받는 사람에 교회(${esc(D.church ? D.church.phone : '')})나 담당 사역자를 고르시면 됩니다. 곧 앱 안에서 교회로 바로 전해지도록 바꿀 예정이에요.</span>
      </div>
      ${offeringCard()}
      <div class="card" style="display:flex;gap:14px;align-items:center">${ico('share', '#1F5A3E', 26)}<span style="flex:1;display:flex;flex-direction:column;gap:3px"><b style="color:var(--navy-deep)">친구·가족 초대하기</b><span class="muted" style="font-size:12px">새암교회 앱을 소중한 사람에게 보내 보세요.</span></span><button class="chip on" data-invite>보내기</button></div>
    </main>${tabbar('together')}`;
  }

  // ---------- 교회 소개 ----------
  function viewAbout() {
    const c = D.church; if (!c) return `<main></main>${tabbar('about')}`;
    return `<main>
      <div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">ABOUT</span><h1>교회 소개</h1><span class="muted" style="font-size:13px">${esc(c.denom)} ${esc(c.name)}</span></div>
      ${c.meaning ? `<section class="pearl-dark" style="display:flex;flex-direction:column;gap:12px;padding:22px 20px;border-radius:20px;color:#fff">
        <span class="eyebrow" style="color:#E9C97A">OUR NAME</span>
        <span class="serif" style="font-size:22px;font-weight:700;line-height:1.4">SEAM, 새암<br><span style="font-size:15px;font-weight:400;opacity:.85">이름에 담긴 뜻</span></span>
        ${c.meaning.map(m => `<div style="display:flex;flex-direction:column;gap:6px;padding-top:12px;border-top:1px solid rgba(255,255,255,.15)">
          <b style="color:#E9C97A;font-size:14px;letter-spacing:.04em">${esc(m.word)}</b>
          <p style="margin:0;font-size:14.5px;line-height:1.85;opacity:.95">${esc(m.text)}</p>
          ${m.verse ? `<p class="serif" style="margin:4px 0 0;font-size:13.5px;line-height:1.75;color:#E9C97A">${esc(m.verse)}</p>` : ''}</div>`).join('')}
      </section>` : ''}
      <section class="card" style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;gap:14px;align-items:center"><img src="images/pastor.jpg" alt="이재선 담임목사" width="72" height="88" style="border-radius:12px;object-fit:cover;width:72px;height:88px">
          <span style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">GREETING</span><b class="serif" style="font-size:18px;color:var(--navy-deep)">이재선 목사</b><span class="muted" style="font-size:12px">새암교회 담임목사</span></span></div>
        ${c.greeting.map((p, i) => `<p style="margin:0;line-height:1.85;font-size:15px;${i ? '' : 'font-weight:700;color:var(--navy-deep)'}">${esc(p)}</p>`).join('')}
      </section>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>새암의 비전</h2><span class="muted" style="font-size:13px">말씀과 성령의 능력으로 4×7의 비전을 이루는 생명의 공동체</span>
        <div class="grid2">${c.vision.map(v => `<div class="card" style="display:flex;flex-direction:column;gap:2px"><span class="serif" style="font-size:26px;font-weight:700;color:var(--gold-text)">${esc(v.big)}</span><span style="font-size:13px">${esc(v.text)}</span></div>`).join('')}</div>
        <div class="card" style="font-size:14px;line-height:1.8"><b style="color:var(--navy-deep)">D12 비전</b> — 모든 성도가 행복모임 리더가 되어 자신의 12명의 제자를 세우는 비전입니다.<br><b style="color:var(--navy-deep)">두 날개</b> — 영감 있는 대그룹 예배와 소그룹 셀가족 모임의 두 날개로 날아오릅니다.</div>
      </section>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>걸어온 길</h2>
        <div class="card" style="padding:6px 18px"><div class="list">${c.history.map(([d, t]) => `<div class="row" style="min-height:48px"><span style="width:96px;flex-shrink:0;font-size:12px;color:var(--gold-text);font-weight:700">${esc(d)}</span><span style="font-size:14px">${esc(t)}</span></div>`).join('')}</div></div></section>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>교회학교</h2><span class="muted" style="font-size:13px">하나님의 언약의 자녀를 함께 양육하는 교육 공동체 · 주일 오전 11시</span>
        <div class="grid2" style="grid-template-columns:repeat(3,1fr)">${c.school.map(s => `<div class="card" style="text-align:center;padding:14px 8px"><b style="color:var(--navy-deep)">${esc(s.name)}</b><div class="muted" style="font-size:11px;margin-top:4px">${esc(s.verse)}</div></div>`).join('')}</div></section>
      <section style="display:flex;flex-direction:column;gap:10px"><h2>선교와 섬김</h2>
        <div class="card" style="display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.7"><span><b style="color:var(--navy-deep)">국내</b> · ${c.mission.domestic.map(esc).join(' · ')}</span><span><b style="color:var(--navy-deep)">해외</b> · ${c.mission.world.map(esc).join(' · ')}</span><span class="muted" style="font-size:12px">선교사님들의 안전을 위해 이름은 싣지 않았습니다.</span></div></section>
      <div class="list">${c.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener"><span class="grow"><span style="font-size:15px;color:var(--navy-deep)">${esc(l.name)}</span></span>${ico('ext', '#4A5263', 16)}</a>`).join('')}</div>
    </main>${tabbar('about')}`;
  }

  // ---------- 영상 재생 ----------
  function play(box, vid) {
    box.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(vid)}?autoplay=1&playsinline=1&rel=0" title="설교 영상" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  }
  async function invite() {
    const data = { title: '새암교회', text: '새암교회 앱으로 초대합니다 — 주일 설교, 예배 안내, 교회 소식을 한곳에서 보세요.', url: APP_URL };
    try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(data.text + ' ' + data.url); toast('초대 글과 주소를 복사했어요. 원하는 곳에 붙여 넣으세요.'); } catch (e) { toast(APP_URL); }
  }
  async function sendCard() {
    const k = store.get('card', 'prayer'), card = CARDS.find(x => x[0] === k) || CARDS[0];
    const name = document.getElementById('fname').value.trim(), tel = document.getElementById('ftel').value.trim(), msg = document.getElementById('fmsg').value.trim();
    if (!name || (k !== 'newcomer' && !msg)) { toast('이름과 내용을 적어 주세요'); return; }
    const text = `[새암교회 앱 · ${card[1]}]\n이름: ${name}${tel ? `\n연락처: ${tel}` : ''}${msg ? `\n${msg}` : ''}`;
    try { if (navigator.share) { await navigator.share({ title: card[1], text }); toast('보내기 창을 열었어요'); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); toast('내용을 복사했어요. 문자나 카카오톡에 붙여 넣어 보내 주세요.'); } catch (e) { location.href = 'sms:' + (D.church ? D.church.phone.replace(/-/g, '') : '') + '?body=' + encodeURIComponent(text); }
  }

  // ---------- 길 찾기 ----------
  function route() {
    const a = location.hash.replace(/^#\/?/, '').split('/')[0];
    $app.innerHTML = a === 'give' ? `<main><div style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">OFFERING</span><h1>헌금</h1></div>${offeringCard()}</main>${tabbar('together')}` : a === 'sermons' ? viewSermons() : a === 'worship' ? viewWorship() : a === 'together' ? viewTogether() : a === 'about' ? viewAbout() : viewHome();
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-play],[data-cur],[data-card],[data-invite],[data-send],[data-copyacc]');
    if (!el) return;
    if (el.hasAttribute('data-copyacc')) {
      const o = D.church.offering, txt = `${o.bank} ${o.account} ${o.holder}`;
      (navigator.clipboard ? navigator.clipboard.writeText(o.account) : Promise.reject()).then(() => toast('계좌번호를 복사했어요')).catch(() => toast(txt));
      return;
    }
    if (el.dataset.play) { play(document.getElementById(el.dataset.box), el.dataset.play); return; }
    if (el.dataset.cur) { e.preventDefault(); store.set('cur', el.dataset.cur); route(); return; }
    if (el.dataset.card) { store.set('card', el.dataset.card); route(); return; }
    if (el.hasAttribute('data-invite')) { invite(); return; }
    if (el.hasAttribute('data-send')) sendCard();
  });
  document.addEventListener('input', e => {   // 한글 입력이 끊기지 않게 화면을 다시 그리지 않고 목록만 거른다
    if (e.target.id !== 'sq') return;
    const q = e.target.value.trim(); store.set('q', q);
    document.querySelectorAll('[data-cur]').forEach(a => { a.style.display = !q || a.dataset.title.includes(q) ? '' : 'none'; });
  });
  window.addEventListener('hashchange', route);

  const bust = '?d=' + new Date().toISOString().slice(0, 10);
  Promise.all(['church', 'sermons'].map(n => fetch('data/' + n + '.json' + bust).then(r => r.ok ? r.json() : null).catch(() => null)))
    .then(([c, s]) => { D.church = c; D.sermons = s || []; route(); });
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
