import type {CriterionResult,Listing} from "./types";
export type EnrichmentKind="jev-text"|"vision"|"broadband"|"drive-time"|"str-rules"|"hazards"|"status";
export type Enrichment={listingId:string;kind:EnrichmentKind;checkedAt:string;criteria?:CriterionResult[];facts?:Record<string,unknown>;sources?:string[]};
export function applyFacts(listing:Listing,enrichments:Enrichment[]):Listing{
 const facts={...(listing.facts||{})};for(const e of enrichments)Object.assign(facts,e.facts||{});return {...listing,facts};
}