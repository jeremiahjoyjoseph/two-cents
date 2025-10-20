/**
 * Type declarations for aes-js library
 * https://github.com/ricmoo/aes-js
 */

declare module 'aes-js' {
  export namespace utils {
    export namespace utf8 {
      export function toBytes(text: string): number[];
      export function fromBytes(bytes: number[] | Uint8Array): string;
    }
    export namespace hex {
      export function toBytes(hex: string): number[];
      export function fromBytes(bytes: number[] | Uint8Array): string;
    }
  }

  export namespace padding {
    export namespace pkcs7 {
      export function pad(data: number[] | Uint8Array): Uint8Array;
      export function strip(data: number[] | Uint8Array): Uint8Array;
    }
  }

  export class ModeOfOperation {
    static cbc: {
      new (key: Uint8Array, iv: Uint8Array): {
        encrypt(plaintext: Uint8Array): Uint8Array;
        decrypt(ciphertext: Uint8Array): Uint8Array;
      };
    };
  }

  export class Counter {
    constructor(initialValue: number);
  }
}

