import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
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
	switch (action.type) {
	case 'COLLAPSE':
		state = Object.assign({}, state, { tree: collapseNode(state.tree, action) });
		return state;
	case 'SELECT':
		state = Object.assign({}, state, { tree: selectNode(state.tree, action) });
		return state;
	case 'CANCEL_DROP':
		state = Object.assign({}, state, { tree: removeAllEffects(state.tree) });
		return state;
	case 'DROP':
		state = Object.assign({}, state, { tree: dropNode(state.tree, action) });
		return state;
	case 'HOVER':
		state = Object.assign({}, state, { tree: setHoverEffects(state.tree, action) });
		return state;
	default:
		return state;
	}
}
function collapseNode(tree, action) {
	const treeCopy = Object.assign([], tree);
	const collapsedNode = getNodeById(treeCopy, action.collapsed.id);
	collapsedNode.collapsed = !collapsedNode.collapsed;
	return treeCopy;
}

function selectNode(tree, action) {
	const treeCopy = Object.assign([], tree);
	const selectedNode = getNodeById(treeCopy, action.selected.id);
	selectedNode.selected = !selectedNode.selected;
	return treeCopy;
}
function removeNode(nodes, ids) {
	for (let i = nodes.length - 1; i >= 0; i--) {
		const obj = nodes[i];
		const indexOfFound = ids.indexOf(obj.id);
		if (indexOfFound > -1) {
			nodes.splice(i, 1);
			ids.splice(indexOfFound, 1);
		}
		else if (obj.children) {
			removeNode(obj.children, ids);
		}
	}
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

function replaceNode(nodes, dragged, hovered, position) {
	removeNode(nodes, [ dragged.id ]);
	if (position === 'into') {
		if (!hovered.children) {
			hovered.children = [];
		}
		hovered.children.push(dragged);
	}
	else {
		const t = getParent(nodes, hovered.id);
		if (t) {
			const tNode = t.node;
			const tIndex = t.index;
			if (position === 'before') {
				tNode.children.splice(tIndex, 0, dragged);
			}
			else {
				tNode.children.splice(tIndex + 1, 0, dragged);
			}
		}
		else {
			const tIndex = nodes.findIndex(obj => obj.id === hovered.id);
			if (position === 'before') {
				nodes.splice(tIndex, 0, dragged);
			}
			else {
				nodes.splice(tIndex + 1, 0, dragged);
			}
		}
	}
}
function canDrop(dragged, hovered, position) {
	if (hovered.type === 'search' && position === 'into') { return false; }

	return true;
}
function dropNode(tree, action) {
	if (!canDrop(action.dragged, action.hovered, action.position)) {
		return tree;
	}
	const treeCopy = removeAllEffects(Object.assign([], tree));
	const hoveredNode = getNodeById(treeCopy, action.hovered.id);
	const draggedNode = getNodeById(treeCopy, action.dragged.id);

	replaceNode(treeCopy, draggedNode, hoveredNode, action.position);
	return treeCopy;
}
function removeHover(nodes) {
	return nodes.map(function(node) {
		const children = node.children ? removeHover(node.children) : undefined;
		return Object.assign({}, node, { hover: undefined, children });
	});
}

function removeAllEffects(tree) {
	return removeHover(tree);
}

function getNodeById(nodes, id) {
	return nodes.map(function(node) {
		if (node.id === id) {
			return node;
		}
		else {
			if (node.children) {
				return getNodeById(node.children, id);
			}
		}
		return undefined;
	}).filter((node) => node)[0];
}
function setHoverEffects(tree, action) {
	const treeCopy = removeHover(tree);
	if (!canDrop(action.dragged, action.hovered, action.position)) {
		return treeCopy;
	}
	const newHoveredNode = getNodeById(treeCopy, action.hovered.id);
	newHoveredNode.collapsed = false;
	newHoveredNode.hover = action.position;
	return treeCopy;
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
