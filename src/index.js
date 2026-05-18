/**
 * gpybyte - библиотека для работы с единицами измерения памяти
 * Версия: 0.1.0
 * Автор: Георгий Назаров
 * Лицензия: MIT
 */

// ========== Единицы измерения ==========

const Unit = {
    // Десятичные (1000)
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
    TB: "TB",
    PB: "PB",
    EB: "EB",
    ZB: "ZB",
    YB: "YB",
    
    // Двоичные (1024)
    KiB: "KiB",
    MiB: "MiB",
    GiB: "GiB",
    TiB: "TiB",
    PiB: "PiB",
    EiB: "EiB",
    ZiB: "ZiB",
    YiB: "YiB",
    
    // Стандарт JPYByte
    IPY: "IPY",
    HPY: "HPY",
    GPY: "GPY",
    JPY: "JPY"
};

// ========== Коэффициенты перевода в байты ==========

const TO_BYTES = {
    // Десятичные
    [Unit.B]: 1,
    [Unit.KB]: 1000,
    [Unit.MB]: 1000000,
    [Unit.GB]: 1000000000,
    [Unit.TB]: 1000000000000,
    [Unit.PB]: 1000000000000000,
    [Unit.EB]: 1000000000000000000,
    [Unit.ZB]: 1000000000000000000000,
    [Unit.YB]: 1000000000000000000000000,
    
    // Двоичные
    [Unit.KiB]: 1024,
    [Unit.MiB]: 1048576,
    [Unit.GiB]: 1073741824,
    [Unit.TiB]: 1099511627776,
    [Unit.PiB]: 1125899906842624,
    [Unit.EiB]: 1152921504606846976,
    [Unit.ZiB]: 1180591620717411303424,
    [Unit.YiB]: 1208925819614629174706176,
    
    // Стандарт JPYByte
    [Unit.IPY]: 1237940039285380274899124224,
    [Unit.HPY]: 1237940039285380274899124224000,
    [Unit.GPY]: 1237940039285380274899124224000000,
    [Unit.JPY]: 1237940039285380274899124224000000000
};

// ========== Русские названия ==========

const UNIT_NAMES = {
    [Unit.B]: "байт",
    [Unit.KB]: "килобайт",
    [Unit.MB]: "мегабайт",
    [Unit.GB]: "гигабайт",
    [Unit.TB]: "терабайт",
    [Unit.PB]: "петабайт",
    [Unit.EB]: "эксабайт",
    [Unit.ZB]: "зеттабайт",
    [Unit.YB]: "йоттабайт",
    [Unit.KiB]: "кибибайт",
    [Unit.MiB]: "мебибайт",
    [Unit.GiB]: "гибибайт",
    [Unit.TiB]: "тебибайт",
    [Unit.PiB]: "пебибайт",
    [Unit.EiB]: "эксбибайт",
    [Unit.ZiB]: "зебибайт",
    [Unit.YiB]: "йобибайт",
    [Unit.IPY]: "айпибайт",
    [Unit.HPY]: "эйчпибайт",
    [Unit.GPY]: "джипибайт",
    [Unit.JPY]: "джейпибайт"
};

// ========== Конвертер (работает с числами) ==========

class Converter {
    static toBytes(value, unit) {
        return value * TO_BYTES[unit];
    }
    
    static fromBytes(bytes, unit) {
        return bytes / TO_BYTES[unit];
    }
    
    static convert(value, fromUnit, toUnit) {
        const bytes = this.toBytes(value, fromUnit);
        return this.fromBytes(bytes, toUnit);
    }
}

// ========== Форматирование ==========

function formatSize(value, options = {}) {
    const { unit = Unit.B, targetUnit = null, precision = 2, binary = false, useFullName = false } = options;
    
    let bytes = Converter.toBytes(value, unit);
    
    let target = targetUnit;
    if (!target) {
        target = autoSelectUnit(bytes, binary);
    }
    
    const converted = Converter.fromBytes(bytes, target);
    let numberStr = converted.toFixed(precision);
    
    if (numberStr.endsWith('.00')) {
        numberStr = numberStr.slice(0, -3);
    }
    
    let suffix = target;
    if (useFullName) {
        suffix = UNIT_NAMES[target];
        if (converted !== 1) {
            if (suffix.endsWith('т')) suffix += 'а';
            else if (suffix.endsWith('й')) suffix = suffix.slice(0, -1) + 'я';
            else suffix += 'ов';
        }
    }
    
    return `${numberStr} ${suffix}`;
}

