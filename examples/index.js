import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import Example from './Example';


const state = {
	tree: [
		{ title: 'Root',
			id: 1,
			type: 'folder',
			selected: false,
			children: [ { title: 'Child',
				selected: false,
				id: 2,
				type: 'folder',
				children: [ { title: 'Child 22 abc def ghi',
					selected: false,
					id: 3,
					type: 'search' } ] },
			] },
			{ title: 'Empty', id: 4, type: 'search', selected: false },
		{ title: 'Two Nodes',
			selected: false,
			id: 5,
			type: 'folder',
			children: [
				{ title: 'Node 1',
					selected: false,
					id: 6,
					type: 'search' },
				{ title: 'Node 2',
					selected: false,
					id: 7,
					type: 'folder' },
			] },
	],
	collapsed: false,
};
const store = createStore(reducer, state);

function reducer(state, action) {
	switch (action.type) {
	case 'DROP':
		// console.log('DROP Action recieved ...', state.tree);
		state.tree = positionNode(state.tree, action);
		return state;
	case 'HOVER':
		console.log('HOVER Action recieved ...');
		state.tree = setHoverEffects(state.tree, action);
		return state;
	default:
		return state;
	}
}

function setHoverEffects(state, action) {
	// let { position } = action;
	// let hovered = ReactDOM.li({ className: 'hover' });
	// let dragged = ReactDOM.li({ className: 'drag' });
	// hovered.classList.add(position);
	return state;
}

function removeNode(array, ids) {
	for (let i = array.length - 1; i >= 0; i--) {
		const obj = array[i];
		const indexOfFound = ids.indexOf(obj.id);
		if (indexOfFound > -1) {
			array.splice(i, 1);
			ids.splice(indexOfFound, 1);
		}
		else if (obj.children) {
			removeNode(obj.children, ids);
		}
	}
}
function getParent(array, id) {
	for (let i = 0; i < array.length; i++) {
		const node = array[i];
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
function positionNode(tree, action) {
	let treeCopy = Object.assign([], tree);
	replaceNode(treeCopy, action.dragged, action.hovered, action.position);
	return treeCopy;
}

function replaceNode(tree, node, hovered, position) {
	// Not dropping before/after dummy root node
	if (!(hovered.rootNode && position !== 'into')) {
		removeNode(tree, [ node.id ]);
		if (position === 'into') {
			if (!hovered.children) {
				hovered.children = [];
			}
			hovered.children.push(node);
		}
		else {
			const t = getParent(tree, hovered.id);
			if (t) {
				const tNode = t.node;
				const tIndex = t.index;
				if (position === 'before') {
					tNode.children.splice(tIndex, 0, node);
				}
				else {
					tNode.children.splice(tIndex + 1, 0, node);
				}
			}
			else {
				const tIndex = tree.findIndex(obj => obj.id === hovered.id);
				if (position === 'before') {
					tree.splice(tIndex, 0, node);
				}
				else {
					tree.splice(tIndex + 1, 0, node);
				}

			}

		}
	}
}
const render = () => ReactDOM.render(
  (<Example tree={store.getState().tree} dispatch={store.dispatch}/>),
  document.getElementById('root')
);

render();
store.subscribe(render);
