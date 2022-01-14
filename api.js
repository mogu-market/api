"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApi = void 0;
const body_parser_1 = require("body-parser");
const express_1 = __importDefault(require("express"));
const express_winston_1 = require("express-winston");
const winston_1 = require("winston");
/**
 * @name createApi
 * @param {string} name
 * @returns Api
 */
function createApi(name) {
    const app = (0, express_1.default)();
    const dev = process.env.NODE_ENV !== "production";
    const port = parseInt(process.env.PORT, 10) || 8080;
    const level = dev ? "info" : process.env.LOG_LEVEL || "error";
    if (name === "") {
        name = "unknown";
    }
    // create logger
    const log = (0, winston_1.createLogger)({
        level,
        format: winston_1.format.json(),
        defaultMeta: { service: `${name}-service` },
        transports: [
            new winston_1.transports.Console({
                level,
            }),
        ],
    });
    // define logger middleware
    app.use((0, express_winston_1.logger)({
        winstonInstance: log,
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}}",
        expressFormat: true,
        colorize: false,
        ignoreRoute(req, res) {
            return false;
        }
    }));
    // define body-parser middleware
    app.use((0, body_parser_1.json)());
    // initialize api
    const api = {
        register: (router) => {
            router.routes(app);
            return api;
        },
        start: () => {
            app.use((req, res) => {
                res.status(404).json({
                    error: `invalid path: ${req.path}`,
                });
            });
            app.listen(port, () => {
                log.info(`listening on ${port}`);
            });
        },
        dev: () => dev,
        log: () => log,
    };
    return api;
}
exports.createApi = createApi;
//# sourceMappingURL=api.js.map