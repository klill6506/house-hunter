import type {Listing} from "./types";
export type ListingQuery={regions:string[];priceMin:number;priceMax:number;limit?:number};
export interface ListingSource{name:string;search(query:ListingQuery):Promise<Listing[]>}
/** Production sources implement this boundary. Keep acquisition separate from ranking.
 * Do not silently scrape sources whose terms prohibit it. Prefer licensed MLS/RESO feeds
 * and authorized APIs; normalize FSBO feeds into the same Listing shape.
 */