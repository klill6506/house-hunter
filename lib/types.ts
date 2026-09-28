export type EvidenceStatus="confirmed"|"inferred"|"unknown";
export type Reaction="love"|"like"|"pass"|null;
export type Listing={id:string,address:string,city:string,state:string,price:number,beds:number,baths:number,sqft?:number,acres?:number,url?:string,source:string,description?:string,photos?:string[],facts?:Record<string,unknown>};
export type CriterionResult={key:string,label:string,score:number|null,weight:number,status:EvidenceStatus,evidence?:string};
export type RankedListing=Listing&{score:number;coverage:number;criteria:CriterionResult[]};