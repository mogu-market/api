import {json} from "body-parser";
import express from "express";
import type {Express, Request, Response} from "express";
import {logger} from "express-winston";
import {createLogger, format, transports} from "winston";
import type {Logger as Winston} from "winston";

/**
 * @name Logger
 * @interface
 */
export type Logger = Winston;

/**
 * @name Api
 * @interface
 */
export interface Api {
    /**
     * @name register
     * @desc Register router.
     * @param {Router} router
     * @returns Api
     */
    register(router: Router): Api;

    /**
     * @name start
     * @desc Start the api.
     */
    start(): void;

    /**
     * @name dev
     * @desc Returns TRUE if environment is "dev".
     * @returns boolean
     */
    dev(): boolean;

    /**
     * @name log
     * @desc Returns the Logger.
     * @returns Logger
     */
    log(): Logger;
}

/**
 * @name Router
 * @interface
 */
export interface Router {
    routes(app: Express): void;
}

/**
 * @name createApi
 * @param {string} name
 * @returns Api
 */
export function createApi(name: string): Api {
    const app: Express = express();
    const dev: boolean = process.env.NODE_ENV !== "production";
    const port: number = parseInt(process.env.PORT, 10) || 8080;
    const level = dev ? "info" : process.env.LOG_LEVEL || "error";

    if (name === "") {
        name = "unknown";
    }

    // create logger
    const log = createLogger({
        level,
        format: format.json(),
        defaultMeta: {service: `${name}-service`},
        transports: [
            new transports.Console({
                level,
            }),
        ],
    });

    // define logger middleware
    app.use(logger({
        winstonInstance: log,
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}}",
        expressFormat: true,
        colorize: false,
        ignoreRoute(req: Request, res: Response) {
            return false;
        }
    }));

    // define body-parser middleware
    app.use(json());

    // initialize api
    const api = {
        register: (router: Router): Api => {
            router.routes(app);
            return api;
        },
        start: () => {
            app.use((req: Request, res: Response) => {
                res.status(404).json({
                    error: `invalid path: ${req.path}`,
                });
            });
            app.listen(port, () => {
                log.info(`listening on ${port}`);
            });
        },
        dev: (): boolean => dev,
        log: (): Logger => log,
    } as Api;

    return api;
}
