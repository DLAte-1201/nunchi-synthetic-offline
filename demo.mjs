import fixture from './fixtures/example.json' with {type:'json'};
import {demonstrate} from './core.mjs';
console.log(JSON.stringify(demonstrate(fixture),null,2));
