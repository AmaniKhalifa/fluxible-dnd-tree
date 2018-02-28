import { List } from 'immutable';
import positions from './positions';

export function collapseNode(tree, action) {
	const newNode = action.get('collapsed').set(
		'collapsed', !action.getIn([ 'collapsed', 'collapsed' ]));
	return replaceNode(tree, newNode);
}


export function selectNode(tree, action) {
	const newNode = action.get('selected').set(
		'selected', !action.getIn([ 'selected', 'selected' ]));
	return replaceNode(tree, newNode);
}

export function removeEffects(nodes, effects) {
	let changed = false;

	const newNodes = nodes.map(function(node) {
		const newNode = removeAll(node, effects);
		if (newNode !== node) { changed = true; }
		if (newNode.has('children')) {
			const children = removeEffects(newNode.get('children'), effects);
			if (children !== newNode.get('children')) { changed = true; }
			return newNode.set('children', children);
		}
		return newNode;
	});
	if (changed) {
		return newNodes;
	}
	return nodes;
}


export function cancelDrop(nodes) {
	return removeEffects(nodes, [ 'hover', 'drag' ]);
}


export function stopHover(nodes) {
	return removeEffects(nodes, [ 'hover' ]);
}


export function setHoverEffects(tree, action) {
	const treeCopy = removeEffects(tree, [ 'hover' ]);
	let newNode = action.get('target');
	newNode = newNode.set('hover', action.get('position'));
	if (action.get('position') === positions.get('INTO')) {
		newNode = newNode.set('collapsed', false);
	}
	if (newNode.has('children')) {
		newNode = newNode.set('children',
			removeEffects(newNode.get('children'), [ 'hover' ]));
	}
	return replaceNode(treeCopy, newNode);
}


export function dropNode(tree, action) {
	const treeCopy = removeEffects(tree, [ 'hover' ]);
	let newAction = action.set(
		'target',
		removeEffects(List([ action.get('target') ]), [ 'hover' ]).first());
	const dragged = newAction.get('dragged');
	newAction = newAction.set('dragged', dragged.remove('drag'));
	return moveNode(treeCopy, newAction);
}


export function dragNode(tree, action) {
	const newNode = action.get('dragged').set('drag', true);
	return replaceNode(tree, newNode);
}


function replaceNode(nodes, newNode) {
	let changed = false;
	const newNodes = nodes.map(function(node) {
		if (node.get('id') === newNode.get('id')) {
			changed = true;
			return newNode;
		}
		else if (node.has('children')) {
			const children = replaceNode(node.get('children'), newNode);
			if (children !== node.get('children')) { changed = true; }
			return node.set('children', children);
		}
		return node;
	});
	if (changed) {
		return newNodes;
	}
	return nodes;
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

			return getParent(node.get('children'), id);

		}
		return undefined;
	}).filter(Boolean).first();
}


function moveNode(tree, action) {
	const nodes = removeNode(tree, action.getIn([ 'dragged', 'id' ]));
	let target;
	if (action.hasIn([ 'target', 'children' ])) {
		const hoveredChildren = removeNode(action.getIn([ 'target', 'children' ]),
		action.getIn([ 'dragged', 'id' ]));
		target = action.get('target').set('children', hoveredChildren);
	}
	else {
		target = action.get('target');
	}
	const dragged = action.get('dragged');
	const position = action.get('position');
	if (position === positions.get('INTO')) {
		if (!target.has('children')) {
			target = target.set('children', []);
		}
		const newChildren = List(target.get('children')).push(dragged);
		target = target.set('children', newChildren);
		return replaceNode(nodes, target);
	}

	let parent = getParent(nodes, target.get('id'));
	if (parent) {
		let index = parent.get('children').
				findIndex((child) => child.get('id') === target.get('id'));
		index = (position === positions.get('BEFORE')) ? index : index + 1;
		parent = parent.set('children',
				parent.get('children').insert(index, dragged));
		return replaceNode(nodes, parent);
	}

	let index = nodes.findIndex((obj) => obj.get('id') === target.get('id'));
	index = (position === positions.get('BEFORE')) ? index : index + 1;
	return nodes.insert(index, dragged);
}


function removeAll(node, keys) {
	return keys.reduce(
		(newNode, key) => newNode.remove(key),
		node);
}
