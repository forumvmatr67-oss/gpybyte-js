/**
 * gpybyte - библиотека для работы с единицами измерения памяти
 * 
 * Поддерживаемые единицы:
 * - Десятичные: B, KB, MB, GB, TB, PB, EB, ZB, YB
 * - Двоичные: KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB
 * - Стандарт JPYByte: IPY, HPY, GPY, JPY
 * 
 * @example
 * const { formatSize, Converter, Unit } = require('gpybyte');
 * console.log(formatSize(1234567890)); // "1.23 GB"
 * console.log(Converter.convert(1, Unit.GB, Unit.MB)); // 1000
 */

// ========== Единицы измерения ==========

const Unit = {
    // Десятичные (основание 1000)
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
    TB: "TB",
    PB: "PB",
    EB: "EB",
    ZB: "ZB",
    YB: "YB",
    
    // Двоичные (основание 1024)
    KiB: "KiB",
    MiB: "MiB",
    GiB: "GiB",
    TiB: "TiB",
    PiB: "PiB",
    EiB: "EiB",
    ZiB: "ZiB",
    YiB: "YiB",
    
    // Стандарт JPYByte для ГИС
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
    [Unit.MB]: 1000n ** 2n,
    [Unit.GB]: 1000n ** 3n,
    [Unit.TB]: 1000n ** 4n,
    [Unit.PB]: 1000n ** 5n,
    [Unit.EB]: 1000n ** 6n,
    [Unit.ZB]: 1000n ** 7n,
    [Unit.YB]: 1000n ** 8n,
    
    // Двоичные
    [Unit.KiB]: 1024n,
    [Unit.MiB]: 1024n ** 2n,
    [Unit.GiB]: 1024n ** 3n,
    [Unit.TiB]: 1024n ** 4n,
    [Unit.PiB]: 1024n ** 5n,
    [Unit.EiB]: 1024n ** 6n,
    [Unit.ZiB]: 1024n ** 7n,
    [Unit.YiB]: 1024n ** 8n,
    
    // Стандарт JPYByte
    [Unit.IPY]: 2n ** 90n,
    [Unit.HPY]: 1000n * (2n ** 90n),
    [Unit.GPY]: (1000n ** 2n) * (2n ** 90n),
    [Unit.JPY]: (1000n ** 3n) * (2n ** 90n)
};

// Человекочитаемые названия (русский язык)
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
        const bytes = this.toBytes(value, fromUnit);
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
    const {
        unit = Unit.B,
        targetUnit = null,
        precision = 2,
        binary = false,
        useFullName = false
    } = options;
    
    // Переводим в байты
    let bytes;
    if (typeof value === 'number' || typeof value === 'bigint') {
        bytes = Converter.toBytes(value, unit);
    } else {
        bytes = BigInt(value);
    }
    
    // Выбираем целевую единицу
    let target = targetUnit;
    if (!target) {
        target = autoSelectUnit(bytes, binary);
    }
    
    // Конвертируем
    const converted = Converter.fromBytes(bytes, target);
    
    // Форматируем число
    let numberStr = converted.toFixed(precision);
    if (numberStr.endsWith('.00')) {
        numberStr = numberStr.slice(0, -3);
    }
    
    // Добавляем суффикс
    let suffix = target;
    if (useFullName) {
        suffix = UNIT_NAMES[target];
        if (converted !== 1) {
            if (suffix.endsWith('т')) {
                suffix += 'а';
            } else if (suffix.endsWith('й')) {
                suffix = suffix.slice(0, -1) + 'я';
            } else {
                suffix += 'ов';
            }
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
    
    // Добавляем стандарт JPYByte для огромных чисел
    if (bytes >= TO_BYTES[Unit.IPY]) {
        units.push(Unit.IPY, Unit.HPY, Unit.GPY, Unit.JPY);
    }
    
    // Идём с конца
    for (let i = units.length - 1; i >= 0; i--) {
        const u = units[i];
        if (bytes >= TO_BYTES[u]) {
            return u;
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
    
    let numStr = match[1].replace(',', '.');
    const value = parseFloat(numStr);
    let unitStr = match[2];
    
    // Нормализуем единицу
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
    
    const mapping = {
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
    
    if (!mapping[lower]) {
        throw new Error(`Неизвестная единица измерения: ${unitStr}`);
    }
    
    return mapping[lower];
}

// ========== Список единиц ==========

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
    const decimalUnits = [Unit.B, Unit.KB, Unit.MB, Unit.GB, Unit.TB, Unit.PB, Unit.EB, Unit.ZB, Unit.YB];
    const binaryUnits = [Unit.KiB, Unit.MiB, Unit.GiB, Unit.TiB, Unit.PiB, Unit.EiB, Unit.ZiB, Unit.YiB];
    const jpybyteUnits = [Unit.IPY, Unit.HPY, Unit.GPY, Unit.JPY];
    
    let type;
    if (decimalUnits.includes(unit)) {
        type = 'десятичная';
    } else if (binaryUnits.includes(unit)) {
        type = 'двоичная';
    } else if (jpybyteUnits.includes(unit)) {
        type = 'стандарт JPYByte';
    } else {
        type = 'неизвестная';
    }
    
    return {
        symbol: unit,
        name: UNIT_NAMES[unit],
        type: type
    };
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
