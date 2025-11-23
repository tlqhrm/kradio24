import { M3UEntry, RadioStation } from '@/types/radio';

/**
 * M3U 파일 내용을 파싱하여 M3UEntry 배열로 변환
 * @param content M3U 파일 내용 (문자열)
 * @returns M3UEntry 배열
 */
export function parseM3U(content: string): M3UEntry[] {
  const lines = content.split('\n').map(line => line.trim());
  const entries: M3UEntry[] = [];

  let currentTitle = '';
  let currentDuration = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 빈 줄 건너뛰기
    if (!line) continue;

    // #EXTM3U 헤더 건너뛰기
    if (line.startsWith('#EXTM3U')) continue;

    // #EXTINF 파싱: #EXTINF:duration,title
    if (line.startsWith('#EXTINF:')) {
      const match = line.match(/#EXTINF:(-?\d+),(.+)/);
      if (match) {
        currentDuration = parseInt(match[1], 10);
        currentTitle = match[2].trim();
      }
    }
    // URL 라인
    else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentTitle) {
        entries.push({
          title: currentTitle,
          url: line,
          duration: currentDuration,
        });
      }
      // 다음 엔트리를 위해 리셋
      currentTitle = '';
      currentDuration = -1;
    }
  }

  return entries;
}

/**
 * M3UEntry를 RadioStation으로 변환
 * @param entry M3UEntry 객체
 * @param index 인덱스 (ID 생성용)
 * @returns RadioStation 객체
 */
export function m3uEntryToStation(entry: M3UEntry, index: number): RadioStation {
  // 스테이션 이름에서 카테고리 추출 (예: "KBS 1라디오" -> "KBS")
  const categoryMatch = entry.title.match(/^([A-Z]+)\s/);
  const category = categoryMatch ? categoryMatch[1] : 'OTHER';

  // 장르 추론 (URL 또는 이름 기반)
  let genre = 'Radio';
  if (entry.title.includes('FM') || entry.title.includes('음악')) {
    genre = 'Music';
  } else if (entry.title.includes('교통')) {
    genre = 'Traffic';
  } else if (entry.title.includes('뉴스')) {
    genre = 'News';
  } else if (entry.title.includes('교육')) {
    genre = 'Education';
  } else if (entry.title.includes('종교') || /불교|기독|천주교|가톨릭/.test(entry.title)) {
    genre = 'Religion';
  }

  return {
    id: `station-${index}`,
    name: entry.title,
    streamUrl: entry.url,
    genre,
    category,
    isFavorite: false,
    addedAt: new Date(),
  };
}

/**
 * M3U 파일 내용을 파싱하여 RadioStation 배열로 변환
 * @param content M3U 파일 내용
 * @returns RadioStation 배열
 */
export function parseM3UToStations(content: string): RadioStation[] {
  const entries = parseM3U(content);
  return entries.map((entry, index) => m3uEntryToStation(entry, index));
}

/**
 * RadioStation 배열을 M3U 형식 문자열로 변환
 * @param stations RadioStation 배열
 * @returns M3U 형식 문자열
 */
export function stationsToM3U(stations: RadioStation[]): string {
  let m3u = '#EXTM3U\n';

  for (const station of stations) {
    m3u += `#EXTINF:-1,${station.name}\n`;
    m3u += `${station.streamUrl}\n`;
  }

  return m3u;
}