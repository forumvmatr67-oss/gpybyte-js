#!/usr/bin/env node

/**
 * gpybyte - командная строка
 * Версия: 0.1.0
 */

const { Converter, Unit, formatSize, parseSize, getUnits, getUnitInfo } = require('./index.js');

const args = process.argv.slice(2);

function help() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                      gpybyte v0.1.0                         ║
║         Конвертер единиц памяти (стандарт JPYByte)          ║
╚══════════════════════════════════════════════════════════════╝

Использование:
  gpybyte convert <число> <из> <в>     Конвертация
  gpybyte format <число> [опции]       Форматирование
  gpybyte parse <строка>               Парсинг строки
  gpybyte list                         Список единиц
  gpybyte version                      Версия
  gpybyte help                         Помощь

Примеры:
  gpybyte convert 1 GB MB
  gpybyte convert 1 GiB MiB
  gpybyte convert 1 GPY JPY
  gpybyte format 1234567890
  gpybyte format 1234567890 --binary
  gpybyte format 1234567890 --precision 4
  gpybyte parse "2.5 MB"
  gpybyte parse "10 GPY"
  gpybyte parse "5 гигабайт"

Опции format:
  --binary            Использовать двоичные единицы (KiB, MiB...)
  --precision <число> Количество знаков после запятой (по умолчанию 2)
  --full-name         Использовать полные названия (килобайт вместо KB)

Доступные единицы:
  Десятичные: B, KB, MB, GB, TB, PB, EB, ZB, YB
  Двоичные:   KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB
  JPYByte:    IPY, HPY, GPY, JPY
`);
}

function version() {
    console.log('gpybyte 0.1.0 - поддержка стандарта JPYByte');
    console.log('Автор: forumvmatr67-oss');
    console.log('Лицензия: MIT');
}

function list() {
    console.log('\n📊 Доступные единицы измерения:');
    console.log('='.repeat(50));
    console.log(' Единица     Тип                Название');
    console.log('='.repeat(50));
    
    for (const unit of getUnits()) {
        const info = getUnitInfo(unit);
        const symbol = unit.padEnd(10);
        const type = info.type.padEnd(18);
        console.log(` ${symbol} ${type} ${info.name}`);
    }
    
    console.log('='.repeat(50));
    console.log(`\n📐 Всего единиц: ${getUnits().length}`);
    console.log('\n📐 Стандарт JPYByte для ГИС:');
    console.log('  • IPY (айпибайт) = 2^90 байт');
    console.log('  • HPY (эйчпибайт) = 1000 IPY');
    console.log('  • GPY (джипибайт) = 1000 HPY');
    console.log('  • JPY (джейпибайт) = 1000 GPY\n');
}

if (args.length === 0) {
    help();
    process.exit(0);
}

const cmd = args[0].toLowerCase();

switch (cmd) {
    case 'convert':
        if (args.length < 4) {
            console.log('❌ Ошибка: convert <число> <из> <в>');
            console.log('Пример: gpybyte convert 1 GB MB');
            process.exit(1);
        }
        const val = parseFloat(args[1]);
        const from = args[2].toUpperCase();
        const to = args[3].toUpperCase();
        try {
            const result = Converter.convert(val, from, to);
            console.log(`\n✅ ${val} ${from} = ${result} ${to}\n`);
        } catch(e) {
            console.log('❌ Ошибка: неизвестная единица измерения');
            console.log('Доступные единицы: B, KB, MB, GB, TB, PB, EB, ZB, YB, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB, IPY, HPY, GPY, JPY');
        }
        break;
        
    case 'format':
        if (args.length < 2) {
            console.log('❌ Ошибка: format <число>');
            console.log('Пример: gpybyte format 1234567890');
            process.exit(1);
        }
        const num = parseFloat(args[1]);
        const opts = { binary: false, precision: 2, useFullName: false };
        for (let i = 2; i < args.length; i++) {
            if (args[i] === '--binary') opts.binary = true;
            if (args[i] === '--full-name') opts.useFullName = true;
            if (args[i] === '--precision' && args[i+1]) {
                opts.precision = parseInt(args[++i]);
            }
        }
        try {
            const result = formatSize(num, opts);
            console.log(`\n✅ ${result}\n`);
        } catch(e) {
            console.log(`❌ Ошибка: ${e.message}`);
        }
        break;
        
    case 'parse':
        if (args.length < 2) {
            console.log('❌ Ошибка: parse <строка>');
            console.log('Пример: gpybyte parse "2.5 MB"');
            process.exit(1);
        }
        const str = args.slice(1).join(' ');
        try {
            const bytes = parseSize(str);
            console.log(`\n✅ "${str}" = ${bytes} байт\n`);
        } catch(e) {
            console.log(`❌ Ошибка: ${e.message}`);
        }
        break;
        
    case 'list':
        list();
        break;
        
    case 'version':
        version();
        break;
        
    case 'help':
        help();
        break;
        
    default:
        console.log(`❌ Неизвестная команда: ${cmd}`);
        console.log('Введите "gpybyte help" для справки\n');
}
