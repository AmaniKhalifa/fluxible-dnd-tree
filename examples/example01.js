
const stateData = {
    tree: [
        { type: 'folder', data: { name: 'folder_1' }, children: [] },
        { type: 'folder', data: { name: 'folder_2' }, children: [] }
    ]
};


function reduceDragHover(state, action) {
    const { position, hoveredNode, dragNode } = action.data;

    const hoveredNodeFromState = state.tree.find((s) => isHovered(hoveredNode, s))
    hoveredNodeFromState.isHovered = true;
    hoveredNodeFromState.hoverPosition = position;
    state = replaceNode(state, hoveredNodeFromState);
    const dragNodeFromState = state.tree.find((s) => isDragged(dragNode, s))
    dragNodeFromState.isDragged = true;
    state = replaceNode(state, dragNodeFromState);
    return state;
}


function reducer(state, action) {
    switch(action.type) {
        case actions.DRAG_HOVER:
            return reduceDragHover(state, action);
        default:
            return state;
    }
}

const state = {
    dispatch(action) {
        stateData = reducer(stateData, action);
        render();
    },
    getData() {
        return stateData;
    }
};


function render() {
    return <Tree
        state={state.getData()}
        renderNode={renderNode}
        dragHover={dragHover}
        onDrop={onDrop}
        canDrag={canDrag}
        canDrop={canDrop}
    />
}


function renderNode(data) {
    return <div class='node'>{data.data.name}</div>;
}


function dragHover(position, hoveredNode, dragNode) {
    state.dispatch(createDragHoverAction(position, hoveredNode, dragNode))
}


const actions = {
    DRAG_HOVER: 'DRAG_HOVER',
}

function createDragHoverAction(position, hoveredNode, dragNode) {
    return {
        type: actions.DRAG_HOVER,
        data: {
            position, hoveredNode, dragNode,
        }
    }
}
