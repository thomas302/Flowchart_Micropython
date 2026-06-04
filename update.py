
with open('./main.html', 'r', encoding='utf-8') as f:
    c = f.read()


# ═══════════════════════════════════════════════════════
# FIX 1 — read_var / set_var get a 'vartype' field so
#          openEditModal can render a datalist dropdown.
#          data_blk stays as plain text.
# ═══════════════════════════════════════════════════════

# Mark read_var and set_var fields with type:'var' so the modal knows to make a combobox
c = c.replace(
    "  read_var:   { label:'Read',    color:'#c97bff', cat:'value',   compact:true,  flowIn:false, flowOut:false, extraFlows:[], ports:{in:[],out:[{l:'val'}]}, fields:[{k:'name',label:'Var',default:'x'}] },",
    "  read_var:   { label:'Read',    color:'#c97bff', cat:'value',   compact:true,  flowIn:false, flowOut:false, extraFlows:[], ports:{in:[],out:[{l:'val'}]}, fields:[{k:'name',label:'Var',default:'x',type:'var'}] },"
)
c = c.replace(
    "  set_var:    { label:'Set',     color:'#c97bff', cat:'value',   compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'val'}],out:[]}, fields:[{k:'name',label:'Var',default:'x'}] },",
    "  set_var:    { label:'Set',     color:'#c97bff', cat:'value',   compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'val'}],out:[]}, fields:[{k:'name',label:'Var',default:'x',type:'var'}] },"
)

# ═══════════════════════════════════════════════════════
# FIX 2 — New list block defs + mux/demux + palette group
# ═══════════════════════════════════════════════════════

old_misc = """  // MISC
  delay:      { label:'Delay',   color:'#ff9f43', cat:'misc',    compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'ms'}],out:[]}, fields:[{k:'ms',label:'ms',default:'1000'}] },
  print_blk:  { label:'Print',   color:'#ff9f43', cat:'misc',    compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'val'}],out:[]}, fields:[] },
  ret_block:  { label:'Return',  color:'#ff6b6b', cat:'func',    compact:false, flowIn:true,  flowOut:false, extraFlows:[], ports:{in:[],out:[]}, fields:[] },
};"""

new_misc = """  // MISC
  delay:      { label:'Delay',   color:'#ff9f43', cat:'misc',    compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'ms'}],out:[]}, fields:[{k:'ms',label:'ms',default:'1000'}] },
  print_blk:  { label:'Print',   color:'#ff9f43', cat:'misc',    compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'val'}],out:[]}, fields:[] },
  ret_block:  { label:'Return',  color:'#ff6b6b', cat:'func',    compact:false, flowIn:true,  flowOut:false, extraFlows:[], ports:{in:[],out:[]}, fields:[] },
  // LISTS — mux/demux (tuple pack/unpack) + list mutation blocks
  mux:        { label:'Pack',    color:'#4af0ff', cat:'list', compact:false, flowIn:false, flowOut:false, extraFlows:[], ports:{in:[],out:[{l:'tuple'}]},        fields:[{k:'n',label:'Items',default:'2',type:'count'}] },
  demux:      { label:'Unpack',  color:'#4af0ff', cat:'list', compact:false, flowIn:false, flowOut:false, extraFlows:[], ports:{in:[{l:'tuple'}],out:[]},        fields:[{k:'n',label:'Items',default:'2',type:'count'}] },
  list_new:   { label:'New List',color:'#4af0ff', cat:'list', compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[],out:[]},                   fields:[{k:'name',label:'Var',default:'lst',type:'var'}] },
  list_append:{ label:'Append',  color:'#4af0ff', cat:'list', compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'val'}],out:[]},          fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
  list_insert:{ label:'Insert',  color:'#4af0ff', cat:'list', compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'idx'},{l:'val'}],out:[]},fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
  list_del:   { label:'Del[i]',  color:'#4af0ff', cat:'list', compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[{l:'idx'}],out:[]},          fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
  list_del_end:{ label:'Del End',color:'#4af0ff', cat:'list', compact:false, flowIn:true,  flowOut:true,  extraFlows:[], ports:{in:[],out:[]},                   fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
  list_get:   { label:'Get[i]',  color:'#4af0ff', cat:'list', compact:false, flowIn:false, flowOut:false, extraFlows:[], ports:{in:[{l:'idx'}],out:[{l:'val'}]}, fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
  list_len:   { label:'Len',     color:'#4af0ff', cat:'list', compact:true,  flowIn:false, flowOut:false, extraFlows:[], ports:{in:[],out:[{l:'len'}]},          fields:[{k:'name',label:'List',default:'lst',type:'var'}] },
};"""

