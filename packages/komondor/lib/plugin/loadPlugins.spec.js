"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const io_local_1 = require("@komondor-lab/io-local");
const assertron_1 = __importDefault(require("assertron"));
const getPlugins_1 = require("./getPlugins");
const loadPlugins_1 = require("./loadPlugins");
const store_1 = require("./store");
/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', () => __awaiter(this, void 0, void 0, function* () {
    const io = io_local_1.createLocalIO();
    store_1.store.set({ plugins: [] });
    const pluginNames = ['@komondor-lab/plugin-fixture-dummy', '@komondor-lab/plugin-fixture-deep-link/pluginA'];
    yield loadPlugins_1.loadPlugins({ io }, pluginNames);
    const actual = getPlugins_1.getPlugins();
    assertron_1.default.satisfies(actual.map(p => p.type), ['@komondor-lab/plugin-fixture-deep-link-A', '@komondor-lab/plugin-fixture-dummy']);
}));
//# sourceMappingURL=loadPlugins.spec.js.map