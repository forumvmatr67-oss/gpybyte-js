/**
 * GPYByte - Memory units converter with JPYByte standard support
 */

export enum Unit {
  // Decimal
  B = "B",
  KB = "KB",
  MB = "MB",
  GB = "GB",
  TB = "TB",
  PB = "PB",
  EB = "EB",
  ZB = "ZB",
  YB = "YB",
  
  // Binary
  KiB = "KiB",
  MiB = "MiB",
  GiB = "GiB",
  TiB = "TiB",
  PiB = "PiB",
  EiB = "EiB",
  ZiB = "ZiB",
  YiB = "YiB",
  
  // JPYByte standard
  IPY = "IPY",
  HPY = "HPY",
  GPY = "GPY",
  JPY = "JPY"
}

const TO_BYTES: Record<Unit, bigint> = {
  [Unit.B]: 1n,
  [Unit.KB]: 1000n,
  [Unit.MB]: 1000n ** 2n,
  [Unit.GB]: 1000n ** 3n,
  [Unit.TB]: 1000n ** 4n,
  [Unit.PB]: 1000n ** 5n,
  [Unit.EB]: 1000n ** 6n,
  [Unit.ZB]: 1000n ** 7n,
  [Unit.YB]: 1000n ** 8n,
  
  [Unit.KiB]: 1024n,
  [Unit.MiB]: 1024n ** 2n,
  [Unit.GiB]: 1024n ** 3n,
  [Unit.TiB]: 1024n ** 4n,
  [Unit.PiB]: 1024n ** 5n,
  [Unit.EiB]: 1024n ** 6n,
  [Unit.ZiB]: 1024n ** 7n,
  [Unit.YiB]: 1024n ** 8n,
  
  [Unit.IPY]: 2n ** 90n,
  [Unit.HPY]: 1000n * (2n ** 90n),
  [Unit.GPY]: 1000n ** 2n * (2n ** 90n),
  [Unit.JPY]: 1000n ** 3n * (2n ** 90n)
};

export class Converter {
  static toBytes(value: number | bigint, unit: Unit): bigint {
    const val = typeof value === 'number' ? BigInt(value) : value;
    return val * TO_BYTES[unit];
  }
  
  static fromBytes(bytes: bigint, unit: Unit): number {
    return Number(bytes) / Number(TO_BYTES[unit]);
  }
  
  static convert(value: number, fromUnit: Unit, toUnit: Unit): number {
    const bytes = this.toBytes(BigInt(value), fromUnit);
    return this.fromBytes(bytes, toUnit);
  }
}

export function formatSize(
  bytes: number | bigint,
  options?: { binary?: boolean; precision?: number }
): string {
  const binary = options?.binary || false;
  const precision = options?.precision || 2;
  const units = binary
    ? [Unit.B, Unit.KiB, Unit.MiB, Unit.GiB, Unit.TiB, Unit.PiB, Unit.EiB, Unit.ZiB, Unit.YiB]
    : [Unit.B, Unit.KB, Unit.MB, Unit.GB, Unit.TB, Unit.PB, Unit.EB, Unit.ZB, Unit.YB];
  
  let bytesVal = typeof bytes === 'number' ? BigInt(bytes) : bytes;
  
  for (let i = units.length - 1; i >= 0; i--) {
    const unit = units[i];
    if (bytesVal >= TO_BYTES[unit]) {
      const value = Converter.fromBytes(bytesVal, unit);
      return `${value.toFixed(precision)} ${unit}`;
    }
  }
  
  return `${bytesVal} B`;
}

export function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.,]+)\s*([a-zA-Z]+)/);
  if (!match) throw new Error(`Failed to parse: ${sizeStr}`);
  
  const value = parseFloat(match[1].replace(',', '.'));
  const unit = match[2].toUpperCase() as Unit;
  
  if (!TO_BYTES[unit]) throw new Error(`Unknown unit: ${unit}`);
  
  return Converter.convert(value, unit, Unit.B);
}