c = c.replace(old_misc, new_misc)

# Add Lists to palette groups
c = c.replace(
    "  { title:'Functions',types:['ret_block'] },",
    "  { title:'Functions',types:['ret_block'] },\n  { title:'Lists',    types:['mux','demux','list_new','list_append','list_insert','list_del','list_del_end','list_get','list_len'] },"
)

# ═══════════════════════════════════════════════════════
# FIX 3 — Loop tabs: double-clicking for/while opens a
#          loop body tab instead of edit modal.
#          Tabs get a loopBlock ref and isLoop flag.
#          Code gen reads from loop tab body.
# ═══════════════════════════════════════════════════════

# dblclick handler — intercept loops
c = c.replace(
    """canvas.addEventListener('dblclick', e => {
  const {x:wx,y:wy}=toWorld(e.offsetX,e.offsetY);
  const block=hitBlock(wx,wy);
  if (block) openEditModal(block);
});""",
    """canvas.addEventListener('dblclick', e => {
  const {x:wx,y:wy}=toWorld(e.offsetX,e.offsetY);
  const block=hitBlock(wx,wy);
  if (!block) return;
  if (block.type==='for_loop'||block.type==='while_loop') {
    openLoopTab(block); return;
  }
  openEditModal(block);
});"""
)

# switchTab — add isLoop tab icon support
c = c.replace(
    """    el.innerHTML=`<span style="font-size:10px;opacity:.6">${tab.isMain?'⬡':'ƒ'}</span>
      <span>${tab.name}</span>
      ${!tab.isMain?`<span class="tab-close" data-close="${tab.id}">×</span>`:''}`;""",
    """    const icon = tab.isMain?'⬡': tab.isLoop?'↻':'ƒ';
    el.innerHTML=`<span style="font-size:10px;opacity:.6">${icon}</span>
      <span>${tab.name}</span>
      ${!tab.isMain?`<span class="tab-close" data-close="${tab.id}">×</span>`:''}`;"""
)

# removeTab — also clean up loop_* defs
c = c.replace(
    "  const i=state.tabs.findIndex(t=>t.id===id); if(i<0)return;\n  state.tabs.splice(i,1); delete state.canvasState[id]; delete BLOCK_DEFS['call_fn_'+id];",
    "  const i=state.tabs.findIndex(t=>t.id===id); if(i<0)return;\n  state.tabs.splice(i,1); delete state.canvasState[id]; delete BLOCK_DEFS['call_fn_'+id]; delete BLOCK_DEFS['loop_'+id];"
)

# buildSidebar — loop tabs show no fn-vars-section
c = c.replace(
    "  document.getElementById('fn-vars-section').style.display=tab?.isMain?'none':'';",
    "  document.getElementById('fn-vars-section').style.display=(tab?.isMain||tab?.isLoop)?'none':'';"
)

# ═══════════════════════════════════════════════════════
# FIX 3b — openLoopTab function (insert before buildPalette)
# ═══════════════════════════════════════════════════════

