import { EventType, EventTypeMap, StoredEvent, StoredEventOptions } from '@blargbot/core/types';
import EventEmitter from 'eventemitter3';
import moment from 'moment';
import { Duration, duration } from 'moment-timezone';

import { Cluster } from '../Cluster';
import { guard } from '../utils';

export class TimeoutManager {
    #events: Map<string, StoredEvent>;
    readonly #emitter: EventEmitter;
    #lastDuration: Duration;

    public constructor(
        public readonly cluster: Cluster
    ) {
        this.#events = new Map();
        this.#emitter = new EventEmitter();
        this.#lastDuration = duration(5, 'minutes');
    }

    public on<E extends EventType>(event: E, handler: (event: EventTypeMap[E]) => void): this {
        this.#emitter.on(event, handler);
        return this;
    }

    public once<E extends EventType>(event: E, handler: (event: EventTypeMap[E]) => void): this {
        this.#emitter.once(event, handler);
        return this;
    }

    public off<E extends EventType>(event: E, handler: (event: EventTypeMap[E]) => void): this {
        this.#emitter.off(event, handler);
        return this;
    }

    public async insert<E extends EventType>(type: E, event: StoredEventOptions<E>): Promise<void> {
        const storedEvent = await this.cluster.database.events.add(type, event);
        if (storedEvent === undefined)
            return;

        if (moment().add(this.#lastDuration).isAfter(event.endtime))
            this.#events.set(storedEvent.id, storedEvent);
    }

    public async process(): Promise<void> {
        for (const event of this.#events.values()) {
            const now = moment();
            if (now.isBefore(event.endtime))
                continue;

            const shardId = this.getShardId(event);
            if (!this.cluster.discord.shards.has(shardId)) {
                this.#events.delete(event.id);
                continue;
            }

            const type = event.type;
            try {
                this.#emitter.emit(type, event);
            } catch (err: unknown) {
                this.cluster.logger.error('Error while processing timeout', event.type, event.id, err);
            }
            await this.delete(event.id);
        }
    }

    private getShardId(event: StoredEventOptions): number {
        if (event.channel !== undefined) {
            const channel = this.cluster.discord.getChannel(event.channel);
            if (channel !== undefined && guard.isGuildChannel(channel))
                return channel.guild.shard.id;
        }
        if (event.guild !== undefined) {
            const guild = this.cluster.discord.guilds.get(event.guild);
            if (guild !== undefined)
                return guild.shard.id;
        }
        return 0;
    }

    public async delete(event: string): Promise<boolean> {
        this.#events.delete(event);
        return await this.cluster.database.events.delete(event);
    }

    public async deleteType<T extends EventType>(source: string, type: T, details: Partial<StoredEventOptions<T>> = {}): Promise<void> {
        const deleted = await this.cluster.database.events.delete({ source, type, ...details });
        for (const id of deleted)
            this.#events.delete(id);
    }

    public async deleteAll(source: string): Promise<void> {
        const deleted = await this.cluster.database.events.delete({ source });
        for (const id of deleted)
            this.#events.delete(id);
    }

    public async obtain(duration: Duration): Promise<void> {
        this.#lastDuration = duration;
        const events = await this.cluster.database.events.between(0, moment().add(duration));
        this.#events = new Map(events.map(e => [e.id, e]));
    }
}
