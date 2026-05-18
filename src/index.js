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
    [Unit.B]: 1n,
    [Unit.KB]: 1000n,
    [Unit.MB]: 1000000n,
    [Unit.GB]: 1000000000n,
    [Unit.TB]: 1000000000000n,
    [Unit.PB]: 1000000000000000n,
    [Unit.EB]: 1000000000000000000n,
    [Unit.ZB]: 1000000000000000000000n,
    [Unit.YB]: 1000000000000000000000000n,
    
    // Двоичные
    [Unit.KiB]: 1024n,
    [Unit.MiB]: 1048576n,
    [Unit.GiB]: 1073741824n,
    [Unit.TiB]: 1099511627776n,
    [Unit.PiB]: 1125899906842624n,
    [Unit.EiB]: 1152921504606846976n,
    [Unit.ZiB]: 1180591620717411303424n,
    [Unit.YiB]: 1208925819614629174706176n,
    
    // Стандарт JPYByte
    [Unit.IPY]: 1237940039285380274899124224n,
    [Unit.HPY]: 1237940039285380274899124224000n,
    [Unit.GPY]: 1237940039285380274899124224000000n,
    [Unit.JPY]: 1237940039285380274899124224000000000n
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

// ========== Конвертер ==========

class Converter {
    /**
     * Переводит значение в байты
     * @param {number|bigint} value - Числовое значение
     * @param {string} unit - Единица измерения
     * @returns {bigint} Количество байт
     */
    static toBytes(value, unit) {
        const val = typeof value === 'number' ? BigInt(value) : value;
        return val * TO_BYTES[unit];
    }
    
    /**
     * Переводит байты в указанную единицу
     * @param {bigint} bytes - Количество байт
     * @param {string} unit - Целевая единица
     * @returns {number} Значение в целевой единице
     */
    static fromBytes(bytes, unit) {
        return Number(bytes) / Number(TO_BYTES[unit]);
    }
    
    /**
     * Конвертирует значение из одной единицы в другую
     * @param {number} value - Значение в исходной единице
     * @param {string} fromUnit - Исходная единица
     * @param {string} toUnit - Целевая единица
     * @returns {number} Значение в целевой единице
     */
    static convert(value, fromUnit, toUnit) {
        const bytes = this.toBytes(BigInt(value), fromUnit);
        return this.fromBytes(bytes, toUnit);
    }
}

// ========== Форматирование ==========

/**
 * Форматирует объём памяти в человекочитаемый вид
 * @param {number|bigint} value - Числовое значение
 * @param {Object} options - Опции форматирования
 * @param {string} [options.unit] - Исходная единица (по умолчанию байты)
 * @param {string} [options.targetUnit] - Целевая единица (автовыбор)
 * @param {number} [options.precision=2] - Количество знаков после запятой
 * @param {boolean} [options.binary=false] - Использовать двоичные единицы
 * @param {boolean} [options.useFullName=false] - Использовать полные названия
 * @returns {string} Отформатированная строка
 */
function formatSize(value, options = {}) {
    const { unit = Unit.B, targetUnit = null, precision = 2, binary = false, useFullName = false } = options;
    
    let bytes;
    if (typeof value === 'bigint') {
        bytes = value;
    } else {
        bytes = Converter.toBytes(BigInt(value), unit);
    }
    
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

/**
 * Автоматический выбор оптимальной единицы
 * @param {bigint} bytes - Количество байт
 * @param {boolean} binary - Использовать двоичные единицы
 * @returns {string} Оптимальная единица
 */
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

/**
 * Автоматическое форматирование байт
 * @param {number|bigint} bytes - Количество байт
 * @param {boolean} binary - Использовать двоичные единицы
 * @param {number} precision - Точность
 * @returns {string} Отформатированная строка
 */
function bestFormat(bytes, binary = false, precision = 2) {
    const unit = autoSelectUnit(BigInt(bytes), binary);
    return formatSize(bytes, { unit: Unit.B, targetUnit: unit, precision });
}

// ========== Парсинг ==========

/**
 * Парсит строку с размером памяти
 * @param {string} sizeStr - Строка вида "2.5 MB" или "10 GPY"
 * @param {boolean} returnUnit - Вернуть единицу измерения
 * @returns {number|Object} Значение в байтах или {value, unit}
 */
function parseSize(sizeStr, returnUnit = false) {
    const match = sizeStr.match(/^([\d.,]+)\s*([a-zA-Zа-яА-Я]+)/);
    if (!match) {
        throw new Error(`Не удалось распарсить: ${sizeStr}`);
    }
    
    const value = parseFloat(match[1].replace(',', '.'));
    const unitStr = match[2];
    const unit = normalizeUnit(unitStr);
    
    if (returnUnit) {
        return { value, unit };
    }
    
    return Converter.convert(value, unit, Unit.B);
}

/**
 * Нормализует строку с единицей измерения
 * @param {string} unitStr - Строка с единицей
 * @returns {string} Нормализованная единица
 */
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

// ========== Вспомогательные функции ==========

/**
 * Возвращает список всех единиц измерения
 * @returns {string[]} Массив единиц
 */
function getUnits() {
    return Object.values(Unit);
}

/**
 * Возвращает информацию о единице
 * @param {string} unit - Единица измерения
 * @returns {Object} Информация о единице
 */
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

// ========== Экспорт ==========

module.exports = {
    Unit,
    Converter,
    formatSize,
    parseSize,
    bestFormat,
    getUnits,
    getUnitInfo
};
