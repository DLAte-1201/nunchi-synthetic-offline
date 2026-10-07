import test from 'node:test';import assert from 'node:assert/strict';import fixture from '../fixtures/example.json' with {type:'json'};import {projectInput,MockLedger,demonstrate} from '../core.mjs';
const input=fixture.requests[0].input,response=fixture.requests[0].response;
test('projection rejects reviewer criteria and unexpected message fields',()=>{assert.throws(()=>projectInput({...input,human_comment:'SYNTHETIC_HIDDEN_COMMENT'}));assert.throws(()=>projectInput({...input,messages:[{role:'user',content:'SYNTHETIC',score:2}]}));assert.deepEqual(projectInput(input),input);});
test('reserve occurs before settlement and duplicate requests cannot resend',()=>{const l=new MockLedger();l.send('synthetic-1',input,response);assert.equal(l.exposure(),3);assert.throws(()=>l.send('synthetic-1',input,response));assert.equal(l.entries.length,1);});
test('unknown usage retains reservation and stops further requests',()=>{const l=new MockLedger();l.send('synthetic-1',input,{status:'unknown'});assert.equal(l.exposure(),10);assert.equal(l.entries[0].actualUnits,null);assert.throws(()=>l.send('synthetic-2',input,response));assert.throws(()=>l.exportCards());});
test('cost and request caps fail before another reservation',()=>{const l=new MockLedger({ceilingUnits:10});l.send('synthetic-1',input,response);assert.throws(()=>l.send('synthetic-2',input,response));assert.equal(l.entries.length,1);const cap=new MockLedger({maxRequests:1});cap.send('synthetic-1',input,response);assert.throws(()=>cap.send('synthetic-2',input,response));});
test('integer bounds reject booleans and invalid observed usage remains uncertain',()=>{assert.throws(()=>new MockLedger({maxRequests:true}));const l=new MockLedger();l.send('synthetic-1',input,{status:'completed',syntheticUnits:11,text:'SYNTHETIC'});assert.equal(l.exposure(),10);assert.equal(l.halted,true);});
test('export is paired, unlabeled and excludes source request IDs',()=>{const result=demonstrate(fixture);assert.equal(result.requests,4);assert.equal(result.exposure_units,14);assert.equal(result.ratings.cards.length,2);assert.equal(result.ratings.human_ratings_created,0);for(const card of result.ratings.cards){assert.equal(card.appropriateness,null);assert.equal(card.comparison,null);assert.equal(Object.hasOwn(card,'request_id'),false);}assert.equal(result.model_calls,0);});

test('malformed completed payload leaves one unresolved reservation and halts after catch',()=>{
  const malformed=[{status:'completed',syntheticUnits:3},{status:'completed',syntheticUnits:3,text:null},{status:'completed',syntheticUnits:3,text:7},null,{get status(){throw new Error('SYNTHETIC_PAYLOAD_READ_FAILURE');}}];
  for(const payload of malformed){
    const ledger=new MockLedger();
    assert.throws(()=>ledger.send('synthetic-1',input,payload));
    assert.equal(ledger.halted,true);
    assert.equal(ledger.entries.length,1);
    assert.equal(ledger.entries[0].status,'unresolved');
    assert.equal(ledger.entries[0].actualUnits,null);
    assert.equal(ledger.entries[0].output,null);
    assert.equal(ledger.exposure(),10);
    assert.throws(()=>ledger.send('synthetic-2',input,response),/HALTED_NO_RETRY/);
    assert.throws(()=>ledger.exportCards(),/INCOMPLETE_RUN/);
    assert.equal(ledger.entries.length,1);
  }
});
test('comparison cards reject paired requests with different context or messages',()=>{
  const different=[{...input,context:'SYNTHETIC other context'},{...input,messages:[{role:'user',content:'SYNTHETIC other prompt'}]}];
  for(const other of different){
    const ledger=new MockLedger({maxRequests:2});
    ledger.send('synthetic-1',input,response);ledger.send('synthetic-2',other,response);
    assert.throws(()=>ledger.exportCards(),/PAIR_INPUT_MISMATCH/);
    assert.equal(ledger.exposure(),6);
    assert.equal(ledger.entries.length,2);
  }
});
test('equal paired inputs survive object key reordering and remain unlabeled',()=>{
  const ledger=new MockLedger({maxRequests:2});
  const reordered={messages:input.messages.map(m=>({content:m.content,role:m.role})),context:input.context};
  ledger.send('synthetic-1',input,response);ledger.send('synthetic-2',reordered,response);
  const cards=ledger.exportCards();assert.equal(cards.cards.length,1);
  assert.equal(cards.cards[0].context,input.context);assert.equal(cards.human_ratings_created,0);
});
