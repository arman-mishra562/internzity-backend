import { customAlphabet } from 'nanoid';

// Uppercase letters + digits
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(ALPHABET, 6);

/*e.g. INTZTY00 + 'AA0075'*/
export function generateUserId(): string {
  return `INTZTY00${nanoid()}`;
}