c = c.replace(
    "/* ══════════════════════════════════════\n   PALETTE\n══════════════════════════════════════ */",
    r"""/* ══════════════════════════════════════
   LOOP TABS
══════════════════════════════════════ */
function openLoopTab(block) {
  // If a tab already exists for this block, switch to it
  const existing = state.tabs.find(t => t.loopBlock === block.id);
  if (existing) { switchTab(existing.id); return; }

  const def = getBlockDef(block.type);
  const label = block.type==='for_loop'
    ? `for ${block.data?.var||'i'}`
    : `while`;
  const id = state.nextTabId++;
  state.tabs.push({
    id, name: label, isMain:false, isLoop:true, loopBlock:block.id,
    loopType: block.type,
    blocks:[], connections:[], localVars:[], params:[], returns:[]
  });
  state.canvasState[id]={offsetX:60,offsetY:60,scale:1};
  switchTab(id);
}

/* ══════════════════════════════════════
   PALETTE
══════════════════════════════════════ */"""
)

# ═══════════════════════════════════════════════════════
# FIX 3c — Code gen: loops use their tab body if present
# ═══════════════════════════════════════════════════════

c = c.replace(
    """      case 'for_loop':{
        const iter=resolveDataIn(block,0,conns,blocks);
        code+=ind(il)+`for ${block.data?.var||'i'} in ${iter}:\\n`;
        const body=flowNext(block,'flowOut',conns,blocks);
        if(body) followFlow(body,depth+1); else code+=ind(il+1)+'pass\\n';
        const exit=flowNext(block,'flowExtra_0',conns,blocks);
        if(exit) followFlow(exit,depth);
        return;
      }
      case 'while_loop':{
        const cond=resolveDataIn(block,0,conns,blocks);
        code+=ind(il)+`while ${cond}:\\n`;
        const body=flowNext(block,'flowOut',conns,blocks);
        if(body) followFlow(body,depth+1); else code+=ind(il+1)+'pass\\n';
        const exit=flowNext(block,'flowExtra_0',conns,blocks);
        if(exit) followFlow(exit,depth);
        return;
      }""",
    r"""      case 'for_loop':{
        const iter=resolveDataIn(block,0,conns,blocks);
        code+=ind(il)+`for ${block.data?.var||'i'} in ${iter}:\n`;
        // Check for loop body tab first, then fall back to direct connection
        const loopTab=state.tabs.find(t=>t.loopBlock===block.id);
        if(loopTab){
          code+=generateFlowCode(loopTab, il+1);
        } else {
          const body=flowNext(block,'flowOut',conns,blocks);
          if(body) followFlow(body,depth+1); else code+=ind(il+1)+'pass\n';
        }
        const exit=flowNext(block,'flowExtra_0',conns,blocks);
        if(exit) followFlow(exit,depth);
        return;
      }
      case 'while_loop':{
        const cond=resolveDataIn(block,0,conns,blocks);
        code+=ind(il)+`while ${cond}:\n`;
        const loopTab=state.tabs.find(t=>t.loopBlock===block.id);
        if(loopTab){
          code+=generateFlowCode(loopTab, il+1);
        } else {
          const body=flowNext(block,'flowOut',conns,blocks);
          if(body) followFlow(body,depth+1); else code+=ind(il+1)+'pass\n';
        }
        const exit=flowNext(block,'flowExtra_0',conns,blocks);
        if(exit) followFlow(exit,depth);
        return;
      }"""
)

# ═══════════════════════════════════════════════════════
# FIX 2b — Code gen: list block cases
# ═══════════════════════════════════════════════════════

