import * as schema from "./schema";
export declare const pool: import("pg").Pool | undefined;
export declare const db: (import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
}) | undefined;
export * from "./schema";
//# sourceMappingURL=index.d.ts.map