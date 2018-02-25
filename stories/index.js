import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import { ExampleNode, ExampleNodeSelection, ExampleNodeCollapse } from './examples';
import Tree, { positions, reducers, actions, actionCreators } from '../src/index';
import medium from './data/data_M';
import large from './data/data_L';
import nestedXL from './data/data_nested_XL';
import './css/styles.css';
import './css/font-awesome.min.css';


const initState = fromJS({
	tree: medium,
});
const largeState = fromJS({
	tree: large,
});
const xlState = fromJS({
	tree: nestedXL,
});

const store = createStore(reducer, initState);
const largeStore = createStore(reducer, largeState);
const xlStore = createStore(reducer, xlState);

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


function cancelDrop(s) {
	return () => {
		s.dispatch(actionCreators.createCancelDropAction());
	};
}


function drop(s) {
	return (dragged, target, position) => {
		s.dispatch(actionCreators.createDropAction(dragged, target, position));
	};
}


function hover(s) {
	return (dragged, target, position) => {
		s.dispatch(actionCreators.createHoverAction(dragged, target, position));
	};
}

function stopHover(s) {
	return () => {
		s.dispatch(actionCreators.createStopHoverAction());
	};
}


function drag(s) {
	return (dragged) => {
		s.dispatch(actionCreators.createDragAction(dragged));
	};

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
			reducers.removeEffects(state.get('tree'), [ 'hover', 'drag' ])
		);
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


class Subscriber extends Component {
	constructor(props) {
		super(props);
		this.unsubscribe = props.subscribe(() => {
			if (this.rf) { return; }
			this.rf = window.requestAnimationFrame(() => {
				this.setState({ r: Math.random() });
				this.rf = undefined;
			});
		});
	}


	componentWillUnmount() {
		this.unsubscribe();
	}


	render() {
		return (<div>{this.props.doRender()}</div>);
	}
}


Subscriber.propTypes = {
	subscribe: PropTypes.func.isRequired,
	doRender: PropTypes.func.isRequired,
};


function rerenderOn(subscribe, doRender) {
	cancelDrop(store);
	return () => (
		<Subscriber
			subscribe={subscribe}
			doRender={doRender}
		/>
	);
}


storiesOf('Drag and Drop', module).
	add('Hover before rendering', () => {
		const dragged = store.getState().getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const target = store.getState().getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const position = positions.get('BEFORE');
		store.dispatch(actionCreators.createHoverAction(dragged, target, position));
		return (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={
					(nodeData) => <ExampleNode
						data={nodeData}
					/>
				}
			/>

		);
	}).
	add('Hover after rendering', () => {
		const dragged = store.getState().getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const target = store.getState().getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const position = positions.get('AFTER');
		store.dispatch(actionCreators.createHoverAction(dragged, target, position));
		return (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={
					(nodeData) => <ExampleNode
						data={nodeData}
					/>
				}
			/>

		);
	}).
	add('Hover In', () => {
		const dragged = store.getState().
			getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const target = store.getState().
			getIn([ 'tree', 0, 'children', 0 ]).toJS();
		const position = positions.get('INTO');
		store.dispatch(actionCreators.
				createHoverAction(dragged, target, position));
		return (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={
					(nodeData) => <ExampleNode
						data={nodeData}
					/>
				}
			/>
		);
	});


storiesOf('Interactive Tree', module).
		add('Tree Rendering', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={(nodeData) => (<ExampleNode data={nodeData} />)}
			/>
		))).
		add('DND Tree', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop(store)}
				drop={drop(store)}
				hover={hover(store)}
				stopHover={stopHover(store)}
				drag={drag(store)}
				renderNode={(nodeData) => (<ExampleNode data={nodeData} />)}
			/>
		))).
		add('Select Node', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop(store)}
				drop={drop(store)}
				hover={hover(store)}
				drag={drag(store)}
				stopHover={stopHover(store)}
				renderNode={
					(nodeData) => <ExampleNodeSelection
						select={() => {
							store.dispatch(actionCreators.createSelectAction(nodeData));
						}}
						data={nodeData}
					/>
				}
			/>
		))).
		add('Expand/Collapse Node', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop(store)}
				drop={drop(store)}
				drag={drag(store)}
				hover={hover(store)}
				stopHover={stopHover(store)}
				renderNode={
					(nodeData) => <ExampleNodeCollapse
						click={() => {
							store.dispatch(actionCreators.createCollapseAction(nodeData));
						}}
						data={nodeData}
					/>
				}
			/>
		))).
		add('1000 Nodes', rerenderOn(largeStore.subscribe, () => (
			<Tree
				tree={largeStore.getState().get('tree')}
				cancelDrop={cancelDrop(largeStore)}
				drop={drop(largeStore)}
				drag={drag(largeStore)}
				hover={hover(largeStore)}
				stopHover={stopHover(largeStore)}
				renderNode={
					(nodeData) => <ExampleNodeCollapse
						click={() => {
							largeStore.dispatch(
									actionCreators.createCollapseAction(nodeData));
						}}
						data={nodeData}
					/>
				}
			/>
		))).
		add('3000 Nodes', rerenderOn(xlStore.subscribe, () => (
			<Tree
				tree={xlStore.getState().get('tree')}
				cancelDrop={cancelDrop(xlStore)}
				drop={drop(xlStore)}
				drag={drag(xlStore)}
				hover={hover(xlStore)}
				stopHover={stopHover(xlStore)}
				renderNode={
					(nodeData) => <ExampleNodeCollapse
						click={() => {
							xlStore.dispatch(
									actionCreators.createCollapseAction(nodeData));
						}}
						data={nodeData}
					/>
				}
			/>
		)));
