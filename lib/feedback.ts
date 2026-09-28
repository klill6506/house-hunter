import type {Reaction} from "./types";
export type Feedback={profileId:string;listingId:string;reaction:Reaction;note?:string;createdAt:string};
export const reactionSignal=(r:Reaction)=>r==="love"?1:r==="like"?.5:r==="pass"?-1:0;
/** Feedback is stored as evidence for future weight tuning.
 * V1 does not silently rewrite weights after one click; explicit/aggregate tuning comes later.
 */