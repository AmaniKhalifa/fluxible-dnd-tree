import React from 'react';
import ReactDOM from 'react-dom';
import Tree from '../src/Tree';
import { ExampleNode } from './Example';


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
				children: [ {
					title: 'Child 22 abc def ghi',
					selected: false,
					id: 3,
					type: 'search',
				} ],
			}, {
				title: 'Child Hovered Before',
				selected: false,
				id: 8,
				type: 'folder',
				hover: 'before',
			} ] },
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

function renderNode(nodeData) {

	return (
		<ExampleNode select={() => console.log('Maybe next time')} data={nodeData} />
	);
}

function render() {
	ReactDOM.render((
		<Tree
			tree={state.tree}
			renderNode={renderNode}
		/>
	),
	document.getElementById('root')
	);
}

render();