function autoSelectUnit(bytes, binary = false) {
    let units;
    if (binary) {
        units = [Unit.B, Unit.KiB, Unit.MiB, Unit.GiB, Unit.TiB, Unit.PiB, Unit.EiB, Unit.ZiB, Unit.YiB];
    } else {
        units = [Unit.B, Unit.KB, Unit.MB, Unit.GB, Unit.TB, Unit.PB, Unit.EB, Unit.ZB, Unit.YB];
    }
    
    if (bytes >= TO_BYTES[Unit.IPY]) {
        units.push(Unit.IPY, Unit.HPY, Unit.GPY, Unit.JPY);
    }
    
    for (let i = units.length - 1; i >= 0; i--) {
        if (bytes >= TO_BYTES[units[i]]) {
            return units[i];
        }
    }
    
    return Unit.B;
}

function bestFormat(bytes, binary = false, precision = 2) {
    const unit = autoSelectUnit(bytes, binary);
    return formatSize(bytes, { unit: Unit.B, targetUnit: unit, precision });
}

// ========== Парсинг ==========

function parseSize(sizeStr, returnUnit = false) {
    const match = sizeStr.match(/^([\d.,]+)\s*([a-zA-Zа-яА-Я]+)/);
    if (!match) {
        throw new Error(`Не удалось распарсить: ${sizeStr}`);
    }
    
    let numStr = match[1].replace(',', '.');
    const value = parseFloat(numStr);
    const unitStr = match[2];
    const unit = normalizeUnit(unitStr);
    
    if (returnUnit) {
        return { value, unit };
    }
    
    return Converter.convert(value, unit, Unit.B);
}

function normalizeUnit(unitStr) {
    const lower = unitStr.toLowerCase();
    
    const map = {
        'b': Unit.B, 'байт': Unit.B, 'байта': Unit.B, 'байтов': Unit.B,
        'kb': Unit.KB, 'кб': Unit.KB, 'килобайт': Unit.KB,
        'mb': Unit.MB, 'мб': Unit.MB, 'мегабайт': Unit.MB,
        'gb': Unit.GB, 'гб': Unit.GB, 'гигабайт': Unit.GB,
        'tb': Unit.TB, 'тб': Unit.TB, 'терабайт': Unit.TB,
        'pb': Unit.PB, 'пб': Unit.PB, 'петабайт': Unit.PB,
        'eb': Unit.EB, 'эб': Unit.EB, 'эксабайт': Unit.EB,
        'zb': Unit.ZB, 'зб': Unit.ZB, 'зеттабайт': Unit.ZB,
        'yb': Unit.YB, 'йб': Unit.YB, 'йоттабайт': Unit.YB,
        'kib': Unit.KiB, 'киб': Unit.KiB, 'кибибайт': Unit.KiB,
        'mib': Unit.MiB, 'миб': Unit.MiB, 'мебибайт': Unit.MiB,
        'gib': Unit.GiB, 'гиб': Unit.GiB, 'гибибайт': Unit.GiB,
        'tib': Unit.TiB, 'тиб': Unit.TiB, 'тебибайт': Unit.TiB,
        'pib': Unit.PiB, 'пиб': Unit.PiB, 'пебибайт': Unit.PiB,
        'eib': Unit.EiB, 'эиб': Unit.EiB, 'эксбибайт': Unit.EiB,
        'zib': Unit.ZiB, 'зиб': Unit.ZiB, 'зебибайт': Unit.ZiB,
        'yib': Unit.YiB, 'йиб': Unit.YiB, 'йобибайт': Unit.YiB,
        'ipy': Unit.IPY, 'айпибайт': Unit.IPY,
        'hpy': Unit.HPY, 'эйчпибайт': Unit.HPY,
        'gpy': Unit.GPY, 'джипибайт': Unit.GPY,
        'jpy': Unit.JPY, 'джейпибайт': Unit.JPY
    };
    
    if (!map[lower]) {
        throw new Error(`Неизвестная единица: ${unitStr}`);
    }
    
    return map[lower];
}

function getUnits() {
    return Object.values(Unit);
}

function getUnitInfo(unit) {
    const decimal = [Unit.B, Unit.KB, Unit.MB, Unit.GB, Unit.TB, Unit.PB, Unit.EB, Unit.ZB, Unit.YB];
    const binary = [Unit.KiB, Unit.MiB, Unit.GiB, Unit.TiB, Unit.PiB, Unit.EiB, Unit.ZiB, Unit.YiB];
    const jpybyte = [Unit.IPY, Unit.HPY, Unit.GPY, Unit.JPY];
    
    let type = 'неизвестная';
    if (decimal.includes(unit)) type = 'десятичная';
    else if (binary.includes(unit)) type = 'двоичная';
    else if (jpybyte.includes(unit)) type = 'стандарт JPYByte';
    
    return { symbol: unit, name: UNIT_NAMES[unit], type };
}

module.exports = {
    Unit,
    Converter,
    formatSize,
    parseSize,
    bestFormat,
    getUnits,
    getUnitInfo
};
