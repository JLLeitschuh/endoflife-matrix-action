"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const endoflife_api_1 = require("../src/endoflife-api");
(0, globals_1.describe)('endoflife-api', () => {
    let client;
    (0, globals_1.beforeEach)(() => {
        client = new endoflife_api_1.EndOfLifeClient();
    });
    (0, globals_1.test)('fetches data', () => __awaiter(void 0, void 0, void 0, function* () {
        const eolData = yield client.fetchEOLData('java');
        (0, globals_1.expect)(eolData).toBeDefined();
        (0, globals_1.expect)(eolData.length).toBeGreaterThan(0);
        for (const eolVersion of eolData) {
            (0, globals_1.expect)(eolVersion.cycle).toBeDefined();
            (0, globals_1.expect)(eolVersion.lts).toBeDefined();
            (0, globals_1.expect)(eolVersion.releaseDate).toBeDefined();
            (0, globals_1.expect)(eolVersion.support).toBeDefined();
            (0, globals_1.expect)(eolVersion.eol).toBeDefined();
            (0, globals_1.expect)(eolVersion.latest).toBeDefined();
        }
    }));
});
