import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_BASE = 'https://api.quran.com/api/v4';
const TRANSLATION_RESOURCE_ID = 163; // King Fahad Quran Complex (Thai) - or check trusted resource
const AUDIO_EDITION = 'ar.alafasy'; // Standard
const OUTPUT_DIR = path.join(__dirname, '../src/content/tafsir/tafsir-sadi');

// Helper to delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSurahData(surahNumber) {
    console.log(`Fetching data for Surah ${surahNumber}...`);

    try {
        // 1. Fetch Surah Info (Name, etc)
        const chapterRes = await fetch(`${API_BASE}/chapters/${surahNumber}`);
        const chapterData = await chapterRes.json();
        const chapter = chapterData.chapter;

        // 2. Fetch Verses (Arabic Uthmani) - Using Query for verified text
        // Keep using quran.com for Uthmani as it's reliable for standard text
        const versesResFull = await fetch(`${API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}&per_page=300`);
        const versesDataFull = await versesResFull.json();
        const versesList = versesDataFull.verses;

        // 3. Fetch Translations (Thai) from ALQURAN.CLOUD
        // Documentation: http://api.alquran.cloud/v1/surah/1/th.thai
        const thRes = await fetch(`http://api.alquran.cloud/v1/surah/${surahNumber}/th.thai`);
        const thData = await thRes.json();

        let thaiVerses = [];
        if (thData.status === 'OK' && thData.data && thData.data.ayahs) {
            thaiVerses = thData.data.ayahs;
        } else {
            console.error('Failed to fetch Thai translation from alquran.cloud');
            // Fallback or empty?
        }

        // 4. Fetch Audio (Mishary Alafasy) - keep existing
        const audioRes = await fetch(`${API_BASE}/quran/recitations/7?chapter_number=${surahNumber}`);
        const audioData = await audioRes.json();
        const audioFiles = audioData.audio_files;

        // Construct Ayahs Array
        const ayahs = [];

        for (let i = 0; i < versesList.length; i++) {
            const v = versesList[i]; // v.verse_key "1:1"
            // quran.com verse_key matches? 
            // alquran.cloud ayahs have `numberInSurah`

            const ayahNum = i + 1;

            // Find Thai text
            const thaiAyah = thaiVerses.find(t => t.numberInSurah === ayahNum);

            // Find Audio
            const a = audioFiles.find(af => af.verse_key === v.verse_key);

            ayahs.push({
                ayahNumber: ayahNum,
                arabic: v.text_uthmani,
                thai: thaiAyah ? thaiAyah.text : '',
                audio: a ? `https://verses.quran.com/${a.url}` : '',
            });
        }

        return {
            surahNumber: chapter.id,
            nameArabic: chapter.name_arabic,
            nameThai: chapter.name_complex,
            ayahs: ayahs
        };

    } catch (e) {
        console.error(`Error fetching Surah ${surahNumber}:`, e);
        return null;
    }
}

// Importing local data for Thai names
// Since this is ES module, we can import valid TS if we use a loader, OR just copy the array in here to be safe and simple.
// I'll copy the surah names map for simplicity.
const THAI_NAMES = {
    1: 'อัล-ฟาติหะฮฺ', 2: 'อัล-บะเกาะเราะฮฺ', 3: 'อาลิอิมรอน', 4: 'อันนิสาอ์', 5: 'อัลมาอิดะฮฺ',
    6: 'อัลอันอาม', 7: 'อัลอะอฺรอฟ', 8: 'อัลอันฟาล', 9: 'อัตเตาบะฮฺ', 10: 'ยูนุส',
    // ... I will implement a text list or similar, or just fetch first 5 for testing? 
    // The user wants ALL 114.
    // I can read `src/data/surahs.ts` file text and parse it roughly.
};
// Actually, better to read the file.
function loadSurahNames() {
    const p = path.join(__dirname, '../src/data/surahs.ts');
    const content = fs.readFileSync(p, 'utf-8');
    // Regex parse: { number: (\d+), .*? nameThai: '(.*?)',
    const map = {};
    const regex = /number:\s*(\d+).*?nameThai:\s*'(.*?)'/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        map[parseInt(match[1])] = match[2];
    }
    return map;
}

function createMdocContent(data, thaiName) {
    const slug = String(data.surahNumber).padStart(3, '0');
    // Escape single quotes in text
    const escape = (str) => (str ? str.replace(/'/g, "''") : '');

    let mdoc = `---
title: '${slug}'
surahNumber: ${data.surahNumber}
nameThai: '${thaiName}'
nameArabic: '${data.nameArabic}'
ayahs:
`;

    data.ayahs.forEach(a => {
        mdoc += `  - ayahNumber: ${a.ayahNumber}
    arabic: '${escape(a.arabic)}'
    thai: '${escape(a.thai)}'
    audio: '${a.audio}'
`;
    });

    mdoc += `---
`;
    return mdoc;
}

async function main() {
    const surahNames = loadSurahNames();

    // Create folders
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Loop 1 to 114
    for (let i = 1; i <= 114; i++) {
        const data = await fetchSurahData(i);
        if (data) {
            const thaiName = surahNames[i] || data.nameThai;
            const content = createMdocContent(data, thaiName);

            const folder = path.join(OUTPUT_DIR, String(i).padStart(3, '0'));
            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

            fs.writeFileSync(path.join(folder, 'index.mdoc'), content);
            console.log(`Saved Surah ${i} (${thaiName})`);
        }
        await sleep(500); // Rate limit kindness
    }
}

main();
