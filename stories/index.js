import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { Map, List, fromJS } from 'immutable';
import { ExampleNode, ExampleNodeSelection } from '../examples/Example';
import Tree from '../src/Tree';
import './css/styles.css';
import './css/font-awesome.min.css';


const initState = {
	tree: [
		{ title: 'Root',
			id: 1,
			type: 'folder',
			selected: false,
			collapsed: false,
			children: [ { title: 'Child',
				selected: false,
				collapsed: false,
				id: 2,
				type: 'folder',
				children: [ {
					title: 'Child 22 abc def ghi',
					selected: false,
					collapsed: false,
					id: 3,
					type: 'search',
				} ],
			}, {
				title: 'Hovered Child',
				selected: false,
				collapsed: false,
				id: 8,
				type: 'folder',
			} ] },
			{ title: 'Empty', id: 4, type: 'search', selected: false, collapsed: false },
		{ title: 'Two Nodes',
			selected: false,
			collapsed: false,
			id: 5,
			type: 'folder',
			children: [
				{ title: 'Node 1',
					selected: false,
					collapsed: false,
					id: 6,
					type: 'search' },
				{ title: 'Node 2',
					selected: false,
					collapsed: false,
					id: 7,
					type: 'folder' },
			] },
	]
};

const store = createStore(reducer, initState);
const DNDstore = createStore(reducer, initState);
const selectionStore = createStore(reducer, initState);
const ExpandCollapseStore = createStore(reducer, initState);

function reducer(state, action) {
	let newState = {};
	switch (action.type) {
	case 'COLLAPSE':
		newState = Object.assign({}, state, { tree:
			collapseNode(fromJS(state.tree), fromJS(action)).toJS() });
		return newState;
	case 'SELECT':
		newState = Object.assign({}, state, { tree:
			selectNode(fromJS(state.tree), fromJS(action)).toJS() });
		return newState;
	case 'CANCEL_DROP':
		newState = Object.assign({}, state, { tree:
			removeAllEffects(fromJS(state.tree)).toJS() });
		return newState;
	case 'DROP':
		newState = Object.assign({}, state, { tree:
			dropNode(fromJS(state.tree), fromJS(action)).toJS() });
		return newState;
	case 'HOVER':
		newState = Object.assign({}, state, { tree:
			setHoverEffects(fromJS(state.tree), fromJS(action)).toJS() });
		return newState;
	default:
		return state;
	}
}
function collapseNode(tree, action) {
	const newNode = action.get('collapsed').set(
		'collapsed', !action.getIn([ 'collapsed', 'collapsed' ]));
	return replaceNode(tree, newNode);
}

function selectNode(tree, action) {
	const newNode = action.get('selected').set(
		'selected', !action.getIn([ 'selected', 'selected' ]));
	return replaceNode(tree, newNode);
}

function removeNode(nodes, id) {
	return nodes.map(function(node) {
		if (node.get('id') !== id) {
			if (node.has('children')) {
				return node.set('children', removeNode(node.get('children'), id));
			}
			return node;
		}
		return undefined;
	}).filter(Boolean);
}

function getParent(nodes, id) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (node.children) {
			const children = node.children;
			for (let i = 0; i < children.length; i++) {
				if (children[i].id === id) {
					return { node, index: i };
				}
			}
			for (let i = 0; i < children.length; i++) {
				const res = getParent(children, id);
				if (res) {
					return res;
				}
			}
		}
	}
}

function moveNode(tree, action) {
	const nodes = removeNode(fromJS(tree), action.getIn([ 'dragged', 'id' ]));
	let hovered = action.get('hovered');
	const dragged = action.get('dragged');
	const position = action.get('position');
	if (position === 'into') {
		if (!hovered.has('children')) {
			hovered = hovered.set('children', []);
		}
		const newChildren = List(hovered.get('children')).push(dragged);
		hovered = hovered.set('children', newChildren);
		return replaceNode(nodes, hovered);
	}
	else {
		const parent = getParent(nodes.toJS(), hovered.get('id'));
		if (parent) {
			let parentNode = fromJS(parent.node);
			const tIndex =
				(position === 'before') ? parent.index : parent.index + 1;
			parentNode = parentNode.set('children',
				parentNode.get('children').insert(tIndex, dragged));
			return replaceNode(nodes, parentNode);
		}
		else {
			let index =
				nodes.findIndex((obj) => obj.get('id') === hovered.get('id'));
			index = (position === 'before') ? index : index + 1;
			return nodes.insert(index, dragged);
		}
	}
}
function canDrop(action) {
	if (action.getIn([ 'hovered', 'type' ]) === 'search' &&
		action.get('position') === 'into') {
		return false;
	}
	return true;
}
function dropNode(tree, action) {
	if (!canDrop(action)) {
		return tree;
	}
	const treeCopy = removeAllEffects(fromJS(tree)).toJS();
	const newAction = action.set('hovered',
		removeAllEffects(fromJS([ action.get('hovered') ])).first());

	return moveNode(treeCopy, newAction);
}
function removeHover(nodes) {
	return nodes.map(function(node) {
		const newNode = node.remove('hover');
		if (newNode.has('children')) {
			const children = removeHover(newNode.get('children'));
			return newNode.set('children', children);
		}
		return newNode;
	});
}

