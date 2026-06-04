/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
const state = {
    tabs: [{
        id: 0,
        name: 'main',
        isMain: true,
        blocks: [],
        connections: [],
        localVars: [],
        params: [],
        returns: []
    }],
    activeTab: 0,
    nextTabId: 1,
    globalVars: [],
    initCode: '',
    libCode: '',
    libBlocks: [],
    canvasState: {
        0: {
            offsetX: 0,
            offsetY: 0,
            scale: 1
        }
    },
    dragging: null,
    connecting: null,
    connectingMouse: null,
    selected: null,
    tool: 'select',
    pan: {
        active: false
    },
    nextBlockId: 1,
    nextVarId: 1,
    ctxTarget: null,
};