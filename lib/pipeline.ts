import type {CriterionResult,Listing,RankedListing} from "./types";
import {factualCriteria,rankListing} from "./rank";
export type PipelineConfig={reviewLimit:number;deepAnalysisLimit:number;priceMin:number;priceMax:number};
export const defaultPipeline:PipelineConfig={reviewLimit:40,deepAnalysisLimit:100,priceMin:500000,priceMax:1200000};
export function passesHardFilters(l:Listing,c=defaultPipeline){
 if(l.price && (l.price<c.priceMin||l.price>c.priceMax)) return false;
 return true;
}
export function mergeCriteria(base:CriterionResult[],extra:CriterionResult[]){
 const map=new Map(base.map(x=>[x.key,x]));
 for(const x of extra){const prior=map.get(x.key);if(!prior||prior.score===null||x.status==="confirmed")map.set(x.key,x)}
 return [...map.values()];
}
export function buildDeepAnalysisQueue(listings:Listing[],c=defaultPipeline):RankedListing[]{
 return listings.filter(x=>passesHardFilters(x,c)).map(x=>rankListing(x,factualCriteria(x))).sort((a,b)=>b.score-a.score||b.coverage-a.coverage).slice(0,c.deepAnalysisLimit);
}
export function buildReviewQueue(listings:RankedListing[],c=defaultPipeline){
 return [...listings].sort((a,b)=>b.score-a.score||b.coverage-a.coverage).slice(0,c.reviewLimit);
}