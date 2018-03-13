import React from 'react';
import { List, Map, fromJS } from 'immutable';
import { createStore } from 'redux';
import Tree, { positions, reducers, actions, actionCreators } from '../src/index';


const initState = {
	tree: List([
		Map({
			id: 0,
			title: 'Node 1',
			children: List([
				Map(
					{
						id: 2,
						title: 'Child 1',
					}),
			]),
		}),
		Map({
			id: 1,
			title: 'Node 2',
		}),
	]),
};

const store = createStore(reducer, initState);


function reducer(state, actionObj) {
	const action = fromJS(actionObj);
	switch (action.get('type')) {
	case actions.COLLAPSE:
		return collapseNodeReducer(state, action);
	case actions.SELECT:
		return selectNodeReducer(state, action);
	case actions.CANCEL_DROP:
		return cancelDropReducer(state);
	case actions.STOP_HOVER:
		return stopHoverReducer(state);
	case actions.DROP:
		return dropNodeReducer(state, action);
	case actions.DRAG:
		return dragNodeReducer(state, action);
	case actions.HOVER:
		return hoverNodeReducer(state, action);
	default:
		return state;
	}
}


function cancelDrop() {
	store.dispatch(actionCreators.createCancelDropAction());
}


function drop(dragged, target, position) {
	store.dispatch(actionCreators.createDropAction(dragged, target, position));
}


function hover(dragged, target, position) {
	store.dispatch(actionCreators.createHoverAction(dragged, target, position));
}


function stopHover() {
	store.dispatch(actionCreators.createStopHoverAction());
}


function drag(dragged) {
	store.dispatch(actionCreators.createDragAction(dragged));
}


function click(node) {
	store.dispatch(actionCreators.createCollapseAction(node));
}


function select(node) {
	store.dispatch(actionCreators.createSelectAction(node));
}


function collapseNodeReducer(state, action) {
	return state.set('tree', reducers.collapseNode(state.get('tree'), action));
}


function selectNodeReducer(state, action) {
	return state.set('tree', reducers.selectNode(state.get('tree'), action));
}


function cancelDropReducer(state) {
	return state.set('tree', reducers.cancelDrop(state.get('tree')));
}


function stopHoverReducer(state) {
	return state.set('tree', reducers.stopHover(state.get('tree')));
}


function canDrop(action) {
	if (action.getIn([ 'target', 'type' ]) === 'search' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}


function dropNodeReducer(state, action) {
	if (!canDrop(action)) {
		return state.set('tree',
			reducers.removeEffects(state.get('tree'), [ 'hover', 'drag' ]));
	}
	return state.set('tree', reducers.dropNode(state.get('tree'), action));
}


function dragNodeReducer(state, action) {
	return state.set('tree', reducers.dragNode(state.get('tree'), action));
}


function hoverNodeReducer(state, action) {
	if (!canDrop(action)) {
		const treeCopy = reducers.removeEffects(state.get('tree'), [ 'hover' ]);
		return state.set('tree', treeCopy);
	}
	return state.set('tree',
		reducers.setHoverEffects(state.get('tree'), action, canDrop));
}


function Node(data) {
	return [
		<input
			id={`checkbox_node_${data.get('id')}`}
			type="checkbox"
			checked={data.get('selected')}
			onChange={select}
		/>,
		<span onClick={click} className="container" >
			{data.get('title')}
		</span>,
	];
}


const MyTree = () =>
	(<Tree
		tree={store.getState().get('tree')}
		cancelDrop={cancelDrop}
		drop={drop}
		drag={drag}
		hover={hover}
		stopHover={stopHover}
		renderNode={
			(nodeData) => <Node
				data={nodeData}
			/>
		}
	/>);

export default MyTree;
