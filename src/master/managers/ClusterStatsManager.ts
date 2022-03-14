import { ClusterStats } from '@blargbot/cluster/types';

export class ClusterStatsManager {
    private readonly statsMap: Record<number, ClusterStats | undefined>;

    public constructor() {
        this.statsMap = {};
    }

    public set(clusterId: number, stats: ClusterStats | undefined): void {
        if (stats === undefined)
            delete this.statsMap[clusterId];
        else
            this.statsMap[clusterId] = stats;
    }

    public get(clusterId: number): ClusterStats | undefined {
        return this.statsMap[clusterId];
    }

    public getAll(): Record<number, ClusterStats | undefined> {
        return this.statsMap;
    }
}