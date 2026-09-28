export type JevDecision={score:number|null;evidence?:string};
/** Server-only Jev transport boundary.
 * Keep provider-specific request/response mapping here so ranking code remains vendor-neutral.
 * JEV_API_KEY must never be exposed to the browser.
 */
export async function jevEvaluate(prompt:string,listingText:string):Promise<JevDecision>{
 const key=process.env.JEV_API_KEY;if(!key)return {score:null,evidence:"Jev not configured"};
 // Endpoint/payload intentionally wired only after validating the current Jev API contract.
 throw new Error("Jev transport not configured yet");
}