'use strict';

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
	hoveredConn: null,
	draggingWaypoint: null,
};

/* ══════════════════════════════════════
   BLOCK DEFINITIONS
══════════════════════════════════════ */

const BW_NORMAL = 170;
const BW_COMPACT = 80;
const BH_NORMAL = 46;
const BH_COMPACT = 32;
const PORT_R = 6;
const FLOW_R = 7;
const PORT_SPACING = 18;
const PORT_MARGIN = 10;

const OP_SYMS = {
    op_add: '+',
    op_sub: '−',
    op_mul: '×',
    op_div: '÷',
    op_mod: '%',
    op_eq: '==',
    op_neq: '!=',
    op_lt: '<',
    op_gt: '>',
    op_and: 'and',
    op_or: 'or',
    op_not: 'not'
};

const BLOCK_DEFS = {
    // FLOW
    start: {
        label: 'START',
        color: '#4af0b0',
        cat: 'flow',
        compact: false,
        flowIn: false,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    end_main: {
        label: 'END',
        color: '#4af0b0',
        cat: 'flow',
        compact: false,
        flowIn: true,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    comment: {
        label: 'Comment',
        color: '#5a6478',
        cat: 'flow',
        compact: false,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: [{
            k: 'text',
            label: 'Text',
            default: 'comment'
        }]
    },
    // CONTROL — no more extraFlows on loops
    if_block: {
        label: 'IF',
        color: '#ffc85a',
        cat: 'control',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: ['false'],
        ports: {
            in: [{
                l: 'cond'
            }],
            out: []
        },
        fields: []
    },
    for_loop: {
        label: 'FOR',
        color: '#ffc85a',
        cat: 'control',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'iter'
            }],
            out: []
        },
        fields: [{
            k: 'var',
            label: 'Var',
            default: 'i'
        }]
    },
    while_loop: {
        label: 'WHILE',
        color: '#ffc85a',
        cat: 'control',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'cond'
            }],
            out: []
        },
        fields: []
    },
    break_blk: {
        label: 'BREAK',
        color: '#ff6b6b',
        cat: 'control',
        compact: false,
        flowIn: true,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    // LOOP BODY anchors — only appear inside loop tabs
    loop_start: {
        label: 'LOOP START',
        color: '#ffc85a',
        cat: 'loop',
        compact: false,
        flowIn: false,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    loop_end: {
        label: 'LOOP END',
        color: '#ffc85a',
        cat: 'loop',
        compact: false,
        flowIn: true,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    // VALUES
    read_var: {
        label: 'Read',
        color: '#c97bff',
        cat: 'value',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: [{
                l: 'val'
            }]
        },
        fields: [{
            k: 'name',
            label: 'Var',
            default: 'x',
            type: 'var'
        }]
    },
    set_var: {
        label: 'Set',
        color: '#c97bff',
        cat: 'value',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'val'
            }],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'Var',
            default: 'x',
            type: 'var'
        }]
    },
    data_blk: {
        label: 'Data',
        color: '#c97bff',
        cat: 'value',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: [{
                l: 'val'
            }]
        },
        fields: [{
            k: 'value',
            label: 'Val',
            default: '0'
        }]
    },
    // OPERATORS
    op_add: {
        label: '+',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_sub: {
        label: '−',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_mul: {
        label: '×',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_div: {
        label: '÷',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_mod: {
        label: '%',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_eq: {
        label: '==',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_neq: {
        label: '!=',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_lt: {
        label: '<',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_gt: {
        label: '>',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_and: {
        label: 'and',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_or: {
        label: 'or',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }, {
                l: 'b'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }, {
            k: 'b',
            label: 'b',
            default: '_'
        }]
    },
    op_not: {
        label: 'not',
        color: '#5b8fff',
        cat: 'op',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'a'
            }],
            out: [{
                l: 'res'
            }]
        },
        fields: [{
            k: 'a',
            label: 'a',
            default: '_'
        }]
    },
    // MISC
    delay: {
        label: 'Delay',
        color: '#ff9f43',
        cat: 'misc',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'ms'
            }],
            out: []
        },
        fields: [{
            k: 'ms',
            label: 'ms',
            default: '1000'
        }]
    },
    print_blk: {
        label: 'Print',
        color: '#ff9f43',
        cat: 'misc',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'val'
            }],
            out: []
        },
        fields: []
    },
    ret_block: {
        label: 'Return',
        color: '#ff6b6b',
        cat: 'func',
        compact: false,
        flowIn: true,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: []
    },
    // LISTS
    mux: {
        label: 'Pack',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: [{
                l: 'tuple'
            }]
        },
        fields: [{
            k: 'n',
            label: 'Items',
            default: '2',
            type: 'count'
        }]
    },
    demux: {
        label: 'Unpack',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'tuple'
            }],
            out: []
        },
        fields: [{
            k: 'n',
            label: 'Items',
            default: '2',
            type: 'count'
        }]
    },
    list_new: {
        label: 'New List',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'Var',
            default: 'lst',
            type: 'var'
        }]
    },
    list_append: {
        label: 'Append',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'val'
            }],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
    list_insert: {
        label: 'Insert',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'idx'
            }, {
                l: 'val'
            }],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
    list_del: {
        label: 'Del[i]',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [{
                l: 'idx'
            }],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
    list_del_end: {
        label: 'Del End',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: true,
        flowOut: true,
        extraFlows: [],
        ports: {
            in: [],
            out: []
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
    list_get: {
        label: 'Get[i]',
        color: '#4af0ff',
        cat: 'list',
        compact: false,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [{
                l: 'idx'
            }],
            out: [{
                l: 'val'
            }]
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
    list_len: {
        label: 'Len',
        color: '#4af0ff',
        cat: 'list',
        compact: true,
        flowIn: false,
        flowOut: false,
        extraFlows: [],
        ports: {
            in: [],
            out: [{
                l: 'len'
            }]
        },
        fields: [{
            k: 'name',
            label: 'List',
            default: 'lst',
            type: 'var'
        }]
    },
};

const PALETTE_GROUPS = [{
        title: 'Flow',
        types: ['start', 'end_main', 'comment']
    },
    {
        title: 'Control',
        types: ['if_block', 'for_loop', 'while_loop', 'break_blk']
    },
    {
        title: 'Values',
        types: ['read_var', 'set_var', 'data_blk']
    },
    {
        title: 'Operators',
        types: ['op_add', 'op_sub', 'op_mul', 'op_div', 'op_mod', 'op_eq', 'op_neq', 'op_lt', 'op_gt', 'op_and', 'op_or', 'op_not']
    },
    {
        title: 'Misc',
        types: ['delay', 'print_blk']
    },
    {
        title: 'Functions',
        types: ['ret_block']
    },
    {
        title: 'Loop Body',
        types: ['loop_start', 'loop_end', 'break_blk']
    }, // shown only in loop tabs
    {
        title: 'Lists',
        types: ['mux', 'demux', 'list_new', 'list_append', 'list_insert', 'list_del', 'list_del_end', 'list_get', 'list_len']
    },
];

/* ══════════════════════════════════════
   CANVAS SETUP
══════════════════════════════════════ */
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const wrap = document.getElementById('canvas-wrap');

function resize() {
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    draw();
}
window.addEventListener('resize', resize);

function getCS() {
    if (!state.canvasState[state.activeTab])
        state.canvasState[state.activeTab] = {
            offsetX: 0,
            offsetY: 0,
            scale: 1
        };
    return state.canvasState[state.activeTab];
}

function toWorld(sx, sy) {
    const c = getCS();
    return {
        x: (sx - c.offsetX) / c.scale,
        y: (sy - c.offsetY) / c.scale
    };
}

function activeTab() {
    return state.tabs.find(t => t.id === state.activeTab);
}

function activeBlocks() {
    return activeTab()?.blocks || [];
}

function activeConns() {
    return activeTab()?.connections || [];
}

/* ══════════════════════════════════════
   BLOCK GEOMETRY
══════════════════════════════════════ */
function getBlockDef(type) {
    return BLOCK_DEFS[type] ||
        state.libBlocks.find(lb => lb.type === type) ||
        {
            label: type,
            color: '#888',
            cat: 'lib',
            compact: false,
            flowIn: true,
            flowOut: true,
            extraFlows: [],
            ports: {
                in: [],
                out: []
            },
            fields: []
        };
}

function blockSize(b) {
    if (b.type === 'mux' || b.type === 'demux') {
        const n = Math.max(2, parseInt(b.data?.n || 2));
        const def2 = Object.assign({}, getBlockDef(b.type));
        if (b.type === 'mux') def2.ports = {
            in: Array.from({
                length: n
            }, (_, i) => ({
                l: 'v' + i
            })),
            out: [{
                l: 'tuple'
            }]
        };
        if (b.type === 'demux') def2.ports = {
            in: [{
                l: 'tuple'
            }],
            out: Array.from({
                length: n
            }, (_, i) => ({
                l: 'v' + i
            }))
        };
        const bw = BW_NORMAL;
        const maxPorts = Math.max((def2.ports.in || []).length, (def2.ports.out || []).length, 1);
        const bh = Math.max(BH_NORMAL, PORT_MARGIN * 2 + maxPorts * PORT_SPACING + 28);
        return {
            bw,
            bh,
            def: def2
        };
    }
    const def = getBlockDef(b.type);
    const bw = def.compact ? BW_COMPACT : BW_NORMAL;
    let bh;
    if (def.compact) {
        const maxPorts = Math.max((def.ports.in || []).length, (def.ports.out || []).length, 1);
        bh = Math.max(BH_COMPACT, PORT_MARGIN * 2 + maxPorts * PORT_SPACING);
    } else {
        bh = BH_NORMAL + (def.fields || []).length * 18 + (def.extraFlows || []).length * 18;
        const maxPorts = Math.max((def.ports.in || []).length, (def.ports.out || []).length, 0);
        if (maxPorts > 0) bh = Math.max(bh, PORT_MARGIN * 2 + maxPorts * PORT_SPACING + (def.flowIn ? 14 : 0) + (def.flowOut ? 14 : 0));
    }
    return {
        bw,
        bh
    };
}

function getPortPos(block, portType, idx) {
    const sizeInfo = blockSize(block);
    const def = sizeInfo.def || getBlockDef(block.type);
    const {
        bw,
        bh
    } = sizeInfo;

    if (portType === 'flowIn') return {
        x: block.x + bw / 2,
        y: block.y
    };
    if (portType === 'flowOut') return {
        x: block.x + bw / 2,
        y: block.y + bh
    };
    if (portType.startsWith('flowExtra_')) {
        const ei = parseInt(portType.split('_')[1]);
        return {
            x: block.x + bw / 2 + (ei + 1) * 26,
            y: block.y + bh
        };
    }

    const topExclude = (def.flowIn !== false) ? 14 : 4;
    const bottomExclude = (def.flowOut !== false) ? 14 : 4;
    const contentH = bh - topExclude - bottomExclude;

    if (portType === 'dataIn') {
        const total = (def.ports?.in || []).length;
        const spacing = total > 1 ? contentH / (total + 1) : contentH / 2;
        const y = block.y + topExclude + spacing * (idx + 1);
        return {
            x: block.x,
            y
        };
    }
    if (portType === 'dataOut') {
        const total = (def.ports?.out || []).length;
        const spacing = total > 1 ? contentH / (total + 1) : contentH / 2;
        const y = block.y + topExclude + spacing * (idx + 1);
        return {
            x: block.x + bw,
            y
        };
    }
    return {
        x: block.x,
        y: block.y
    };
}

/* ══════════════════════════════════════
   DRAW
══════════════════════════════════════ */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cs = getCS();
    ctx.save();
    ctx.translate(cs.offsetX, cs.offsetY);
    ctx.scale(cs.scale, cs.scale);

    for (const conn of activeConns()) drawConnection(conn);

    if (state.connecting && state.connectingMouse) {
        const p = getPortPos(state.connecting.block, state.connecting.portType, state.connecting.idx || 0);
        const m = state.connectingMouse;
        drawBezier(p.x, p.y, m.x, m.y, state.connecting.isFlow ? '#5b8fff99' : '#c97bff99', 1.5);
    }

    for (const block of activeBlocks()) drawBlock(block);
    ctx.restore();
}

function drawBlock(block) {
    const sizeInfo = blockSize(block);
    const def = sizeInfo.def || getBlockDef(block.type);
    const {
        bw,
        bh
    } = sizeInfo;
    const sel = state.selected?.id === block.id;
    const isLoopAnchor = block.type === 'loop_start' || block.type === 'loop_end';

    // Shadow + body
    ctx.shadowColor = sel ? def.color + '50' : isLoopAnchor ? 'rgba(255,200,90,0.15)' : 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = sel ? 16 : isLoopAnchor ? 10 : 7;
    ctx.shadowOffsetY = 2;
    roundRect(ctx, block.x, block.y, bw, bh, 7);
    ctx.fillStyle = isLoopAnchor ? '#1e1c10' : '#1a1e28';
    ctx.fill();
    ctx.strokeStyle = sel ? def.color : isLoopAnchor ? 'rgba(255,200,90,0.4)' : '#2a3045';
    ctx.lineWidth = sel ? 2 : isLoopAnchor ? 1.5 : 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Left color bar
    roundRectLeft(ctx, block.x, block.y, 5, bh, 7);
    ctx.fillStyle = def.color;
    ctx.fill();

    // Label
    ctx.textBaseline = 'middle';
    if (def.cat === 'op') {
        const sym = OP_SYMS[block.type] || def.label;
        const va = block.data?.a || 'a';
        const vb = block.data?.b || 'b';
        const displayLabel = block.type === 'op_not' ? `not ${va}` : `${va} ${sym} ${vb}`;
        ctx.fillStyle = def.color;
        ctx.font = `600 11px 'JetBrains Mono', monospace`;
        ctx.fillText(displayLabel, block.x + 10, block.y + bh / 2);
    } else {
        ctx.fillStyle = def.color;
        ctx.font = `600 11px 'Syne', sans-serif`;
        ctx.fillText(def.label, block.x + 12, block.y + 15);

        // Fields
        let fy = block.y + 30;
        for (const field of (def.fields || [])) {
            const val = block.data?.[field.k] ?? field.default ?? '';
            ctx.fillStyle = '#5a6478';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(field.label + ':', block.x + 12, fy);
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText(String(val).substring(0, 16), block.x + 44, fy);
            fy += 18;
        }
    }

    // For/while: show double-click hint below label
    if ((block.type === 'for_loop' || block.type === 'while_loop') && !sel) {
        const hasTab = state.tabs.some(t => t.loopBlock === block.id);
        ctx.fillStyle = hasTab ? '#ffc85a88' : '#5a647888';
        ctx.font = '8px JetBrains Mono';
        ctx.textBaseline = 'middle';
        ctx.fillText(hasTab ? '⟳ body defined' : '⟳ dbl-click to edit body', block.x + 12, block.y + bh - 10);
    }

    // Flow ports
    if (def.flowIn !== false) drawFlowPort(...pxy(getPortPos(block, 'flowIn', 0)), def.color);
    if (def.flowOut !== false) drawFlowPort(...pxy(getPortPos(block, 'flowOut', 0)), def.color);
    if (def.extraFlows) {
        for (let i = 0; i < def.extraFlows.length; i++) {
            const p = getPortPos(block, `flowExtra_${i}`, 0);
            drawFlowPort(p.x, p.y, '#ff9f43');
            ctx.fillStyle = '#ff9f43';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(def.extraFlows[i], p.x, p.y + 14);
            ctx.textAlign = 'left';
        }
    }

    // Data IN ports
    const dIn = def.ports?.in || [];
    for (let i = 0; i < dIn.length; i++) {
        const p = getPortPos(block, 'dataIn', i);
        drawDataPort(p.x, p.y, '#c97bff');
        ctx.fillStyle = '#8892aa';
        ctx.font = '8px JetBrains Mono';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(dIn[i].l, block.x + 9, p.y);
    }

    // Data OUT ports
    const dOut = def.ports?.out || [];
    for (let i = 0; i < dOut.length; i++) {
        const p = getPortPos(block, 'dataOut', i);
        drawDataPort(p.x, p.y, '#c97bff');
        ctx.fillStyle = '#8892aa';
        ctx.font = '8px JetBrains Mono';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillText(dOut[i].l, block.x + bw - 9, p.y);
    }
    ctx.textAlign = 'left';

    if (def.cat === 'call') {
        ctx.fillStyle = '#5b8fff';
        ctx.font = '9px JetBrains Mono';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.fnName + '()', block.x + 12, block.y + 30);
    }
}

function pxy(p) {
    return [p.x, p.y];
}

function drawFlowPort(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, FLOW_R, 0, Math.PI * 2);
    ctx.fillStyle = '#13161d';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawDataPort(x, y, color) {
    ctx.beginPath();
    ctx.rect(x - PORT_R, y - PORT_R, PORT_R * 2, PORT_R * 2);
    ctx.fillStyle = '#13161d';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x - 2.5, y - 2.5, 5, 5);
    ctx.fill();
}

