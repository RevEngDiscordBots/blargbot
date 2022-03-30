import { config } from '@blargbot/config';
import { createLogger } from '@blargbot/logger';
import { MasterWorker } from '@blargbot/master';
import devAvatars from '@blargbot/res/avatars.dev.json';
import prdAvatars from '@blargbot/res/avatars.prd.json';
import holidays from '@blargbot/res/holidays.json';

const logger = createLogger(config, 'MS');
logger.setGlobal();

const avatars = config.general.isProd !== true ? devAvatars : prdAvatars;

process.on('exit', () => {
    logger.fatal('Master process is exiting.', new Error().stack);
});

Error.stackTraceLimit = 100;
void new MasterWorker(logger, config, { avatars, holidays })
    .start();
