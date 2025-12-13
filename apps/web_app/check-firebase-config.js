// 빌드된 파일에서 Firebase 설정 확인
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const assetsPath = path.join(distPath, 'assets');

if (!fs.existsSync(assetsPath)) {
  console.log('❌ dist/assets 폴더가 없습니다. 빌드를 먼저 실행하세요.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));

for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(assetsPath, file), 'utf-8');
  if (content.includes('AIzaSy')) {
    const match = content.match(/AIzaSy[^"']{20,}/);
    if (match) {
      console.log(`✅ Firebase API 키 발견: ${match[0].substring(0, 20)}...`);
      console.log(`   파일: ${file}`);
      process.exit(0);
    }
  }
}

console.log('❌ Firebase API 키를 찾을 수 없습니다.');
process.exit(1);