function drawConnection(conn) {
    const fb = activeBlocks().find(b => b.id === conn.fromBlock);
    const tb = activeBlocks().find(b => b.id === conn.toBlock);
    if (!fb || !tb) return;
    const from = getPortPos(fb, conn.fromPort, conn.fromIdx || 0);
    const to   = getPortPos(tb, conn.toPort,   conn.toIdx   || 0);
    const isFlow = conn.fromPort.startsWith('flow');
    const sel     = state.selectedConn?.id === conn.id;
    const hovered = state.hoveredConn?.id  === conn.id;
    const color = (sel || hovered)
        ? (isFlow ? '#5b8fffdd' : '#c97bffdd')
        : (isFlow ? '#5b8fff70' : '#c97bff70');
    const lw = sel ? (isFlow ? 3.5 : 3) : (isFlow ? 2 : 1.5);

    const pts = [from, ...(conn.waypoints || []), to];
    for (let i = 0; i < pts.length - 1; i++) {
        drawBezier(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y, color, lw);
    }

    // Draw waypoint handles on hover or select
    if ((hovered || sel) && conn.waypoints) {
        for (const wp of conn.waypoints) {
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#1a1e28';
            ctx.fill();
            ctx.strokeStyle = isFlow ? '#5b8fffdd' : '#c97bffdd';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function drawBezier(x1, y1, x2, y2, color, lw) {
    const dx = x2 - x1, dy = y2 - y1;
    const cp = Math.max(40, Math.abs(dy) * 0.5, Math.abs(dx) * 0.5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 + cp * Math.sign(dx || 1), y1, x2 - cp * Math.sign(dx || 1), y2, x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

function roundRectLeft(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

/* ══════════════════════════════════════
   HIT TESTING
══════════════════════════════════════ */
function hitBlock(wx, wy) {
    const blocks = activeBlocks();
    for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        const {
            bw,
            bh
        } = blockSize(b);
        if (wx >= b.x && wx <= b.x + bw && wy >= b.y && wy <= b.y + bh) return b;
    }
    return null;
}

function hitPort(wx, wy, block) {
    const sizeInfo = blockSize(block);
    const def = sizeInfo.def || getBlockDef(block.type);
    const R = 35;

    if (def.flowIn !== false) {
        const p = getPortPos(block, 'flowIn', 0);
        if (Math.hypot(wx - p.x, wy - p.y) < R) return {
            portType: 'flowIn',
            idx: 0,
            isFlow: true
        };
    }
    if (def.flowOut !== false) {
        const p = getPortPos(block, 'flowOut', 0);
        if (Math.hypot(wx - p.x, wy - p.y) < R) return {
            portType: 'flowOut',
            idx: 0,
            isFlow: true
        };
        for (let i = 0; i < (def.extraFlows || []).length; i++) {
            const p2 = getPortPos(block, `flowExtra_${i}`, 0);
            if (Math.hypot(wx - p2.x, wy - p2.y) < R) return {
                portType: `flowExtra_${i}`,
                idx: 0,
                isFlow: true
            };
        }
    }
    const dIn = def.ports?.in || [];
    for (let i = 0; i < dIn.length; i++) {
        const p = getPortPos(block, 'dataIn', i);
        if (Math.hypot(wx - p.x, wy - p.y) < R) return {
            portType: 'dataIn',
            idx: i,
            isFlow: false
        };
    }
    const dOut = def.ports?.out || [];
    for (let i = 0; i < dOut.length; i++) {
        const p = getPortPos(block, 'dataOut', i);
        if (Math.hypot(wx - p.x, wy - p.y) < R) return {
            portType: 'dataOut',
            idx: i,
            isFlow: false
        };
    }
    return null;
}

function hitConnection(wx, wy) {
    for (let i = activeConns().length - 1; i >= 0; i--) {
        const conn = activeConns()[i];
        const fb = activeBlocks().find(b => b.id === conn.fromBlock);
        const tb = activeBlocks().find(b => b.id === conn.toBlock);
        if (!fb || !tb) continue;
        const from = getPortPos(fb, conn.fromPort, conn.fromIdx || 0);
        const to   = getPortPos(tb, conn.toPort,   conn.toIdx   || 0);
        const pts  = [from, ...(conn.waypoints || []), to];
        for (let j = 0; j < pts.length - 1; j++) {
            if (pointNearBezier(wx, wy, pts[j].x, pts[j].y, pts[j+1].x, pts[j+1].y, 8))
                return { conn, segIdx: j };
        }
    }
    return null;
}

function hitWaypoint(wx, wy, conn) {
    if (!conn.waypoints) return -1;
    for (let i = 0; i < conn.waypoints.length; i++) {
        if (Math.hypot(wx - conn.waypoints[i].x, wy - conn.waypoints[i].y) < 10) return i;
    }
    return -1;
}

function pointNearBezier(px, py, x1, y1, x2, y2, threshold) {
    const dx = x2 - x1, dy = y2 - y1;
    const cp = Math.max(40, Math.abs(dy) * 0.5, Math.abs(dx) * 0.5);
    const cx1 = x1 + cp * Math.sign(dx || 1), cy1 = y1;
    const cx2 = x2 - cp * Math.sign(dx || 1), cy2 = y2;
    for (let t = 0; t <= 1; t += 0.02) {
        const u = 1 - t;
        const bx = u*u*u*x1 + 3*u*u*t*cx1 + 3*u*t*t*cx2 + t*t*t*x2;
        const by = u*u*u*y1 + 3*u*u*t*cy1 + 3*u*t*t*cy2 + t*t*t*y2;
        if (Math.hypot(px - bx, py - by) < threshold) return true;
    }
    return false;
}

/* ══════════════════════════════════════
   MOUSE EVENTS
══════════════════════════════════════ */
canvas.addEventListener('mousedown', e => {
    if (e.button === 2) return;
    const { x: wx, y: wy } = toWorld(e.offsetX, e.offsetY);
    hideCtx();

    if (state.tool === 'pan') {
        const cs = getCS();
        state.pan = { active: true, startX: e.clientX, startY: e.clientY, startOX: cs.offsetX, startOY: cs.offsetY };
        canvas.style.cursor = 'grabbing';
        return;
    }

    const block = hitBlock(wx, wy);
    if (block) {
        const port = hitPort(wx, wy, block);
        if (port) {
            state.connecting = { block, portType: port.portType, idx: port.idx, isFlow: port.isFlow };
            state.connectingMouse = { x: wx, y: wy };
            return;
        }
        state.selectedConn = null;
        state.selected = block;
        state.dragging = { block, offX: wx - block.x, offY: wy - block.y };
        const tab = activeTab();
        const i = tab.blocks.indexOf(block);
        tab.blocks.splice(i, 1);
        tab.blocks.push(block);
        draw();
        return;
    }

    // Waypoint drag or insertion on hovered wire
    if (state.hoveredConn) {
        const wpIdx = hitWaypoint(wx, wy, state.hoveredConn);
        if (wpIdx !== -1) {
            state.draggingWaypoint = { conn: state.hoveredConn, idx: wpIdx };
            return;
        }
        const hit = hitConnection(wx, wy);
        if (hit) {
            if (!hit.conn.waypoints) hit.conn.waypoints = [];
            hit.conn.waypoints.splice(hit.segIdx, 0, { x: wx, y: wy });
            state.selectedConn = hit.conn;
            state.draggingWaypoint = { conn: hit.conn, idx: hit.segIdx };
            state.selected = null;
            draw();
            return;
        }
    }

    const hit = hitConnection(wx, wy);
    if (hit) {
        state.selectedConn = (state.selectedConn?.id === hit.conn.id) ? null : hit.conn;
        state.selected = null;
        draw();
        return;
    }

    state.selected = null;
    state.selectedConn = null;
    const cs = getCS();
    state.pan = { active: true, startX: e.clientX, startY: e.clientY, startOX: cs.offsetX, startOY: cs.offsetY };
    draw();
});

canvas.addEventListener('mousemove', e => {
    const { x: wx, y: wy } = toWorld(e.offsetX, e.offsetY);

    if (state.pan.active) {
        const cs = getCS();
        cs.offsetX = state.pan.startOX + (e.clientX - state.pan.startX);
        cs.offsetY = state.pan.startOY + (e.clientY - state.pan.startY);
        draw();
        return;
    }
    if (state.dragging) {
        state.dragging.block.x = wx - state.dragging.offX;
        state.dragging.block.y = wy - state.dragging.offY;
        draw();
        return;
    }
    if (state.draggingWaypoint) {
        const wp = state.draggingWaypoint.conn.waypoints[state.draggingWaypoint.idx];
        wp.x = wx;
        wp.y = wy;
        draw();
        return;
    }
    if (state.connecting) {
        state.connectingMouse = { x: wx, y: wy };
        draw();
        return;
    }

    const block = hitBlock(wx, wy);
    if (block) {
        if (state.hoveredConn) { state.hoveredConn = null; draw(); }
        canvas.style.cursor = hitPort(wx, wy, block) ? 'crosshair' : 'grab';
    } else {
        const hit = hitConnection(wx, wy);
        const prev = state.hoveredConn;
        state.hoveredConn = hit ? hit.conn : null;
        if (prev?.id !== state.hoveredConn?.id) draw();
        if (state.hoveredConn) {
            const wpIdx = hitWaypoint(wx, wy, state.hoveredConn);
            canvas.style.cursor = wpIdx !== -1 ? 'grab' : 'crosshair';
        } else {
            canvas.style.cursor = state.tool === 'pan' ? 'grab' : 'default';
        }
    }
});

canvas.addEventListener('mouseup', e => {
    const { x: wx, y: wy } = toWorld(e.offsetX, e.offsetY);
    if (state.pan.active) {
        state.pan.active = false;
        canvas.style.cursor = state.tool === 'pan' ? 'grab' : 'default';
    }
    if (state.draggingWaypoint) {
        state.draggingWaypoint = null;
        return;
    }
    if (state.connecting) {
        const { block: fb, portType: fp, idx: fi, isFlow: fIsFlow } = state.connecting;
        const tb = hitBlock(wx, wy);
        if (tb && tb !== fb) {
            const tp = hitPort(wx, wy, tb);
            if (tp && tp.isFlow === fIsFlow) {
                const fromIsOut = fp.startsWith('flowOut') || fp.startsWith('flowExtra') || fp === 'dataOut';
                const toIsIn = tp.portType === 'flowIn' || tp.portType === 'dataIn';
                if (fromIsOut && toIsIn) {
                    activeConns().push({
                        id: state.nextBlockId++,
                        fromBlock: fb.id, fromPort: fp, fromIdx: fi,
                        toBlock: tb.id,   toPort: tp.portType, toIdx: tp.idx,
                        waypoints: []
                    });
                }
            }
        }
        state.connecting = null;
        state.connectingMouse = null;
        draw();
        return;
    }
    if (state.dragging) {
        state.dragging = null;
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('dblclick', e => {
    const { x: wx, y: wy } = toWorld(e.offsetX, e.offsetY);
    const block = hitBlock(wx, wy);
    if (!block) {
        if (state.hoveredConn) {
            const wpIdx = hitWaypoint(wx, wy, state.hoveredConn);
            if (wpIdx !== -1) {
                state.hoveredConn.waypoints.splice(wpIdx, 1);
                draw();
                return;
            }
        }
        return;
    }
    if (block.type === 'for_loop' || block.type === 'while_loop') {
        openLoopTab(block);
        return;
    }
    openEditModal(block);
});

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const { x: wx, y: wy } = toWorld(e.offsetX, e.offsetY);
    const block = hitBlock(wx, wy);
    if (block) {
        state.ctxTarget = block;
        state.selected = block;
        const isLoop = block.type === 'for_loop' || block.type === 'while_loop';
        document.getElementById('ctx-open-loop').style.display = isLoop ? 'flex' : 'none';
        document.getElementById('ctx-loop-divider').style.display = isLoop ? 'block' : 'none';
        showCtx(e.clientX, e.clientY);
        draw();
    }
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const cs = getCS();
    const f = e.deltaY < 0 ? 1.1 : 0.9;
    const ns = Math.min(3, Math.max(0.2, cs.scale * f));
    cs.offsetX = e.offsetX - (e.offsetX - cs.offsetX) * (ns / cs.scale);
    cs.offsetY = e.offsetY - (e.offsetY - cs.offsetY) * (ns / cs.scale);
    cs.scale = ns;
    draw();
}, { passive: false });

/* ══════════════════════════════════════
   DROP FROM PALETTE
══════════════════════════════════════ */
let dragPaletteType = null;
document.getElementById('palette-scroll').addEventListener('dragstart', e => {
    const el = e.target.closest('.palette-block');
    if (el) dragPaletteType = el.dataset.type;
});
wrap.addEventListener('dragover', e => e.preventDefault());
wrap.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragPaletteType) return;
    const rect = canvas.getBoundingClientRect();
    const {
        x: wx,
        y: wy
    } = toWorld(e.clientX - rect.left, e.clientY - rect.top);
    const def = getBlockDef(dragPaletteType);
    const {
        bw,
        bh
    } = blockSize({
        type: dragPaletteType
    });
    addBlock(dragPaletteType, wx - bw / 2, wy - bh / 2);
    dragPaletteType = null;
});

function addBlock(type, x, y) {
    const def = getBlockDef(type);
    const block = {
        id: state.nextBlockId++,
        type,
        x,
        y,
        data: {}
    };
    for (const f of (def.fields || [])) block.data[f.k] = f.default ?? '';
    activeBlocks().push(block);
    state.selected = block;
    draw();
    return block;
}

/* ══════════════════════════════════════
   LOOP TABS
   Double-clicking a for/while block opens a dedicated canvas tab
   for its loop body. The body has LOOP START and LOOP END anchors.
══════════════════════════════════════ */
function openLoopTab(block) {
    // If a tab already exists for this block, just switch to it
    const existing = state.tabs.find(t => t.loopBlock === block.id);
    if (existing) {
        switchTab(existing.id);
        return;
    }

    const label = block.type === 'for_loop' ?
        `for ${block.data?.var||'i'}` :
        `while`;

    const id = state.nextTabId++;
    const loopStartId = state.nextBlockId++;
    const loopEndId = state.nextBlockId++;

    const newTab = {
        id,
        name: label,
        isMain: false,
        isLoop: true,
        loopBlock: block.id,
        loopType: block.type,
        blocks: [{
                id: loopStartId,
                type: 'loop_start',
                x: 230,
                y: 80,
                data: {}
            },
            {
                id: loopEndId,
                type: 'loop_end',
                x: 230,
                y: 300,
                data: {}
            },
        ],
        connections: [],
        localVars: [],
        params: [],
        returns: []
    };
    state.tabs.push(newTab);
    // Center the initial view
    state.canvasState[id] = {
        offsetX: 0,
        offsetY: 0,
        scale: 1
    };
    switchTab(id);
}

/* ══════════════════════════════════════
   PALETTE
══════════════════════════════════════ */
function paletteLabel(def) {
    if (def.cat === 'op') {
        const sym = OP_SYMS[def.type || ''] || def.label;
        if (def.type === 'op_not') return `not a`;
        return `a ${sym} b`;
    }
    return def.label;
}

function buildPalette() {
    const scroll = document.getElementById('palette-scroll');
    scroll.innerHTML = '';

    const tab = activeTab();
    const isLoopTab = tab?.isLoop === true;

    // Filter groups: Loop Body only inside loop tabs, Functions group hidden in loop tabs
    const groups = PALETTE_GROUPS.filter(g => {
        if (g.title === 'Loop Body') return isLoopTab;
        if (g.title === 'Functions') return !isLoopTab;
        if (g.title === 'Flow') return !isLoopTab; // START/END not needed in loop body
        return true;
    }).map(g => ({
        ...g
    }));

    // Function call blocks
    const fnTabs = state.tabs.filter(t => !t.isMain && !t.isLoop);
    if (fnTabs.length > 0) {
        groups.push({
            title: 'Calls',
            types: fnTabs.map(t => 'call_fn_' + t.id)
        });
        for (const ft of fnTabs) {
            const key = 'call_fn_' + ft.id;
            BLOCK_DEFS[key] = {
                label: ft.name,
                color: '#4af0b0',
                cat: 'call',
                compact: false,
                fnName: ft.name,
                fnTab: ft.id,
                flowIn: true,
                flowOut: true,
                extraFlows: [],
                ports: {
                    in: ft.params.map(p => ({
                        l: p.name
                    })),
                    out: ft.returns.map(r => ({
                        l: r.name
                    }))
                },
                fields: []
            };
        }
    }
    if (state.libBlocks.length > 0) groups.push({
        title: 'Library',
        types: state.libBlocks.map(b => b.type)
    });

    for (const grp of groups) {
        const g = document.createElement('div');
        g.className = 'palette-group';
        g.innerHTML = `<div class="palette-group-title">${grp.title}</div>`;
        for (const type of grp.types) {
            const def = getBlockDef(type);
            def.type = type;
            const el = document.createElement('div');
            el.className = 'palette-block';
            el.draggable = true;
            el.dataset.type = type;
            el.innerHTML = `<div class="pb-color" style="background:${def.color}"></div>
        <div class="pb-info">
          <div class="pb-name">${paletteLabel(def)}</div>
          <div class="pb-desc">${def.cat}</div>
        </div>`;
            g.appendChild(el);
        }
        scroll.appendChild(g);
    }
}

/* ══════════════════════════════════════
   TABS
══════════════════════════════════════ */
function buildTabs() {
    const bar = document.getElementById('topbar');
    bar.querySelectorAll('.tab').forEach(e => e.remove());
    const btnNew = document.getElementById('btn-new-tab');
    for (const tab of state.tabs) {
        const el = document.createElement('div');
        el.className = 'tab' + (tab.id === state.activeTab ? ' active' : '') + (tab.isLoop ? ' loop-tab' : '');
        el.dataset.tabId = tab.id;
        const icon = tab.isMain ? '⬡' : tab.isLoop ? '⟳' : 'ƒ';
        el.innerHTML = `<span style="font-size:10px;opacity:.6">${icon}</span>
      <span>${tab.name}</span>
      ${!tab.isMain?`<span class="tab-close" data-close="${tab.id}">×</span>`:''}`;
        el.addEventListener('click', e => {
            if (e.target.dataset.close) {
                removeTab(parseInt(e.target.dataset.close));
                return;
            }
            switchTab(tab.id);
        });
        bar.insertBefore(el, btnNew);
    }
}

function switchTab(id) {
    state.activeTab = id;
    // Show/hide loop context banner
    const tab = state.tabs.find(t => t.id === id);
    const bar = document.getElementById('loop-context-bar');
    const labelEl = document.getElementById('loop-context-label');
    if (bar) {
        if (tab?.isLoop) {
            bar.style.display = 'flex';
            // Find the loop block across all tabs
            let loopBlock = null;
            for (const t of state.tabs) {
                loopBlock = t.blocks?.find(b => b.id === tab.loopBlock);
                if (loopBlock) break;
            }
            if (labelEl) {
                const iterLabel = tab.loopType === 'for_loop' ?
                    `for ${loopBlock?.data?.var||'i'} in [iter]` :
                    `while [cond]`;
                labelEl.textContent = `Loop body for: ${iterLabel} — connect LOOP START → blocks → LOOP END`;
            }
        } else {
            bar.style.display = 'none';
        }
    }
    buildTabs();
    buildSidebar();
    buildPalette();
    draw();
}

function removeTab(id) {
    const i = state.tabs.findIndex(t => t.id === id);
    if (i < 0) return;
    state.tabs.splice(i, 1);
    delete state.canvasState[id];
    delete BLOCK_DEFS['call_fn_' + id];
    delete BLOCK_DEFS['loop_' + id];
    if (state.activeTab === id) state.activeTab = state.tabs[0].id;
    buildTabs();
    buildSidebar();
    buildPalette();
    draw();
}

document.getElementById('btn-new-tab').addEventListener('click', () => {
    document.getElementById('fn-name-input').value = 'my_func';
    document.getElementById('fn-modal').classList.add('show');
    document.getElementById('fn-name-input').focus();
    document.getElementById('fn-name-input').select();
});
document.getElementById('fn-cancel').addEventListener('click', () => document.getElementById('fn-modal').classList.remove('show'));
document.getElementById('fn-ok').addEventListener('click', () => {
    const name = document.getElementById('fn-name-input').value.trim() || 'func';
    const id = state.nextTabId++;
    state.tabs.push({
        id,
        name,
        isMain: false,
        isLoop: false,
        blocks: [],
        connections: [],
        localVars: [],
        params: [],
        returns: []
    });
    state.canvasState[id] = {
        offsetX: 0,
        offsetY: 0,
        scale: 1
    };
    document.getElementById('fn-modal').classList.remove('show');
    switchTab(id);
});

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
function buildSidebar() {
    const tab = activeTab();
    // Update sidebar title based on context
    const titleEl = document.getElementById('sidebar-title');
    if (titleEl) {
        if (tab?.isLoop) {
            titleEl.textContent = 'Loop Vars';
            titleEl.style.color = 'var(--accent4)';
        } else {
            titleEl.textContent = 'Variables';
            titleEl.style.color = '';
        }
    }
    // Show loop hint in loop tabs
    const loopHint = document.getElementById('loop-hint-section');
    if (loopHint) loopHint.style.display = tab?.isLoop ? '' : 'none';

    document.getElementById('fn-vars-section').style.display = (tab?.isMain || tab?.isLoop) ? 'none' : '';
    renderVarList('global-var-list', state.globalVars, 'global');
    if (!tab?.isMain && !tab?.isLoop && tab) {
        renderVarList('local-var-list', tab.localVars, 'local');
        renderVarList('param-list', tab.params, 'param');
        renderVarList('return-list', tab.returns, 'return');
    }
}

function renderVarList(cid, list, kind) {
    const c = document.getElementById(cid);
    if (!c) return;
    c.innerHTML = '';
    for (const v of list) {
        const el = document.createElement('div');
        el.className = 'var-item';
        el.dataset.id = v.id;
        el.draggable = true;
        const hasVal = kind === 'global' || kind === 'local';
        el.innerHTML = `<span class="drag-handle">⠿</span>
      <input type="text" placeholder="name" value="${v.name}" data-field="name" data-id="${v.id}" data-kind="${kind}">
      ${hasVal?`<input type="text" placeholder="None" value="${v.value||''}" data-field="value" data-id="${v.id}" data-kind="${kind}" style="width:55px;color:var(--accent4)">` : ''}
      <span class="var-del" data-del="${v.id}" data-kind="${kind}">×</span>`;
        c.appendChild(el);
    }
    c.querySelectorAll('input[data-field]').forEach(inp => inp.addEventListener('change', () => {
        const v = getVarById(parseInt(inp.dataset.id), inp.dataset.kind);
        if (v) v[inp.dataset.field] = inp.value;
        buildPalette();
        draw();
    }));
    c.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => removeVar(parseInt(b.dataset.del), b.dataset.kind)));
    setupVarDrag(c, list);
}

function setupVarDrag(c, list) {
    let from = null;
    c.querySelectorAll('.var-item').forEach(el => {
        el.addEventListener('dragstart', e => {
            from = parseInt(el.dataset.id);
            e.stopPropagation()
        });
        el.addEventListener('dragover', e => e.preventDefault());
        el.addEventListener('drop', e => {
            e.stopPropagation();
            const to = parseInt(el.dataset.id);
            if (from === to) return;
            const fi = list.findIndex(v => v.id === from),
                ti = list.findIndex(v => v.id === to);
            const [item] = list.splice(fi, 1);
            list.splice(ti, 0, item);
            buildSidebar();
        });
    });
}

function getVarById(id, kind) {
    if (kind === 'global') return state.globalVars.find(v => v.id === id);
    const tab = activeTab();
    if (!tab) return null;
    if (kind === 'local') return tab.localVars.find(v => v.id === id);
    if (kind === 'param') return tab.params.find(v => v.id === id);
    if (kind === 'return') return tab.returns.find(v => v.id === id);
}

function removeVar(id, kind) {
    const lists = {
        global: state.globalVars,
        local: activeTab()?.localVars,
        param: activeTab()?.params,
        return: activeTab()?.returns
    };
    const l = lists[kind];
    if (!l) return;
    const i = l.findIndex(v => v.id === id);
    if (i >= 0) l.splice(i, 1);
    buildSidebar();
    buildPalette();
}

function addVar(kind) {
    const names = {
        param: 'arg',
        return: 'ret',
        local: 'var',
        global: 'var'
    };
    const v = {
        id: state.nextVarId++,
        name: names[kind] || 'var',
        value: ''
    };
    if (kind === 'global') state.globalVars.push(v);
    else {
        const tab = activeTab();
        if (!tab) return;
        if (kind === 'local') tab.localVars.push(v);
        if (kind === 'param') tab.params.push(v);
        if (kind === 'return') tab.returns.push(v);
    }
    buildSidebar();
    buildPalette();
}
document.getElementById('btn-add-global').addEventListener('click', () => addVar('global'));
document.getElementById('btn-add-local')?.addEventListener('click', () => addVar('local'));
document.getElementById('btn-add-param')?.addEventListener('click', () => addVar('param'));
document.getElementById('btn-add-return')?.addEventListener('click', () => addVar('return'));

/* ══════════════════════════════════════
   EDIT MODAL
══════════════════════════════════════ */
function getAllVarNames() {
    const names = new Set();
    state.globalVars.forEach(v => names.add(v.name));
    const tab = activeTab();
    if (tab && !tab.isMain) {
        tab.localVars?.forEach(v => names.add(v.name));
        tab.params?.forEach(v => names.add(v.name));
        tab.returns?.forEach(v => names.add(v.name));
    }
    activeBlocks().filter(b => b.type === 'set_var' || b.type === 'list_new' || b.type === 'list_append' || b.type === 'list_insert' || b.type === 'list_del' || b.type === 'list_del_end')
        .forEach(b => {
            if (b.data?.name) names.add(b.data.name);
        });
    return [...names].sort();
}
let editTarget = null;

function openEditModal(block) {
    const def = getBlockDef(block.type);
    editTarget = block;
    const opTitle = def.cat === 'op' ?
        (block.type === 'op_not' ?
            `not ${block.data?.a||'a'}` :
            `${block.data?.a||'a'} ${OP_SYMS[block.type]||def.label} ${block.data?.b||'b'}`) :
        def.label;
    document.getElementById('edit-modal-title').textContent = 'Edit: ' + opTitle;
    const body = document.getElementById('edit-modal-body');
    body.innerHTML = '';
    if (!(def.fields || []).length) body.innerHTML = '<p style="color:var(--text3);font-size:11px">No editable fields.</p>';
    for (const f of (def.fields || [])) {
        const lbl = document.createElement('label');
        lbl.textContent = f.label;
        if (f.type === 'var') {
            const allVars = getAllVarNames();
            const listId = 'varlist_' + f.k;
            const dl = document.createElement('datalist');
            dl.id = listId;
            allVars.forEach(n => {
                const o = document.createElement('option');
                o.value = n;
                dl.appendChild(o);
            });
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.setAttribute('list', listId);
            inp.value = block.data?.[f.k] ?? f.default ?? '';
            inp.dataset.field = f.k;
            body.appendChild(lbl);
            body.appendChild(dl);
            body.appendChild(inp);
        } else if (f.type === 'count') {
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.min = '1';
            inp.max = '16';
            inp.value = block.data?.[f.k] ?? f.default ?? '2';
            inp.dataset.field = f.k;
            body.appendChild(lbl);
            body.appendChild(inp);
        } else {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = block.data?.[f.k] ?? f.default ?? '';
            inp.dataset.field = f.k;
            body.appendChild(lbl);
            body.appendChild(inp);
        }
    }
    document.getElementById('edit-modal').classList.add('show');
}
document.getElementById('edit-cancel').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('show');
    editTarget = null;
});
document.getElementById('edit-ok').addEventListener('click', () => {
    if (editTarget) document.getElementById('edit-modal-body').querySelectorAll('input[data-field]').forEach(inp => {
        editTarget.data[inp.dataset.field] = inp.value;
    });
    draw();
    document.getElementById('edit-modal').classList.remove('show');
    editTarget = null;
});

