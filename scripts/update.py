# 새암교회 앱 설교 목록 갱신 — 깃허브 액션이 주일마다 돌린다 (사람이 돌려도 됨: python scripts/update.py)
# 교회 유튜브(@seamvision)에서 '주일예배' 영상을 찾아 data/sermons.json 에 최신순으로 쓴다.
import json, re, os, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'data', 'sermons.json')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9'}

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode('utf-8', 'replace')

def oembed(vid):
    try:
        return json.loads(get('https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote('https://youtu.be/' + vid)))['title']
    except Exception:
        return ''

if __name__ == '__main__':
    old = {s['video']: s for s in (json.load(open(PATH, encoding='utf-8')) if os.path.exists(PATH) else [])}
    h = get('https://www.youtube.com/@seamvision/videos')
    for vid in list(dict.fromkeys(re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', h)))[:40]:
        if vid in old: continue
        p = [s.strip() for s in oembed(vid).split('|')]   # 제목 | 용인새암교회 26년 10월 25일 주일예배 | 이재선 목사
        d = re.search(r'(\d+)년 (\d+)월 (\d+)일', p[1]) if len(p) >= 2 and '주일예배' in p[1] else None
        if not d: continue
        old[vid] = {'video': vid, 'title': p[0], 'date': f'20{int(d.group(1)):02d}-{int(d.group(2)):02d}-{int(d.group(3)):02d}',
                    'preacher': p[2] if len(p) > 2 else ''}
    out = sorted(old.values(), key=lambda s: s['date'], reverse=True)
    json.dump(out, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('설교', len(out), '편 · 최신:', out[0]['title'] if out else '-')

    # 예배 실황: 유튜브 '라이브' 탭의 지난 생방송 (제목 예: [새암교회]비전센터님의 라이브 방송 [26.11.01])
    LIVE = os.path.join(ROOT, 'data', 'live.json')
    lives = {v['video']: v for v in (json.load(open(LIVE, encoding='utf-8')) if os.path.exists(LIVE) else [])}
    h = get('https://www.youtube.com/@seamvision/streams')
    for vid in list(dict.fromkeys(re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', h)))[:15]:
        if vid in lives: continue
        title = oembed(vid)
        d = re.search(r'(\d{2})\.\s*(\d{1,2})\.\s*(\d{1,2})', title)
        if d:
            lives[vid] = {'video': vid, 'title': title, 'date': f'20{d.group(1)}-{int(d.group(2)):02d}-{int(d.group(3)):02d}'}
    lv = sorted(lives.values(), key=lambda s: s['date'], reverse=True)
    json.dump(lv, open(LIVE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('실황', len(lv), '편 · 최신:', lv[0]['date'] if lv else '-')