function removeAllEffects(tree) {
	return removeHover(tree);
}

function getNodeById(nodes, id) {
	return nodes.map(function(node) {
		if (node.get('id') === id) {
			return node;
		}
		else if (node.has('children')) {
			return getNodeById(node.get('children'), id);
		}
		return undefined;
	}).filter(Boolean).first();
}

function replaceNode(nodes, newNode) {
	return nodes.map(function(node) {
		if (node.get('id') === newNode.get('id')) {
			return newNode;
		}
		else if (node.has('children')) {
			return node.set('children', replaceNode(node.get('children'), newNode));
		}
		return node;
	});
}

function setHoverEffects(tree, action) {
	const treeCopy = removeAllEffects(tree);
	if (!canDrop(action)) {
		return treeCopy;
	}
	let newNode = action.get('hovered');
	newNode = newNode.
		set('collapsed', false).
		set('hover', action.get('position'));
	if (newNode.has('children')) {
		newNode = newNode.set('children', removeAllEffects(newNode.get('children')));
	}
	return replaceNode(treeCopy, newNode);
}


class ReduxWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = { tree: props.tree };
		props.subscribe(() => {
			const state = props.store.getState();
			this.setState(state);
		});
	}
	render() {
		const childrenWithProps = React.cloneElement(this.props.children, {
			tree: this.state.tree,
		});
		return (<div>
			{childrenWithProps}
		</div>);
	}
}


storiesOf('Drag and Drop', module).
	add('Hover before rendering', () => {
		const action = {
			type: 'HOVER',
			dragged: store.getState().tree[0].children[2],
			hovered: store.getState().tree[0].children[1],
			position: 'before',
		};
		store.dispatch(action);
		return (
			<Tree
				tree={store.getState().tree}
				renderNode={
				(nodeData) => <ExampleNode
					select={() => console.log('Maybe next time')}
					data={nodeData}
				/>
			}
			/>

		);
	}).
		add('Hover after rendering', () => {
			const action = {
				type: 'HOVER',
				dragged: store.getState().tree[0].children[2],
				hovered: store.getState().tree[0].children[1],
				position: 'after',
			};
			store.dispatch(action);
			return (
				<Tree
					tree={store.getState().tree}
					renderNode={
					(nodeData) => <ExampleNode
						select={() => console.log('Maybe next time')}
						data={nodeData}
					/>
				}
				/>

			);
		}).
			add('Hover In', () => {
				const action = {
					type: 'HOVER',
					dragged: store.getState().tree[0].children[2],
					hovered: store.getState().tree[0].children[1],
					position: 'into',
				};
				store.dispatch(action);
				return (
					<Tree
						tree={store.getState().tree}
						renderNode={
						(nodeData) => <ExampleNode
							select={() => console.log('Maybe next time')}
							data={nodeData}
						/>
					}
					/>

				);
			});

storiesOf('Interactive Tree', module).
		add('DND Tree', () => {
			return (
				<ReduxWrapper
					store={DNDstore}
					subscribe={DNDstore.subscribe}
					tree={DNDstore.getState().tree}>
					<Tree
						dispatch={DNDstore.dispatch}
						renderNode={
						(nodeData) => <ExampleNode
							select={() => console.log('Maybe next time')}
							data={nodeData}
						/>
									}
					/>
				</ReduxWrapper>
			);
		}).
		add('Select Node', () => {
			return (
				<ReduxWrapper
					store={selectionStore}
					subscribe={selectionStore.subscribe}
					tree={selectionStore.getState().tree}>
					<Tree
						dispatch={selectionStore.dispatch}
						renderNode={
						(nodeData) => <ExampleNodeSelection
							select={() => {
								const action = {
									type: 'SELECT',
									selected: nodeData
								};
								selectionStore.dispatch(action);
							}}
							data={nodeData}
						/>
									}
					/>
				</ReduxWrapper>
			);
		}).
		add('Expand/Collapse Node', () => {
			return (
				<ReduxWrapper
					store={ExpandCollapseStore}
					subscribe={ExpandCollapseStore.subscribe}
					tree={ExpandCollapseStore.getState().tree}>
					<Tree
						dispatch={ExpandCollapseStore.dispatch}
						renderNode={
						(nodeData) => <ExampleNode
							click={() => {
								const action = {
									type: 'COLLAPSE',
									collapsed: nodeData
								};
								ExpandCollapseStore.dispatch(action);
							}}
							data={nodeData}
						/>
									}
					/>
				</ReduxWrapper>
			);
		});