/* ══════════════════════════════════════
   CONTEXT MENU
══════════════════════════════════════ */
function showCtx(x, y) {
    const m = document.getElementById('ctx-menu');
    m.style.display = 'block';
    m.style.left = x + 'px';
    m.style.top = y + 'px';
}

function hideCtx() {
    document.getElementById('ctx-menu').style.display = 'none';
}
document.getElementById('ctx-open-loop').addEventListener('click', () => {
    if (state.ctxTarget && (state.ctxTarget.type === 'for_loop' || state.ctxTarget.type === 'while_loop'))
        openLoopTab(state.ctxTarget);
    hideCtx();
});
document.getElementById('ctx-edit').addEventListener('click', () => {
    if (state.ctxTarget) openEditModal(state.ctxTarget);
    hideCtx();
});
document.getElementById('ctx-dup').addEventListener('click', () => {
    if (state.ctxTarget) {
        const nb = JSON.parse(JSON.stringify(state.ctxTarget));
        nb.id = state.nextBlockId++;
        nb.x += 24;
        nb.y += 24;
        activeBlocks().push(nb);
        state.selected = nb;
        draw();
    }
    hideCtx();
});
document.getElementById('ctx-del').addEventListener('click', () => {
    if (state.ctxTarget) deleteBlock(state.ctxTarget);
    hideCtx();
});
document.addEventListener('click', () => hideCtx());

