import { requireCondition, canonical, NOTICE } from './common.mjs';
export function projectInput(input) {
  requireCondition(Object.keys(input).every(k=>['context','messages'].includes(k)),'INPUT_FIELDS_NOT_ALLOWED');
  requireCondition(typeof input.context==='string' && Array.isArray(input.messages),'INPUT_SCHEMA');
  for(const message of input.messages) requireCondition(Object.keys(message).sort().join(',')==='content,role' && ['user','assistant'].includes(message.role) && typeof message.content==='string','MESSAGE_SCHEMA');
  return structuredClone(input);
}
export class MockLedger {
  constructor({maxRequests=4,ceilingUnits=40,reserveUnits=10}={}) {
    requireCondition([maxRequests,ceilingUnits,reserveUnits].every(n=>Number.isSafeInteger(n)&&n>0),'POSITIVE_INTEGER_LIMITS');
    this.maxRequests=maxRequests;this.ceilingUnits=ceilingUnits;this.reserveUnits=reserveUnits;
    this.entries=[];this.halted=false;
  }
  exposure() { return this.entries.reduce((sum,e)=>sum+(e.actualUnits??e.reservedUnits),0); }
  send(id,input,response) {
    requireCondition(!this.halted,'HALTED_NO_RETRY');
    requireCondition(!this.entries.some(e=>e.id===id),'NO_DUPLICATE_REQUEST');
    requireCondition(this.entries.length<this.maxRequests,'REQUEST_CAP');
    requireCondition(this.exposure()+this.reserveUnits<=this.ceilingUnits,'BUDGET_CAP');
    const projected=projectInput(input);
    const entry={id,input:projected,reservedUnits:this.reserveUnits,actualUnits:null,status:'reserved',output:null};
    this.entries.push(entry);
    try {
      const {status,syntheticUnits,text}=response;
      if(status!=='completed'||!Number.isSafeInteger(syntheticUnits)||syntheticUnits<0||syntheticUnits>this.reserveUnits) {
        entry.status='unresolved';this.halted=true;return structuredClone(entry);
      }
      requireCondition(typeof text==='string','MOCK_OUTPUT_SCHEMA');
      entry.actualUnits=syntheticUnits;entry.status='completed';entry.output=text;
      return structuredClone(entry);
    } catch(error) {
      entry.actualUnits=null;entry.output=null;entry.status='unresolved';this.halted=true;
      throw error;
    }
  }
  exportCards() {
    requireCondition(!this.halted&&this.entries.length===this.maxRequests&&this.entries.every(e=>e.status==='completed'),'INCOMPLETE_RUN');
    requireCondition(this.entries.length%2===0,'PAIRS_REQUIRED');
    for(let i=0;i<this.entries.length;i+=2)
      requireCondition(canonical(this.entries[i].input)===canonical(this.entries[i+1].input),'PAIR_INPUT_MISMATCH');
    const cards=[];
    for(let i=0;i<this.entries.length;i+=2){
      const pair=i%4===0?[this.entries[i+1],this.entries[i]]:[this.entries[i],this.entries[i+1]];
      cards.push({card_id:'synthetic-card-'+(i/2+1),context:pair[0].input.context,A:pair[0].output,B:pair[1].output,
        appropriateness:null,naturalness:null,comparison:null,reason:null});
    }
    return {notice:NOTICE,human_ratings_created:0,cards};
  }
}
export function demonstrate(fixture) {
  const ledger=new MockLedger(fixture.config);
  fixture.requests.forEach(r=>ledger.send(r.id,r.input,r.response));
  return {notice:NOTICE,accounting_unit:'synthetic integer units — not dollars or provider tokens',
    requests:ledger.entries.length,exposure_units:ledger.exposure(),model_calls:0,ratings:ledger.exportCards()};
}
