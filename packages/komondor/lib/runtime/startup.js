"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = require("../plugin");
const functionPlugin = __importStar(require("../plugin-function"));
const symbolPlugin = __importStar(require("../plugin-symbol"));
const valuePlugin = __importStar(require("../plugin-value"));
const getIO_1 = require("./getIO");
const logger_1 = require("./logger");
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        const io = yield getIO_1.getIO();
        // TODO: config is not typed and validated
        // BODY should the config be validated upfront or at usage?
        const config = yield io.loadConfig();
        plugin_1.registerPlugin(valuePlugin);
        plugin_1.registerPlugin(symbolPlugin);
        plugin_1.registerPlugin(functionPlugin);
        if (config.plugins && config.plugins.length > 0)
            yield plugin_1.loadPlugins({ io }, config.plugins);
        return { io, logger: logger_1.logger };
    });
}
exports.startup = startup;
//# sourceMappingURL=startup.js.map