function deleteBlock(block) {
    const tab = activeTab();
    const i = tab.blocks.indexOf(block);
    if (i >= 0) tab.blocks.splice(i, 1);
    tab.connections = tab.connections.filter(c => c.fromBlock !== block.id && c.toBlock !== block.id);
    if (state.selected?.id === block.id) state.selected = null;
    draw();
}

/* ══════════════════════════════════════
   TOOLBAR
══════════════════════════════════════ */
document.getElementById('tool-select').addEventListener('click', () => {
    state.tool = 'select';
    document.querySelectorAll('.ctool').forEach(b => b.classList.remove('active'));
    document.getElementById('tool-select').classList.add('active');
    canvas.style.cursor = 'default';
});
document.getElementById('tool-pan').addEventListener('click', () => {
    state.tool = 'pan';
    document.querySelectorAll('.ctool').forEach(b => b.classList.remove('active'));
    document.getElementById('tool-pan').classList.add('active');
    canvas.style.cursor = 'grab';
});
document.getElementById('tool-del').addEventListener('click', () => {
    if (state.selected) deleteBlock(state.selected);
});
document.getElementById('tool-zoom-in').addEventListener('click', () => {
    const cs = getCS();
    cs.scale = Math.min(3, cs.scale * 1.2);
    draw();
});
document.getElementById('tool-zoom-out').addEventListener('click', () => {
    const cs = getCS();
    cs.scale = Math.max(0.2, cs.scale / 1.2);
    draw();
});
document.getElementById('tool-fit').addEventListener('click', () => {
    const blocks = activeBlocks();
    if (!blocks.length) {
        const cs = getCS();
        cs.offsetX = 0;
        cs.offsetY = 0;
        cs.scale = 1;
        draw();
        return;
    }
    const xs = blocks.map(b => b.x);
    const ys = blocks.map(b => b.y);
    const minX = Math.min(...xs),
        minY = Math.min(...ys);
    const maxX = Math.max(...blocks.map(b => b.x + (blockSize(b).bw)));
    const maxY = Math.max(...blocks.map(b => b.y + (blockSize(b).bh)));
    const pad = 60;
    const sx = (canvas.width - pad * 2) / (maxX - minX || 1),
        sy = (canvas.height - pad * 2) / (maxY - minY || 1);
    const cs = getCS();
    cs.scale = Math.min(2, Math.min(sx, sy));
    cs.offsetX = canvas.width / 2 - ((minX + maxX) / 2) * cs.scale;
    cs.offsetY = canvas.height / 2 - ((minY + maxY) / 2) * cs.scale;
    draw();
});
document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selected) {
            deleteBlock(state.selected);
        } else if (state.selectedConn) {
            const conns = activeConns();
            const i = conns.findIndex(c => c.id === state.selectedConn.id);
            if (i !== -1) conns.splice(i, 1);
            state.selectedConn = null;
            draw();
        }
    }
});

