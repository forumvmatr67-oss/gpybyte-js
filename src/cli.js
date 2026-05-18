#!/usr/bin/env node

/**
 * CLI интерфейс для gpybyte
 */

const { Converter, Unit, formatSize, parseSize, getUnits, getUnitInfo } = require('./index.js');

function printHelp() {
    console.log(`
gpybyte - конвертер единиц памяти (поддержка стандарта JPYByte: IPY/HPY/GPY/JPY)

Использование:
  gpybyte convert <значение> <из> <в>     Конвертировать
  gpybyte format <значение> [опции]       Форматировать
  gpybyte parse <строка>                  Распарсить строку
  gpybyte list                            Список единиц
  gpybyte version                         Версия
  gpybyte help                            Помощь

Примеры:
  gpybyte convert 1 GB MB
  gpybyte convert 1 GiB MiB
  gpybyte convert 1 GPY JPY
  gpybyte format 1234567890
  gpybyte format 1234567890 --binary
  gpybyte format 1234567890 --precision 4
  gpybyte parse "2.5 MB"
  gpybyte parse "10 GPY"

Опции format:
  --unit <ед>       Исходная единица (по умолчанию байты)
  --target <ед>     Целевая единица (автовыбор)
  --binary          Использовать двоичные единицы
  --precision <n>   Точность (по умолчанию 2)
  --full-name       Полные названия (килобайт вместо KB)
`);
}

function printVersion() {
    console.log('gpybyte 0.1.0 - поддержка стандарта JPYByte');
}

function printUnits() {
    console.log('\n📊 Доступные единицы измерения (стандарт JPYByte):');
    console.log('='.repeat(50));
    console.log('Единица     Тип                Название');
    console.log('='.repeat(50));
    
    for (const unit of getUnits()) {
        const info = getUnitInfo(unit);
        console.log(`${unit.padEnd(10)} ${info.type.padEnd(18)} ${info.name}`);
    }
    
    console.log('='.repeat(50));
    console.log(`\nВсего единиц: ${getUnits().length}`);
    console.log('\n📐 Стандарт JPYByte для ГИС:');
    console.log('  IPY (айпибайт) = 2^90 байт');
    console.log('  HPY (эйчпибайт) = 1000 IPY');
    console.log('  GPY (джипибайт) = 1000 HPY');
    console.log('  JPY (джейпибайт) = 1000 GPY\n');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        printHelp();
        return;
    }
    
    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'convert':
            if (args.length < 4) {
                console.log('Ошибка: нужно указать: convert <значение> <из> <в>');
                return;
            }
            const value = parseFloat(args[1]);
            const fromUnit = args[2].toUpperCase();
            const toUnit = args[3].toUpperCase();
            
            try {
                const result = Converter.convert(value, fromUnit, toUnit);
                console.log(`${value} ${fromUnit} = ${result} ${toUnit}`);
            } catch (e) {
                console.log(`Ошибка: неизвестная единица измерения`);
            }
            break;
            
        case 'format':
            if (args.length < 2) {
                console.log('Ошибка: нужно указать значение для форматирования');
                return;
            }
            const val = parseFloat(args[1]);
            const options = {};
            
            for (let i = 2; i < args.length; i++) {
                if (args[i] === '--unit' && args[i + 1]) {
                    options.unit = args[++i].toUpperCase();
                } else if (args[i] === '--target' && args[i + 1]) {
                    options.targetUnit = args[++i].toUpperCase();
                } else if (args[i] === '--binary') {
                    options.binary = true;
                } else if (args[i] === '--precision' && args[i + 1]) {
                    options.precision = parseInt(args[++i]);
                } else if (args[i] === '--full-name') {
                    options.useFullName = true;
                }
            }
            
            try {
                const result = formatSize(val, options);
                console.log(result);
            } catch (e) {
                console.log(`Ошибка: ${e.message}`);
            }
            break;
            
        case 'parse':
            if (args.length < 2) {
                console.log('Ошибка: нужно указать строку для парсинга');
                return;
            }
            const str = args.slice(1).join(' ');
            try {
                const result = parseSize(str);
                console.log(`${str} = ${result} байт`);
            } catch (e) {
                console.log(`Ошибка: ${e.message}`);
            }
            break;
            
        case 'list':
            printUnits();
            break;
            
        case 'version':
            printVersion();
            break;
            
        case 'help':
            printHelp();
            break;
            
        default:
            console.log(`Неизвестная команда: ${command}`);
            printHelp();
    }
}

if (require.main === module) {
    main();
}

module.exports = { printHelp, printVersion, printUnits };
