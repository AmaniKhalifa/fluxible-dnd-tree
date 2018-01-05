import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { Map, List, fromJS } from 'immutable';
import { ExampleNode, ExampleNodeSelection } from '../examples/Example';
import Tree from '../src/Tree';
import './css/styles.css';
import './css/font-awesome.min.css';


const initState = fromJS({
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
});

const store = createStore(reducer, initState);
const DNDstore = createStore(reducer, initState);
const selectionStore = createStore(reducer, initState);
const ExpandCollapseStore = createStore(reducer, initState);

function reducer(state, actionObj) {
	const action = fromJS(actionObj);
	switch (action.get('type')) {
	case 'COLLAPSE':
		return state.set('tree', collapseNode(state.get('tree'), action));
	case 'SELECT':
		return state.set('tree', selectNode(state.get('tree'), action));
	case 'CANCEL_DROP':
		return state.set('tree', removeAllEffects(state.get('tree')));
	case 'DROP':
		return state.set('tree', dropNode(state.get('tree'), action));
	case 'HOVER':
		return state.set('tree', setHoverEffects(state.get('tree'), action));
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
	return nodes.map(function(node) {
		if (node.has('children')) {
			const parent = node.get('children').
				find((child) => child.get('id') === id);
			if (parent) {
				return node;
			}
			else {
				return getParent(node.get('children'), id);
			}
		}
		return undefined;
	}).filter(Boolean).first();
}

function moveNode(tree, action) {
	const nodes = removeNode(tree, action.getIn([ 'dragged', 'id' ]));
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
		let parent = getParent(nodes, hovered.get('id'));
		if (parent) {
			let index = parent.get('children').
				findIndex((child) => child.get('id') === hovered.get('id'));
			index = (position === 'before') ? index : index + 1;
			parent = parent.set('children',
				parent.get('children').insert(index, dragged));
			return replaceNode(nodes, parent);
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
	const treeCopy = removeAllEffects(tree);
	const newAction = action.set('hovered',
		removeAllEffects(List([ action.get('hovered') ])).first());

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
		this.state = this.createStateFromStore(props.store);
		this.unsubscribe = props.subscribe(() => {
			const state = props.store.getState();
			this.setState(this.createStateFromStore(props.store));
		});
	}
	createStateFromStore(s) {
		return { tree: s.getState().get('tree').toJS() };
	}
	componentWillUnmount() {
		this.unsubscribe();
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
			dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			hovered: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			position: 'before',
		};
		store.dispatch(action);
		return (
			<Tree
				tree={store.getState().get('tree').toJS()}
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
				dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				hovered: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				position: 'after',
			};
			store.dispatch(action);
			return (
				<Tree
					tree={store.getState().get('tree').toJS()}
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
					dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					hovered: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					position: 'into',
				};
				store.dispatch(action);
				return (
					<Tree
						tree={store.getState().get('tree').toJS()}
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
					subscribe={DNDstore.subscribe}>
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
					subscribe={selectionStore.subscribe}>
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
					subscribe={ExpandCollapseStore.subscribe}>
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