/* ══════════════════════════════════════
   FILE LOADING
══════════════════════════════════════ */
const fileInput = document.getElementById('file-input');
let fileTarget = null;
document.getElementById('btn-load-lib').addEventListener('click', () => {
    fileTarget = 'lib';
    fileInput.click();
});
document.getElementById('btn-load-init').addEventListener('click', () => {
    fileTarget = 'init';
    fileInput.click();
});
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const c = ev.target.result;
        if (fileTarget === 'init') {
            state.initCode = c;
        }
        if (fileTarget === 'lib') {
            state.libCode = c;
            parseLib(c);
            buildPalette();
        }
        updateFileButtons();
    };
    reader.readAsText(file);
    fileInput.value = '';
});

function updateFileButtons() {
    const libBtn = document.getElementById('btn-load-lib');
    const initBtn = document.getElementById('btn-load-init');
    libBtn.textContent = state.libCode ? '✓ lib.py' : '📂 Load lib.py';
    libBtn.style.color = state.libCode ? 'var(--accent)' : '';
    libBtn.style.borderColor = state.libCode ? 'var(--accent)' : '';
    initBtn.textContent = state.initCode ? '✓ init.py' : '📂 Load init.py';
    initBtn.style.color = state.initCode ? 'var(--accent)' : '';
    initBtn.style.borderColor = state.initCode ? 'var(--accent)' : '';
}

