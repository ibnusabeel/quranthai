#!/usr/bin/env node

/**
 * Script สร้างไฟล์ Tafsir .mdoc
 * ใช้งาน: node scripts/create-tafsir.js [input-file.json]
 */

const fs = require('fs');
const path = require('path');

// ฟังก์ชันสร้าง YAML frontmatter ที่ถูกต้อง
function createYAMLFrontmatter(data) {
    let yaml = '---\n';
    yaml += `title: '${data.title || ''}'\n`;
    yaml += `surahNumber: ${data.surahNumber}\n`;
    yaml += `ayahStart: ${data.ayahStart}\n`;
    yaml += `ayahEnd: ${data.ayahEnd}\n`;

    // ถ้ามีข้อมูล ayahs ให้สร้าง array
    if (data.ayahs && data.ayahs.length > 0) {
        yaml += 'ayahs:\n';
        data.ayahs.forEach(ayah => {
            yaml += `  - ayahNumber: ${ayah.ayahNumber}\n`;
            yaml += `    arabic: '${ayah.arabic}'\n`;
            yaml += `    thai: ${ayah.thai}\n`;
        });
    }

    yaml += '---\n';
    return yaml;
}

// ฟังก์ชันสร้างไฟล์ .mdoc
function createMdocFile(data) {
    // สร้าง path
    const surahFolder = String(data.surahNumber).padStart(3, '0');
    const dirPath = path.join(__dirname, '..', 'src', 'content', 'tafsir', 'tafsir-sadi', surahFolder);

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ สร้างโฟลเดอร์: ${dirPath}`);
    }

    // สร้างชื่อไฟล์
    const fileName = data.fileName || `${data.ayahStart}-${data.ayahEnd}.mdoc`;
    const filePath = path.join(dirPath, fileName);

    // ตรวจสอบว่าไฟล์มีอยู่แล้วหรือไม่
    if (fs.existsSync(filePath) && !data.overwrite) {
        console.error(`✗ ไฟล์มีอยู่แล้ว: ${filePath}`);
        console.log('  ใช้ --overwrite เพื่อเขียนทับ');
        return false;
    }

    // สร้างเนื้อหาไฟล์
    let content = createYAMLFrontmatter(data);
    content += '\n';
    content += data.content || '';

    // เขียนไฟล์
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ สร้างไฟล์สำเร็จ: ${filePath}`);
    return true;
}

// Main function
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('การใช้งาน:');
        console.log('  node scripts/create-tafsir.js input.json');
        console.log('  node scripts/create-tafsir.js input.json --overwrite');
        console.log('\nหรือสร้างหลายไฟล์พร้อมกัน:');
        console.log('  node scripts/create-tafsir.js inputs/*.json');
        process.exit(1);
    }

    const overwrite = args.includes('--overwrite');
    const inputFiles = args.filter(arg => !arg.startsWith('--'));

    inputFiles.forEach(inputFile => {
        try {
            console.log(`\n📝 กำลังประมวลผล: ${inputFile}`);

            // อ่านไฟล์ JSON
            const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
            data.overwrite = overwrite;

            // สร้างไฟล์
            createMdocFile(data);

        } catch (error) {
            console.error(`✗ เกิดข้อผิดพลาด: ${error.message}`);
        }
    });

    console.log('\n✓ เสร็จสิ้น!');
}

// รันโปรแกรม
main();
