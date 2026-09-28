import type {CriterionResult,Listing,RankedListing} from "./types";
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function rankListing(listing:Listing,criteria:CriterionResult[]):RankedListing{
 const known=criteria.filter(c=>c.score!==null);
 const denom=known.reduce((s,c)=>s+c.weight,0);
 const score=denom?known.reduce((s,c)=>s+(c.score??0)*c.weight,0)/denom:0;
 const total=criteria.reduce((s,c)=>s+c.weight,0);
 const coverage=total?known.reduce((s,c)=>s+c.weight,0)/total*100:0;
 return {...listing,score:Math.round(clamp(score)),coverage:Math.round(coverage),criteria};
}
export function factualCriteria(l:Listing):CriterionResult[]{
 return [
 {key:"price",label:"Price range",score:l.price>=500000&&l.price<=1200000?100:0,weight:10,status:"confirmed",evidence:"Listing price"},
 {key:"beds",label:"4+ bedrooms preferred",score:l.beds>=4?100:l.beds===3?65:20,weight:6,status:"confirmed",evidence:`${l.beds} bedrooms`},
 {key:"baths",label:"3+ bathrooms preferred",score:l.baths>=3?100:l.baths>=2.5?70:25,weight:6,status:"confirmed",evidence:`${l.baths} bathrooms`},
 {key:"mountainView",label:"Mountain view",score:null,weight:10,status:"unknown"},
 {key:"mainFloor",label:"Main-floor living",score:null,weight:9,status:"unknown"},
 {key:"access",label:"Year-round access",score:null,weight:9,status:"unknown"},
 {key:"internet",label:"High-speed internet",score:null,weight:9,status:"unknown"},
 {key:"water",label:"Water feature / lake view",score:null,weight:8,status:"unknown"},
 {key:"outdoor",label:"Outdoor living",score:null,weight:8,status:"unknown"},
 {key:"condition",label:"Move-in ready",score:null,weight:8,status:"unknown"}
 ];}