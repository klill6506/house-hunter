import type {DiscoveryHit} from "./discovery";
export interface PublicDiscoveryProvider {name:string;discover(query:string):Promise<DiscoveryHit[]>}
/** Public discovery finds candidate URLs/facts from indexed public pages.
 * It is NOT a crawler and must not bypass access controls, robots, logins or anti-bot systems.
 * Each hit preserves its source URL and timestamp. Missing facts remain missing.
 */