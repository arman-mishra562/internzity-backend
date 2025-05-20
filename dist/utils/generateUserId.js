"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserId = generateUserId;
const nanoid_1 = require("nanoid");
// Uppercase letters + digits
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = (0, nanoid_1.customAlphabet)(ALPHABET, 6);
/*e.g. INTZTY00 + 'AA0075'*/
function generateUserId() {
    return `INTZTY00${nanoid()}`;
}
