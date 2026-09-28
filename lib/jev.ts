import type {CriterionResult,Listing} from "./types";
export type JevEvaluator=(prompt:string,listingText:string)=>Promise<{score:number|null;evidence?:string}>;
export const textCriteria=[
 {key:"mountainView",label:"Evidence of a genuine visible mountain view",weight:10},
 {key:"mainFloor",label:"Primary bedroom, bath, kitchen and main living area usable on main floor",weight:9},
 {key:"access",label:"Easy year-round road and driveway access; not obviously 4WD-dependent",weight:9},
 {key:"water",label:"Creek, river, waterfall, lake frontage or meaningful lake view",weight:8},
 {key:"outdoor",label:"Quality outdoor living space suited to enjoying the setting",weight:8},
 {key:"condition",label:"Move-in ready with minimal apparent renovation required",weight:8},
] as const;
export async function evaluateListingText(listing:Listing,evaluate:JevEvaluator):Promise<CriterionResult[]>{
 const text=[listing.description,JSON.stringify(listing.facts??{})].filter(Boolean).join("\n");
 return Promise.all(textCriteria.map(async c=>{if(!text)return {...c,score:null,status:"unknown" as const};const r=await evaluate(c.label,text);return {...c,score:r.score,status:r.score===null?"unknown" as const:"inferred" as const,evidence:r.evidence}}));
}