import { config, fields, collection } from '@keystatic/core';

// Helper to define a Book Collection
const createBookCollection = (bookSlug: string, bookLabel: string) => {
    return collection({
        label: bookLabel,
        slugField: 'title',
        // Stores each Surah as a folder: src/content/tafsir/tafsir-sadi/001/index.mdoc
        path: `src/content/tafsir/${bookSlug}/*/index`,
        format: { contentField: 'content' },
        entryLayout: 'form',
        columns: ['surahNumber', 'nameThai', 'nameArabic'],
        schema: {
            title: fields.slug({
                name: {
                    label: 'รหัสสูเราะห์ (เช่น 001, 018)',
                    description: 'ต้องเป็นตัวเลข 3 หลักเสมอ เพื่อให้เรียงลำดับถูกต้อง เช่น 001, 002, ..., 114'
                }
            }),
            // Surah Info
            surahNumber: fields.integer({
                label: 'ลำดับที่ (Surah Number)',
                validation: { min: 1, max: 114 },
                description: 'ลำดับที่ของสูเราะห์ในอัลกุรอาน'
            }),
            nameThai: fields.text({
                label: 'ชื่อสูเราะห์ (ภาษาไทย)',
                validation: { length: { min: 1 } },
                description: 'เช่น: อัล-ฟาติหะฮฺ'
            }),
            nameArabic: fields.text({
                label: 'ชื่อสูเราะห์ (ภาษาอาหรับ)',
                validation: { length: { min: 1 } },
                description: 'เช่น: الفاتحة'
            }),
            content: fields.document({
                label: 'บทนำ / เนื้อหาภาพรวม',
                formatting: true,
                dividers: true,
                links: true,
                images: true,
            }),

            // Individual Ayah Texts with Audio & Description
            ayahs: fields.array(
                fields.object({
                    ayahNumber: fields.integer({ label: 'อายะฮ์ที่ (No.)' }),
                    arabic: fields.text({ label: 'ตัวบทกุรอ่าน (อาหรับ)', multiline: true }),
                    thai: fields.text({ label: 'คำแปล (ไทย)', multiline: true }),
                    audio: fields.text({ label: 'ลิงก์เสียงอ่าน (Audio URL)', description: 'รูปแบบ: https://...mp3' }),
                    tafsirRange: fields.text({ label: 'ช่วงอายะห์ที่', description: 'รูปแบบ: 1-5 เป็นต้น' }),
                    description: fields.document({
                        label: 'เนื้อหาตัฟซีร (คำอธิบาย)',
                        formatting: true,
                        dividers: true,
                        links: true,
                    }),
                }),
                {
                    label: 'รายการอายะฮ์ (Ayahs)',
                    itemLabel: (props) => `อายะฮ์ที่ ${props.fields.ayahNumber.value || '-'}`,
                }
            ),
        },
    });
};

export default config({
    storage: {
        kind: 'local',
    },
    ui: {
        navigation: {
            'ข้อมูลหลัก': ['books'],
            '📖 หนังสือตัฟซีร': ['tafsir-sadi', 'tafsir-ibnkasir'],
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
                    images: true,
                }),
                coverImage: fields.text({ label: 'URL รูปหน้าปก (ถ้ามี)' }),
            },
        }),
        'tafsir-sadi': createBookCollection('tafsir-sadi', 'ตัฟซีร อัส-สะอฺดีย์'),
        'tafsir-ibnkasir': createBookCollection('tafsir-ibnkasir', 'ตัฟซีร อิบนุกาซีร'),
    },
});
