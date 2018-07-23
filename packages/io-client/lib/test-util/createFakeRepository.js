"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var io_fs_1 = require("@komondor-lab/io-fs");
var path_1 = __importDefault(require("path"));
function createFakeRepository() {
    var cwd = path_1.default.resolve(__dirname, '../../fixtures/server');
    var repo = io_fs_1.createFileRepository(cwd);
    var readScenario = repo.readScenario, readSpec = repo.readSpec;
    var specs = {
        'exist': '{ "actions": [] }'
    };
    var scenarios = {
        'exist': '{ "scenario": "exist" }'
    };
    repo.writeSpec = function (id, data) {
        specs[id] = data;
        return Promise.resolve();
    };
    repo.readSpec = function (id) {
        if (specs[id])
            return Promise.resolve(specs[id]);
        return readSpec(id);
    };
    repo.writeScenario = function (id, data) {
        scenarios[id] = data;
        return Promise.resolve();
    };
    repo.readScenario = function (id) {
        if (scenarios[id])
            return Promise.resolve(scenarios[id]);
        return readScenario(id);
    };
    return repo;
}
exports.createFakeRepository = createFakeRepository;
//# sourceMappingURL=createFakeRepository.js.map