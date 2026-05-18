/**
 * Тесты для gpybyte
 */

const { Converter, Unit, formatSize, parseSize, bestFormat, getUnits, getUnitInfo } = require('../src/index.js');

console.log('\n╔════════════════════════════════════════════╗');
console.log('║     🧪 ТЕСТИРОВАНИЕ GPYBYTE v0.1.0      ║');
console.log('╚════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`   ✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`   ❌ ${name}: ${error.message}`);
        failed++;
    }
}

console.log('📋 Запуск тестов...\n');

// ========== Десятичные единицы ==========
test('1 GB = 1000 MB', () => {
    const result = Converter.convert(1, Unit.GB, Unit.MB);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

test('1 TB = 1000 GB', () => {
    const result = Converter.convert(1, Unit.TB, Unit.GB);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

test('1 MB = 1000 KB', () => {
    const result = Converter.convert(1, Unit.MB, Unit.KB);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

// ========== Двоичные единицы ==========
test('1 GiB = 1024 MiB', () => {
    const result = Converter.convert(1, Unit.GiB, Unit.MiB);
    if (result !== 1024) throw new Error(`Ожидалось 1024, получено ${result}`);
});

test('1 TiB = 1024 GiB', () => {
    const result = Converter.convert(1, Unit.TiB, Unit.GiB);
    if (result !== 1024) throw new Error(`Ожидалось 1024, получено ${result}`);
});

test('1 MiB = 1024 KiB', () => {
    const result = Converter.convert(1, Unit.MiB, Unit.KiB);
    if (result !== 1024) throw new Error(`Ожидалось 1024, получено ${result}`);
});

// ========== Стандарт JPYByte ==========
test('1 JPY = 1000 GPY', () => {
    const result = Converter.convert(1, Unit.JPY, Unit.GPY);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

test('1 HPY = 1000 IPY', () => {
    const result = Converter.convert(1, Unit.HPY, Unit.IPY);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

test('1 JPY = 1000 GPY', () => {
    const result = Converter.convert(1, Unit.JPY, Unit.GPY);
    if (result !== 1000) throw new Error(`Ожидалось 1000, получено ${result}`);
});

test('1 IPY = 2^90 байт', () => {
    const result = Converter.toBytes(1, Unit.IPY);
    const expected = 2n ** 90n;
    if (result !== expected) throw new Error(`Ожидалось ${expected}, получено ${result}`);
});

// ========== Форматирование ==========
test('formatSize(1234567890) = "1.23 GB"', () => {
    const result = formatSize(1234567890);
    if (result !== '1.23 GB') throw new Error(`Ожидалось "1.23 GB", получено "${result}"`);
});

test('formatSize с binary = "1.15 GiB"', () => {
    const result = formatSize(1234567890, { binary: true });
    if (result !== '1.15 GiB') throw new Error(`Ожидалось "1.15 GiB", получено "${result}"`);
});

test('formatSize с precision = 4', () => {
    const result = formatSize(1234567890, { precision: 4 });
    if (result !== '1.2346 GB') throw new Error(`Ожидалось "1.2346 GB", получено "${result}"`);
});

test('formatSize с full name', () => {
    const result = formatSize(1024, { useFullName: true });
    if (!result.includes('килобайта')) throw new Error(`Ожидалось "килобайта", получено "${result}"`);
});

// ========== Парсинг ==========
test('parseSize("2.5 MB") = 2500000', () => {
    const result = parseSize('2.5 MB');
    if (result !== 2500000) throw new Error(`Ожидалось 2500000, получено ${result}`);
});

test('parseSize("1 KiB") = 1024', () => {
    const result = parseSize('1 KiB');
    if (result !== 1024) throw new Error(`Ожидалось 1024, получено ${result}`);
});

test('parseSize("5 гигабайт") = 5000000000', () => {
    const result = parseSize('5 гигабайт');
    if (result !== 5000000000) throw new Error(`Ожидалось 5000000000, получено ${result}`);
});

test('parseSize("10 GPY") работает', () => {
    const result = parseSize('10 GPY');
    const expected = 10 * Converter.convert(1, Unit.GPY, Unit.B);
    if (Math.abs(result - expected) > 0.001) throw new Error(`Ожидалось ~${expected}, получено ${result}`);
});

// ========== Автоформатирование ==========
test('bestFormat(1234567890) = "1.23 GB"', () => {
    const result = bestFormat(1234567890);
    if (result !== '1.23 GB') throw new Error(`Ожидалось "1.23 GB", получено "${result}"`);
});

// ========== Количество единиц ==========
test('Количество единиц = 21', () => {
    const units = getUnits();
    if (units.length !== 21) throw new Error(`Ожидалось 21, получено ${units.length}`);
});

// ========== Информация о единицах ==========
test('Информация о GB: десятичная', () => {
    const info = getUnitInfo(Unit.GB);
    if (info.type !== 'десятичная') throw new Error(`Ожидалось "десятичная", получено "${info.type}"`);
});

test('Информация о GiB: двоичная', () => {
    const info = getUnitInfo(Unit.GiB);
    if (info.type !== 'двоичная') throw new Error(`Ожидалось "двоичная", получено "${info.type}"`);
});

test('Информация о GPY: стандарт JPYByte', () => {
    const info = getUnitInfo(Unit.GPY);
    if (info.type !== 'стандарт JPYByte') throw new Error(`Ожидалось "стандарт JPYByte", получено "${info.type}"`);
});

// ========== Итоги ==========
console.log('\n╔════════════════════════════════════════════╗');
console.log(`║   ✅ Пройдено: ${passed}   ❌ Не пройдено: ${failed}     ║`);
console.log('╚════════════════════════════════════════════╝\n');

if (failed === 0) {
    console.log('🎉 ПОЗДРАВЛЯЮ! ВСЕ ТЕСТЫ ПРОЙДЕНЫ! 🎉\n');
    process.exit(0);
} else {
    console.log('⚠️ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ! ⚠️\n');
    process.exit(1);
}
