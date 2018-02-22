const NUMBER_OF_NODES = 10;
const arr = [];

let counter = 0;
for (let i = 0; i < NUMBER_OF_NODES; i += 1) {
	const node = { id: counter,
		title: counter,
		type: 'folder',
		collapsed: false,
		selected: false };
	counter += 2;
	const child1 = {
		id: counter - 1,
		title: counter - 1,
		type: 'folder',
		collapsed: false,
		selected: false,
		children: [
			{
				id: counter,
				title: counter,
				type: 'search',
				collapsed: false,
				selected: false,
			},
		],
	};
	node.children = [ child1 ];
	arr.push(node);
	counter += 1;
}

console.log(arr); // eslint-disable-line no-console
