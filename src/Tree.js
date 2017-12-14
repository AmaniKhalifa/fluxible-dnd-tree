import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Node from './Node';

class Tree extends Component {

	constructor(props) {
		super(props);
		this.state = {
			tree: [
				{ title: 'DummyNode',
					id: 0,
					rootNode: true,
					children: [
						{ title: 'Root',
							id: 1,
							type: 'folder',
							selected: false,
							children: [ { title: 'Child',
                            selected: false,
                            id: 2,
                            type: 'folder',
                            children: [ { title: ' Child 22 abc def ghi',
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
					] },
			],
			collapsed: false,
		};
	}

	removeNode(array, ids) {
		for (let i = array.length - 1; i >= 0; i--) {
			const obj = array[i];
			const indexOfFound = ids.indexOf(obj.id);
			if (indexOfFound > -1) {
				array.splice(i, 1);
				ids.splice(indexOfFound, 1);
			}
			else if (obj.children) {
				this.removeNode(obj.children, ids);
			}
		}
	}


	isDescendant(node, id) {
		if (node.children) {
			const children = node.children;
			for (let i = 0; i < children.length; i++) {
				if (children[i].id === id) {
					return true;
				}
			}
			for (let i = 0; i < children.length; i++) {
				const res = this.isDescendant(children[i], id);
				if (res) {
					return res;
				}
			}
		}
		return false;
	}
	getParent(node, id) {
		if (node.children) {
			const children = node.children;
			for (let i = 0; i < children.length; i++) {
				if (children[i].id === id) {
					return { node, index: i };
				}
			}
			for (let i = 0; i < children.length; i++) {
				const res = this.getParent(children[i], id);
				if (res) {
					return res;
				}
			}
		}

	}
	addNode(node, parent, position, isNew = false) {
		parent = parent.node;
		node = node.node;
        // Not dropping before/after dummy root node
		if (!(parent.rootNode && position !== 'into')) {
			if (!isNew)				{ this.removeNode(this.state.tree, [ node.id ]); }
			if (position == 'into') {
				if (!parent.children) {
					parent.children = [];
				}
				parent.children.push(node);
			}
			else {
				const t = this.getParent(this.state.tree[0], parent.id);
				const tNode = t.node;
				const tIndex = t.index;
				if (position == 'before') {
					tNode.children.splice(tIndex, 0, node);
				}
				else {
					tNode.children.splice(tIndex + 1, 0, node);
				}
			}
		}


		this.forceUpdate();

	}

	removeSelected(array) {
		for (let i = 0; i < array.length; i++) {
			const obj = array[i];
			if (obj.selected) {
				array.splice(i, 1);
			}
			else if (obj.children) {
				this.removeSelected(obj.children);
			}
		}
	}

	selectAllChildren(node, checked) {
		node.selected = checked;
		const children = node.children;
		if (children) {
			for (let i = 0; i < children.length; i++) {
				this.selectAllChildren(children[i], checked);
			}
		}
	}
	selectNode(node, checked) {
		this.selectAllChildren(node, checked);
		this.setState({
			tree: this.state.tree,
		});
	}
	hasSelectedChild(node) {
		const children = node.children;
		if (children) {
			for (let i = 0; i < children.length; i++) {
				if (children[i].selected) {
					return true;
				}
				this.hasSelectedChild(children[i]);

			}
		}
	}
	render() {
		const buildNode = (node) => {
			const children = [];
			for (let i = 0; node.children && i < node.children.length; i++) {
				children.push(buildNode(node.children[i]));
			}
			return (<Node
				hasSelectedChild={this.hasSelectedChild.bind(this)}
				select={this.selectNode.bind(this)}
				isDescendant={this.isDescendant}
				collapsed={this.state.collapsed}
				addNode={this.addNode.bind(this)}
				node={node}
			> {node.children && children }
			</Node>);
		};

		const nodes = [];
		for (let i = 0; i < this.state.tree.length; i++) {
			nodes.push(buildNode(this.state.tree[i]));
		}
		return (
			<span>
				<div style={{ width: '100%' }}> {nodes} </div>
			</span>);
	}
}

export default DragDropContext(HTML5Backend)(Tree);