c = c.replace(
    "      case 'break_blk':  code+=ind(il)+'break\\n'; return;\n      case 'ret_block':  code+=ind(il)+'return\\n'; return;",
    r"""      case 'break_blk':  code+=ind(il)+'break\n'; return;
      case 'ret_block':  code+=ind(il)+'return\n'; return;

      // LIST OPS
      case 'list_new':
        code+=ind(il)+`${block.data?.name||'lst'} = []\n`;
        break;
      case 'list_append':
        code+=ind(il)+`${block.data?.name||'lst'}.append(${resolveDataIn(block,0,conns,blocks)})\n`;
        break;
      case 'list_insert':
        code+=ind(il)+`${block.data?.name||'lst'}.insert(${resolveDataIn(block,0,conns,blocks)}, ${resolveDataIn(block,1,conns,blocks)})\n`;
        break;
      case 'list_del':
        code+=ind(il)+`del ${block.data?.name||'lst'}[${resolveDataIn(block,0,conns,blocks)}]\n`;
        break;
      case 'list_del_end':
        code+=ind(il)+`${block.data?.name||'lst'}.pop()\n`;
        break;"""
)

# ═══════════════════════════════════════════════════════
# FIX 2c — resolveBlockOutput: handle mux, demux, list_get, list_len
# ═══════════════════════════════════════════════════════

c = c.replace(
    "/** Resolve the expression a block outputs at output port idx */\nfunction resolveBlockOutput(block,outIdx,conns,blocks){",
    """/** Resolve the expression a block outputs at output port idx */
function resolveBlockOutput(block,outIdx,conns,blocks){
  // List / tuple blocks
  if(block.type==='mux'){
    // Collect all connected inputs and pack as tuple
    const n=parseInt(block.data?.n||2);
    const items=[];
    for(let i=0;i<n;i++) items.push(resolveDataIn(block,i,conns,blocks));
    return `(${items.join(', ')})`;
  }
  if(block.type==='demux'){
    // Output port outIdx unpacks element outIdx of the connected tuple
    const src=resolveDataIn(block,0,conns,blocks);
    return `${src}[${outIdx}]`;
  }
  if(block.type==='list_get')  return `${block.data?.name||'lst'}[${resolveDataIn(block,0,conns,blocks)}]`;
  if(block.type==='list_len')  return `len(${block.data?.name||'lst'})`;"""
)

# ═══════════════════════════════════════════════════════
# FIX 2d — blockSize: mux/demux have dynamic port count
# ═══════════════════════════════════════════════════════

c = c.replace(
    "function blockSize(b) {\n  const def = getBlockDef(b.type);",
    """function blockSize(b) {
  // Mux/demux: dynamically add ports based on n field
  if(b.type==='mux'||b.type==='demux'){
    const n=Math.max(2,parseInt(b.data?.n||2));
    const def2=Object.assign({},getBlockDef(b.type));
    if(b.type==='mux')   def2.ports={in:Array.from({length:n},(_,i)=>({l:'v'+i})),out:[{l:'tuple'}]};
    if(b.type==='demux') def2.ports={in:[{l:'tuple'}],out:Array.from({length:n},(_,i)=>({l:'v'+i}))};
    const bw=BW_NORMAL;
    const maxPorts=Math.max((def2.ports.in||[]).length,(def2.ports.out||[]).length,1);
    const bh=Math.max(BH_NORMAL, PORT_MARGIN*2+maxPorts*PORT_SPACING+28);
    return {bw,bh,def:def2};
  }
  const def = getBlockDef(b.type);"""
)

# blockSize return must pass def for mux/demux – but callers only use bw/bh,
# so the extra def field is harmless. Make sure the fallthrough also returns {bw,bh}
# (already does). We need getPortPos to use the overridden def for mux/demux:
c = c.replace(
    "function getPortPos(block, portType, idx) {\n  const def = getBlockDef(block.type);\n  const { bw, bh } = blockSize(block);",
    """function getPortPos(block, portType, idx) {
  const sizeInfo = blockSize(block);
  const def = sizeInfo.def || getBlockDef(block.type);
  const { bw, bh } = sizeInfo;"""
)

# drawBlock also needs the dynamic def for mux/demux ports
c = c.replace(
    "function drawBlock(block) {\n  const def = getBlockDef(block.type);\n  const { bw, bh } = blockSize(block);",
    """function drawBlock(block) {
  const sizeInfo = blockSize(block);
  const def = sizeInfo.def || getBlockDef(block.type);
  const { bw, bh } = sizeInfo;"""
)

