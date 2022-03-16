import { Configuration } from '@blargbot/config';
import { BaseClient } from '@blargbot/core/BaseClient';
import { Logger } from '@blargbot/core/Logger';
import { ModuleLoader } from '@blargbot/core/modules';
import express, { Express } from 'express';
import http from 'http';

import { ApiWorker } from './ApiWorker';
import { BaseRoute } from './BaseRoute';
import { ApiOptions } from './types';

export class Api extends BaseClient {
    public readonly worker: ApiWorker;
    public readonly app: Express;
    public readonly server: http.Server;

    public constructor(
        logger: Logger,
        config: Configuration,
        options: ApiOptions
    ) {
        super(logger, config, {
            restMode: true,
            intents: []
        });

        this.worker = options.worker;
        this.app = express();
        this.app.use(express.json());

        this.server = http.createServer(this.app);
    }

    public async start(): Promise<void> {
        const routes = new ModuleLoader<BaseRoute>(`${__dirname}/routes`, BaseRoute, [this], this.logger, module => module.paths);
        routes.on('link', (module, path) => this.app.use(path, module.handle));
        await routes.init();

        await super.start();

        await new Promise<void>(res => this.server.listen(this.config.api.port, this.config.api.host, undefined, res));
    }

    public async stop(): Promise<void> {
        await new Promise<Error | undefined>(res => this.server.close(res));
    }
}
