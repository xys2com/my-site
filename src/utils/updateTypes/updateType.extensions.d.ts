export {};
declare global {
  interface Object {
    deepClone<T>(): T;
  }
  interface Array<T> {
    deRepeat(key?: string | null, left?: boolean): T[];
    lastItem(index?: number): T;
    deleteVal(val?: string | null | number, key?: string | null | number): T[];
    getValue(key: string | number, kKey?: string, vKey?: string): string;
    deepClone(): T[];
  }
  interface String {
    suffix(retain?: boolean, separator?: string): string;
    replaceAll(searchValue: any, replaceValue: any);
  }
}
