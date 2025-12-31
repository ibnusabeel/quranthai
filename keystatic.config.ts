import { config, fields, collection } from '@keystatic/core';
import { SURAHS } from './src/data/surahs';

// Helper to pad numbers (e.g., 1 -> "001")
const pad = (num: number) => num.toString().padStart(3, '0');

// Generate Collections for a specific Book
const createBookCollections = (bookSlug: string, bookLabel: string) => {
    const collections: Record<string, any> = {};

    SURAHS.forEach(surah => {
        const surahKey = `${bookSlug}_${pad(surah.number)}`;
        const folderName = `${pad(surah.number)}-${surah.nameArabic.replace(/ /g, '-')}`; // Simplistic folder naming
        // Better folder naming: 001-al-fatiha (using a simple mapping or just number)
        // Let's use 001-{number} to keep it simple and safe, or mapping if available. 
        // Since we don't have English slug in SURAHS yet, checking data... 
        // The previous prompt SURAHS didn't have english slug. 
        // Let's use just number to be safe: src/content/tafsir/tafsir-sadi/001/*
        // User asked for "separate folder", numbering is best for sorting.

        // Update: Using generic path or we can use the Thai name sanitized? 
        // "001" is safest.

        collections[surahKey] = collection({
            label: `${surah.number}. ${surah.nameThai} (${surah.nameArabic})`,
            slugField: 'title',
            path: `src/content/tafsir/${bookSlug}/${pad(surah.number)}/*`,
            format: { contentField: 'content' },
            entryLayout: 'content',
            columns: ['ayahStart', 'ayahEnd', 'title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'ชื่อไฟล์ / อ้างอิง (Reference)',
                        description: 'เช่น part-1'
                    }
                }),
                // Hidden/Read-only Surah Number
                surahNumber: fields.integer({
                    label: 'Surah Number (Auto)',
                    defaultValue: surah.number,
                    description: 'ห้ามแก้ไข'
                }),
                ayahStart: fields.integer({
                    label: 'อายะฮ์เริ่มต้น',
                    validation: { min: 1 }
                }),
                ayahEnd: fields.integer({
                    label: 'อายะฮ์สิ้นสุด',
                    validation: { min: 1 }
                }),
                // [NEW] Individual Ayah Texts
                ayahs: fields.array(
                    fields.object({
                        ayahNumber: fields.integer({ label: 'อายะฮ์ที่' }),
                        arabic: fields.text({ label: 'ตัวบทอาหรับ (Arabic)', multiline: true }),
                        thai: fields.text({ label: 'คำแปลไทย (Thai)', multiline: true }),
                    }),
                    {
                        label: 'รายการอายะฮ์ (Ayahs)',
                        itemLabel: (props) => `อายะฮ์ที่ ${props.fields.ayahNumber.value || '-'}`,
                    }
                ),
                content: fields.document({
                    label: 'เนื้อหาตัฟซีร',
                    formatting: true,
                    dividers: true,
                    links: true,
                    images: true,
                }),
            },
        });
    });

    return collections;
};

// Generate collections
const sadiCollections = createBookCollections('tafsir-sadi', 'ตัฟซีร อัส-สะอฺดีย์');
const ibnKasirCollections = createBookCollections('tafsir-ibnkasir', 'ตัฟซีร อิบนุกาซีร');

export default config({
    storage: {
        kind: 'local',
    },
    ui: {
        navigation: {
            'ข้อมูลหลัก': ['books'],
            '📖 ตัฟซีร อัส-สะอฺดีย์': Object.keys(sadiCollections),
            // '📖 ตัฟซีร อิบนุกาซีร': Object.keys(ibnKasirCollections),
        }
    },
    collections: {
        books: collection({
            label: '📚 ข้อมูลหนังสือตัฟซีร',
            slugField: 'title',
            path: 'src/content/books/*',
            format: { contentField: 'description' },
            schema: {
                title: fields.slug({ name: { label: 'ชื่อหนังสือ (ภาษาอังกฤษ/Slug)' } }),
                titleThai: fields.text({ label: 'ชื่อหนังสือ (ภาษาไทย)' }),
                titleArabic: fields.text({ label: 'ชื่อหนังสือ (ภาษาอาหรับ)', multiline: false }),
                author: fields.text({ label: 'ผู้แต่ง' }),
                authorArabic: fields.text({ label: 'ผู้แต่ง (ภาษาอาหรับ)', multiline: false }),
                description: fields.document({
                    label: 'รายละเอียดโดยย่อ',
                    formatting: true,
                    dividers: true,
                    links: true,
                }),
                coverImage: fields.text({ label: 'URL รูปหน้าปก (ถ้ามี)' }),
            },
        }),
        ...sadiCollections,
        ...ibnKasirCollections,
    },
});