# hitPort also needs it
c = c.replace(
    "function hitPort(wx,wy,block) {\n  const def = getBlockDef(block.type);\n  const R = 11;",
    """function hitPort(wx,wy,block) {
  const sizeInfo = blockSize(block);
  const def = sizeInfo.def || getBlockDef(block.type);
  const R = 11;"""
)

# ═══════════════════════════════════════════════════════
# FIX 1b — openEditModal: render 'var' fields as combobox
#           and 'count' fields as number input
# ═══════════════════════════════════════════════════════

c = c.replace(
    """  const body=document.getElementById('edit-modal-body'); body.innerHTML='';
  if(!(def.fields||[]).length) body.innerHTML='<p style="color:var(--text3);font-size:11px">No editable fields.</p>';
  for(const f of (def.fields||[])){
    const lbl=document.createElement('label'); lbl.textContent=f.label;
    const inp=document.createElement('input'); inp.type='text';
    inp.value=block.data?.[f.k]??f.default??''; inp.dataset.field=f.k;
    body.appendChild(lbl); body.appendChild(inp);
  }
  document.getElementById('edit-modal').classList.add('show');""",
    """  const body=document.getElementById('edit-modal-body'); body.innerHTML='';
  if(!(def.fields||[]).length) body.innerHTML='<p style="color:var(--text3);font-size:11px">No editable fields.</p>';
  for(const f of (def.fields||[])){
    const lbl=document.createElement('label'); lbl.textContent=f.label;
    if(f.type==='var'){
      // Combobox: datalist of all in-scope var names, but freely typeable
      const allVars=getAllVarNames();
      const listId='varlist_'+f.k;
      const dl=document.createElement('datalist'); dl.id=listId;
      allVars.forEach(n=>{const o=document.createElement('option');o.value=n;dl.appendChild(o);});
      const inp=document.createElement('input'); inp.type='text'; inp.setAttribute('list',listId);
      inp.value=block.data?.[f.k]??f.default??''; inp.dataset.field=f.k;
      body.appendChild(lbl); body.appendChild(dl); body.appendChild(inp);
    } else if(f.type==='count'){
      const inp=document.createElement('input'); inp.type='number'; inp.min='1'; inp.max='16';
      inp.value=block.data?.[f.k]??f.default??'2'; inp.dataset.field=f.k;
      body.appendChild(lbl); body.appendChild(inp);
    } else {
      const inp=document.createElement('input'); inp.type='text';
      inp.value=block.data?.[f.k]??f.default??''; inp.dataset.field=f.k;
      body.appendChild(lbl); body.appendChild(inp);
    }
  }
  document.getElementById('edit-modal').classList.add('show');"""
)

# Add getAllVarNames helper before openEditModal
c = c.replace(
    "/* ══════════════════════════════════════\n   EDIT MODAL\n══════════════════════════════════════ */",
    """/* ══════════════════════════════════════
   EDIT MODAL
══════════════════════════════════════ */
/** Collect all variable names visible in the current scope */
function getAllVarNames(){
  const names=new Set();
  state.globalVars.forEach(v=>names.add(v.name));
  const tab=activeTab();
  if(tab&&!tab.isMain){
    tab.localVars.forEach(v=>names.add(v.name));
    tab.params.forEach(v=>names.add(v.name));
    tab.returns.forEach(v=>names.add(v.name));
  }
  // Also scrape set_var block names from the active canvas
  activeBlocks().filter(b=>b.type==='set_var'||b.type==='list_new'||b.type==='list_append'||b.type==='list_insert'||b.type==='list_del'||b.type==='list_del_end')
    .forEach(b=>{ if(b.data?.name) names.add(b.data.name); });
  return [...names].sort();
}"""
)

with open('main2.html', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done,", c.count('\n'), "lines")