/* ══════════════════════════════════════
   SAVE / LOAD CHART
══════════════════════════════════════ */
document.getElementById('btn-save-chart').addEventListener('click', saveChart);
document.getElementById('btn-load-chart').addEventListener('click', () => document.getElementById('chart-input').click());
document.getElementById('chart-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            loadChart(JSON.parse(ev.target.result));
        } catch (err) {
            alert('Failed to load chart: ' + err.message);
        }
    };
    reader.readAsText(file);
    document.getElementById('chart-input').value = '';
});

function saveChart() {
    const payload = {
        version: 2,
        tabs: state.tabs,
        globalVars: state.globalVars,
        canvasState: state.canvasState,
        activeTab: state.activeTab,
        nextTabId: state.nextTabId,
        nextBlockId: state.nextBlockId,
        nextVarId: state.nextVarId,
        initCode: state.initCode,
        libCode: state.libCode,
        libBlockDefs: state.libBlocks,
    };
    const json = JSON.stringify(payload, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], {
        type: 'application/json'
    }));
    const name = state.tabs.find(t => t.isMain)?.name || 'chart';
    a.download = name + '.flowscript';
    a.click();
}

function loadChart(payload) {
    if (!payload.version) throw new Error('Not a valid .flowscript file');

    state.tabs = payload.tabs;
    state.globalVars = payload.globalVars;
    state.canvasState = payload.canvasState;
    state.activeTab = payload.activeTab;
    state.nextTabId = payload.nextTabId;
    state.nextBlockId = payload.nextBlockId;
    state.nextVarId = payload.nextVarId;
    state.initCode = payload.initCode || '';
    state.libCode = payload.libCode || '';

    state.dragging = null;
    state.connecting = null;
    state.connectingMouse = null;
    state.selected = null;
    state.ctxTarget = null;

    if (state.libCode) {
        parseLib(state.libCode);
    } else {
        state.libBlocks = payload.libBlockDefs || [];
        for (const def of state.libBlocks) BLOCK_DEFS[def.type] = def;
    }

    for (const ft of state.tabs.filter(t => !t.isMain && !t.isLoop)) {
        const key = 'call_fn_' + ft.id;
        BLOCK_DEFS[key] = {
            label: ft.name,
            color: '#4af0b0',
            cat: 'call',
            compact: false,
            fnName: ft.name,
            fnTab: ft.id,
            flowIn: true,
            flowOut: true,
            extraFlows: [],
            ports: {
                in: ft.params.map(p => ({
                    l: p.name
                })),
                out: ft.returns.map(r => ({
                    l: '__' + r.name
                })),
            },
            fields: [],
        };
    }

    buildTabs();
    buildSidebar();
    buildPalette();
    draw();
    updateFileButtons();
}

