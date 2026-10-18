const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');

function setup({status=201,network=false,blockedStorage=false}={}){
  const elements=new Map();
  const storage=new Map();
  const requests=[];
  const element=id=>{
    if(!elements.has(id)) elements.set(id,{
      value:'',textContent:'',innerHTML:'',disabled:false,events:{},children:[],
      addEventListener(type,handler){this.events[type]=handler;},
      focus(){this.focused=true;},appendChild(child){this.children.push(child);}
    });
    return elements.get(id);
  };
  element('#repoField').value='mowlsint/telegram_watch';
  element('#branchField').value='main';
  const context={
    document:{querySelector:element,createElement:()=>({})},
    localStorage:{getItem:k=>{if(blockedStorage)throw Error('blocked');return storage.get(k)||null;},
      setItem:(k,v)=>{if(blockedStorage)throw Error('blocked');storage.set(k,v);}},
    TextEncoder,AbortSignal,crypto:webcrypto,TypeError,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),
    fetch:async(url,options)=>{requests.push({url,options});if(network)throw new TypeError('offline');return {ok:status===201,status};}
  };
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  return {element,storage,requests,save:()=>element('#repoSaveBtn').events.click()};
}
function fill(app){
  app.element('#input').value='```text\nDAILY TELEGRAM WATCH\n18 OCT 2026 06:00 CEST\n01 | Küste ⚓\nPRIORITY: HIGH\nÖl und Häfen\n```';
  app.element('#tokenField').value='test-secret';
}
test('empty text and missing token never send a request',async()=>{
  const app=setup();await app.save();assert.equal(app.requests.length,0);
  fill(app);app.element('#tokenField').value='';await app.save();
  assert.equal(app.requests.length,0);assert.equal(app.element('#repoSettings').open,true);
});
test('saves current Unicode markdown, date and stand; keeps token out of storage and file',async()=>{
  const app=setup();fill(app);await app.save();
  const request=app.requests[0];const body=JSON.parse(request.options.body);
  const text=Buffer.from(body.content,'base64').toString('utf8');
  assert.match(request.url,/\/contents\/watches\/2026\/10\/Daily_Telegram_Watch_2026-10-18_/);
  assert.match(text,/watch_date: "2026-10-18"/);assert.match(text,/watch_time: "06:00 CEST"/);
  assert.match(text,/## 01 \| Küste ⚓/);assert.match(text,/Öl und Häfen/);
  assert.doesNotMatch(text,/```|test-secret/);assert.equal(body.branch,'main');
  assert.equal(request.options.headers.Authorization,'Bearer test-secret');
  assert.ok(!JSON.stringify([...app.storage]).includes('test-secret'));
  assert.equal(app.element('#repoStatus').children.length,1);
  assert.equal(app.element('#repoSaveBtn').disabled,false);
  await app.save();assert.notEqual(app.requests[1].url,request.url);
});
test('edited date and stand are used without a prior preview',async()=>{
  const app=setup();fill(app);app.element('#dateField').value='2026-09-30';
  app.element('#timeField').value='12:00 UTC';await app.save();
  const text=Buffer.from(JSON.parse(app.requests[0].options.body).content,'base64').toString('utf8');
  assert.match(app.requests[0].url,/watches\/2026\/09\//);assert.match(text,/watch_time: "12:00 UTC"/);
});
for(const status of [401,403,404,409,422,500]){
  test(`HTTP ${status} reports failure and enables retry`,async()=>{
    const app=setup({status});fill(app);await app.save();
    assert.equal(app.element('#repoStatus').children.length,0);
    assert.ok(app.element('#repoStatus').textContent.length>10);
    assert.equal(app.element('#repoSaveBtn').disabled,false);
  });
}
test('network ambiguity asks to check repository before retrying',async()=>{
  const app=setup({network:true});fill(app);await app.save();
  assert.match(app.element('#repoStatus').textContent,/im Repository prüfen/);
});
test('saving works with blocked local storage',async()=>{
  const app=setup({blockedStorage:true});fill(app);await app.save();
  assert.equal(app.requests.length,1);assert.equal(app.element('#repoStatus').children.length,1);
});
test('double clicks are ignored while saving, and token can be cleared',async()=>{
  const app=setup();fill(app);await Promise.all([app.save(),app.save()]);
  assert.equal(app.requests.length,1);app.element('#forgetTokenBtn').events.click();
  assert.equal(app.element('#tokenField').value,'');
});
