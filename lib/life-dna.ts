export const FOCUS_AREAS = ["Personal style","Home & interiors","Food & cooking","Travel","Gifts","Hobbies"] as const;
export const MOODS = ["Warm & earthy","Minimal & modern","Colorful & playful","Classic & timeless","Bold & eclectic","Relaxed & natural"] as const;
export type LifePreferences = {name:string;focusAreas:string[];moods:string[];goal:string;updatedAt:string};
export const STORAGE_KEY = "life-edit-preferences-v1";
export function isLifePreferences(value:unknown):value is LifePreferences {
 if(!value || typeof value!=="object") return false;
 const v=value as Record<string,unknown>;
 return typeof v.name==="string" && typeof v.goal==="string" && typeof v.updatedAt==="string" && Array.isArray(v.focusAreas) && v.focusAreas.every(x=>typeof x==="string") && Array.isArray(v.moods) && v.moods.every(x=>typeof x==="string");
}
export function buildLifeDNA(p:LifePreferences){
 const moods=p.moods.length?p.moods:["Curious & evolving"];
 const focus=p.focusAreas.length?p.focusAreas:["Everyday inspiration"];
 const headline=moods.slice(0,3).join(" · ");
 const insights=focus.map(area=>({area,description:({
 "Personal style":"Build outfits that reflect your chosen aesthetic, using what you own first.",
 "Home & interiors":"Create a room-by-room inspiration board and prioritize one achievable refresh.",
 "Food & cooking":"Choose three recipes that match your routines and make a short grocery plan.",
 "Travel":"Turn your dream destinations into a practical itinerary and savings checklist.",
 "Gifts":"Keep a thoughtful gift shortlist with occasions and budgets.",
 "Hobbies":"Make space for a small, repeatable creative or wellness ritual."
 } as Record<string,string>)[area] ?? "Explore this part of your life with a small, achievable next step."}));
 return {headline,focus,insights,goal:p.goal.trim(),name:p.name.trim()};
}