function parseLib(code) {
    state.libBlocks = [];
    const lines = code.split('\n');
    const fnStarts = [];
    const defRe = /^def\s+(\w+)\s*\(([^)]*)\)/;
    lines.forEach((ln, i) => {
        const m = ln.match(defRe);
        if (m) fnStarts.push({
            i,
            name: m[1],
            args: m[2]
        });
    });

    fnStarts.forEach((fn, fi) => {
        const bodyLines = lines.slice(fn.i + 1, fnStarts[fi + 1]?.i ?? lines.length);
        let outPorts = [{
            l: '__ret'
        }];
        for (const bl of bodyLines) {
            const rm = bl.match(/^\s+return\s+(.+)/);
            if (!rm) continue;
            const parts = rm[1].split(',').map(s => s.trim()).filter(Boolean);
            if (parts.length === 1) {
                const ident = parts[0].match(/^[A-Za-z_]\w*$/);
                outPorts = [{
                    l: ident ? '__' + ident[0] : '__ret'
                }];
            } else {
                outPorts = parts.map((p, i) => {
                    const id = p.match(/^[A-Za-z_]\w*$/);
                    return {
                        l: id ? '__' + id[0] : '__ret' + i
                    };
                });
            }
        }
        const args = fn.args.split(',').map(a => a.trim()).filter(Boolean);
        const type = 'lib_' + fn.name;
        const def = {
            type,
            label: fn.name + '()',
            color: '#ff9f43',
            cat: 'lib',
            compact: false,
            flowIn: true,
            flowOut: true,
            extraFlows: [],
            ports: {
                in: args.map(a => ({
                    l: a.split('=')[0].trim()
                })),
                out: outPorts
            },
            fields: []
        };
        BLOCK_DEFS[type] = def;
        state.libBlocks.push(def);
    });
}

/* ══════════════════════════════════════
   CODE GENERATION
══════════════════════════════════════ */
document.getElementById('btn-generate').addEventListener('click', generateCode);

function generateCode() {
    let code = '';
    const ind = n => '    '.repeat(n);

    if (state.initCode.trim()) code += '# === init.py ===\n' + state.initCode.trim() + '\n\n';
    if (state.libCode.trim()) code += '# === lib.py ===\n' + state.libCode.trim() + '\n\n';

    if (state.globalVars.length) {
        code += '# === Global Variables ===\n';
        for (const v of state.globalVars) code += `${v.name} = ${v.value.trim()||'None'}\n`;
        code += '\n';
    }

    // Function defs (non-loop tabs only)
    for (const ft of state.tabs.filter(t => !t.isMain && !t.isLoop)) {
        const params = ft.params.map(p => p.name).join(', ');
        code += `def ${ft.name}(${params}):\n`;
        for (const lv of ft.localVars) code += ind(1) + `${lv.name} = ${lv.value||'None'}\n`;
        code += generateFlowCode(ft, 1);
        if (ft.returns.length) code += ind(1) + `return ${ft.returns.map(r=>r.name).join(', ')}\n`;
        code += '\n';
    }

    const mainTab = state.tabs.find(t => t.isMain);
    code += '# === Main Program ===\n' + generateFlowCode(mainTab, 0);

    document.getElementById('code-out').textContent = code;
    document.getElementById('code-modal').classList.add('show');
}

function generateFlowCode(tab, indentLevel) {
    const blocks = tab.blocks,
        conns = tab.connections;
    let code = '';
    const ind = n => '    '.repeat(n);

    // Find start: prefer explicit start/loop_start block, fall back to first output-only block
    const startBlock = blocks.find(b => b.type === 'start') ||
        blocks.find(b => b.type === 'loop_start') ||
        blocks.find(b => {
            const d = getBlockDef(b.type);
            return d.flowIn === false && d.flowOut !== false;
        });

    const visited = new Set();

    function followFlow(block, depth) {
        if (!block || visited.has(block.id)) return;
        visited.add(block.id);
        const def = getBlockDef(block.type);
        const il = indentLevel + depth;

        switch (block.type) {
            case 'start':
            case 'end_main':
            case 'loop_start':
            case 'loop_end':
                break;
            case 'comment':
                code += ind(il) + `# ${block.data?.text||''}\n`;
                break;

            case 'set_var':
                code += ind(il) + `${block.data?.name||'var'} = ${resolveDataIn(block,0,conns,blocks)}\n`;
                break;

            case 'print_blk':
                code += ind(il) + `print(${resolveDataIn(block,0,conns,blocks)})\n`;
                break;

            case 'delay':
                code += ind(il) + `time.sleep_ms(${block.data?.ms||resolveDataIn(block,0,conns,blocks)})\n`;
                break;

            case 'if_block': {
                const cond = resolveDataIn(block, 0, conns, blocks);
                code += ind(il) + `if ${cond}:\n`;
                const trueNext = flowNext(block, 'flowOut', conns, blocks);
                if (trueNext) followFlow(trueNext, depth + 1);
                else code += ind(il + 1) + 'pass\n';
                const falseNext = flowNext(block, 'flowExtra_0', conns, blocks);
                if (falseNext) {
                    code += ind(il) + 'else:\n';
                    followFlow(falseNext, depth + 1);
                }
                return;
            }
            case 'for_loop': {
                const iter = resolveDataIn(block, 0, conns, blocks);
                code += ind(il) + `for ${block.data?.var||'i'} in ${iter}:\n`;
                // Prefer loop body tab; fallback to direct flowOut connection
                const loopTabFor = state.tabs.find(t => t.loopBlock === block.id);
                if (loopTabFor) {
                    const bodyCode = generateFlowCode(loopTabFor, il + 1);
                    code += bodyCode || ind(il + 1) + 'pass\n';
                } else {
                    const body = flowNext(block, 'flowOut', conns, blocks);
                    if (body) followFlow(body, depth + 1);
                    else code += ind(il + 1) + 'pass\n';
                }
                // Continue flow after the loop (blocks wired to flowOut on parent canvas
                // when no loop tab exists, OR always via the "after-loop" continuation)
                const afterFor = loopTabFor ? flowNext(block, 'flowOut', conns, blocks) : null;
                if (afterFor) followFlow(afterFor, depth);
                return;
            }
            case 'while_loop': {
                const cond = resolveDataIn(block, 0, conns, blocks);
                code += ind(il) + `while ${cond}:\n`;
                const loopTabWhile = state.tabs.find(t => t.loopBlock === block.id);
                if (loopTabWhile) {
                    const bodyCode = generateFlowCode(loopTabWhile, il + 1);
                    code += bodyCode || ind(il + 1) + 'pass\n';
                } else {
                    const body = flowNext(block, 'flowOut', conns, blocks);
                    if (body) followFlow(body, depth + 1);
                    else code += ind(il + 1) + 'pass\n';
                }
                const afterWhile = loopTabWhile ? flowNext(block, 'flowOut', conns, blocks) : null;
                if (afterWhile) followFlow(afterWhile, depth);
                return;
            }
            case 'break_blk':
                code += ind(il) + 'break\n';
                return;
            case 'ret_block':
                code += ind(il) + 'return\n';
                return;

                // LIST OPS
            case 'list_new':
                code += ind(il) + `${block.data?.name||'lst'} = []\n`;
                break;
            case 'list_append':
                code += ind(il) + `${block.data?.name||'lst'}.append(${resolveDataIn(block,0,conns,blocks)})\n`;
                break;
            case 'list_insert':
                code += ind(il) + `${block.data?.name||'lst'}.insert(${resolveDataIn(block,0,conns,blocks)}, ${resolveDataIn(block,1,conns,blocks)})\n`;
                break;
            case 'list_del':
                code += ind(il) + `del ${block.data?.name||'lst'}[${resolveDataIn(block,0,conns,blocks)}]\n`;
                break;
            case 'list_del_end':
                code += ind(il) + `${block.data?.name||'lst'}.pop()\n`;
                break;

            default:
                if (def.cat === 'call') {
                    const fnTab = state.tabs.find(t => t.id === def.fnTab);
                    if (fnTab) {
                        const args = fnTab.params.map((_, i) => resolveDataIn(block, i, conns, blocks)).join(', ');
                        const lhsParts = fnTab.returns.map((r, i) => {
                            const dest = resolveDataOut(block, i, conns, blocks);
                            return dest || ('__' + r.name);
                        });
                        const lhs = lhsParts.length ? lhsParts.join(', ') + ' = ' : '';
                        code += ind(il) + `${lhs}${fnTab.name}(${args})\n`;
                    }
                } else if (def.cat === 'lib') {
                    const args = (def.ports.in || []).map((_, i) => resolveDataIn(block, i, conns, blocks)).join(', ');
                    const fnName = def.label.replace('()', '');
                    const outs = def.ports.out || [];
                    const lhs = outs.length ?
                        (outs.map((p, i) => resolveDataOut(block, i, conns, blocks) || p.l).join(', ')) + ' = ' :
                        '';
                    code += ind(il) + `${lhs}${fnName}(${args})\n`;
                }
        }

        // continue flow
        if (def.flowOut !== false && !['if_block', 'for_loop', 'while_loop'].includes(block.type)) {
            const next = flowNext(block, 'flowOut', conns, blocks);
            if (next) followFlow(next, depth);
        }
    }

    followFlow(startBlock, 0);

    // Unconnected flow blocks (skip loop anchors — they're structural)
    for (const b of blocks) {
        if (!visited.has(b.id)) {
            const def = getBlockDef(b.type);
            if (b.type === 'loop_start' || b.type === 'loop_end') continue;
            if (def.flowIn !== false || def.flowOut !== false) code += ind(indentLevel) + `# [unconnected: ${def.label}]\n`;
        }
    }

    if (!code.trim()) code = ind(indentLevel) + 'pass\n';
    return code;
}

function flowNext(block, portType, conns, blocks) {
    const c = conns.find(c => c.fromBlock === block.id && c.fromPort === portType);
    return c ? blocks.find(b => b.id === c.toBlock) : null;
}

function resolveDataIn(block, idx, conns, blocks) {
    const conn = conns.find(c => c.toBlock === block.id && c.toPort === 'dataIn' && c.toIdx === idx);
    if (!conn) return '_';
    const src = blocks.find(b => b.id === conn.fromBlock);
    if (!src) return '_';
    return resolveBlockOutput(src, conn.fromIdx || 0, conns, blocks);
}

function resolveBlockOutput(block, outIdx, conns, blocks) {
    if (block.type === 'mux') {
        const n = parseInt(block.data?.n || 2);
        const items = [];
        for (let i = 0; i < n; i++) items.push(resolveDataIn(block, i, conns, blocks));
        return `(${items.join(', ')})`;
    }
    if (block.type === 'demux') {
        const src = resolveDataIn(block, 0, conns, blocks);
        return `${src}[${outIdx}]`;
    }
    if (block.type === 'list_get') return `${block.data?.name||'lst'}[${resolveDataIn(block,0,conns,blocks)}]`;
    if (block.type === 'list_len') return `len(${block.data?.name||'lst'})`;
    const def = getBlockDef(block.type);
    if (block.type === 'data_blk') return block.data?.value || '0';
    if (block.type === 'read_var') return block.data?.name || 'var';
    if (def.cat === 'op') return resolveOp(block, conns, blocks);
    if (def.cat === 'call') {
        const fnTab = state.tabs.find(t => t.id === def.fnTab);
        if (fnTab && fnTab.returns[outIdx]) return '__' + fnTab.returns[outIdx].name;
    }
    if (def.cat === 'lib') {
        const outPort = (def.ports.out || [])[outIdx];
        return outPort ? outPort.l : def.label.replace('()', '') + '__ret';
    }
    return block.data?.name || '_';
}

function resolveDataOut(block, outIdx, conns, blocks) {
    const conn = conns.find(c => c.fromBlock === block.id && c.fromPort === 'dataOut' && (c.fromIdx || 0) === outIdx);
    if (!conn) return null;
    const dest = blocks.find(b => b.id === conn.toBlock);
    if (!dest) return null;
    if (dest.type === 'set_var') return dest.data?.name || null;
    if (dest.type === 'read_var') return dest.data?.name || null;
    return null;
}

function resolveOp(block, conns, blocks) {
    const aConn = conns.find(c => c.toBlock === block.id && c.toPort === 'dataIn' && c.toIdx === 0);
    const bConn = conns.find(c => c.toBlock === block.id && c.toPort === 'dataIn' && c.toIdx === 1);
    const aSrc = aConn ? blocks.find(b => b.id === aConn.fromBlock) : null;
    const bSrc = bConn ? blocks.find(b => b.id === bConn.fromBlock) : null;
    const a = aSrc ? resolveBlockOutput(aSrc, aConn.fromIdx || 0, conns, blocks) : (block.data?.a || '_');
    const b = bSrc ? resolveBlockOutput(bSrc, bConn.fromIdx || 0, conns, blocks) : (block.data?.b || '_');
    const pyOps = {
        op_add: '+',
        op_sub: '-',
        op_mul: '*',
        op_div: '/',
        op_mod: '%',
        op_eq: '==',
        op_neq: '!=',
        op_lt: '<',
        op_gt: '>',
        op_and: 'and',
        op_or: 'or'
    };
    if (block.type === 'op_not') return `not ${a}`;
    return `(${a} ${pyOps[block.type]||'?'} ${b})`;
}

/* code modal */
document.getElementById('btn-copy-code').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('code-out').textContent);
    document.getElementById('btn-copy-code').textContent = '✓ Copied';
    setTimeout(() => document.getElementById('btn-copy-code').textContent = '📋 Copy', 1500);
});
document.getElementById('btn-dl-code').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([document.getElementById('code-out').textContent], {
        type: 'text/plain'
    }));
    a.download = 'main.py';
    a.click();
});
document.getElementById('code-close').addEventListener('click', () => document.getElementById('code-modal').classList.remove('show'));
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('show');
}));
document.getElementById('fn-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('fn-ok').click();
    if (e.key === 'Escape') document.getElementById('fn-cancel').click();
});

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
function init() {
    resize();
    buildPalette();
    buildSidebar();
    buildTabs();
    const tab = state.tabs[0];
    tab.blocks.push({
        id: state.nextBlockId++,
        type: 'start',
        x: 260,
        y: 80,
        data: {}
    }, {
        id: state.nextBlockId++,
        type: 'end_main',
        x: 260,
        y: 300,
        data: {}
    });
    const cs = getCS();
    cs.offsetX = wrap.clientWidth / 2 - (260 + BW_NORMAL / 2) * cs.scale;
    cs.offsetY = 40;
    draw();
    updateFileButtons();
}
init();