import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Node from './Node';

class Tree extends Component {

	constructor(props){
		super(props);
		this.state = {
			tree: [
				{ title: 'DummyNode',
					id: '__1',
					rootNode: true,
					children: this.props.tree,
				},
			],
		};
	}
	componentWillReceiveProps(newProps) {
		const tree = [
				{ title: 'DummyNode',
					id: '__1',
					rootNode: true,
					children: newProps.tree
				},
			];
		this.setState({
			tree: tree
		});
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

	position(node, hovered, position) {
		const action = {
			type: 'DROP',
			node: node.node,
			hovered: hovered.node,
			position: position,
		};
		return this.props.dispatch(action);
	}

	render() {
		const buildNode = (node) => {
			const children = [];
			for (let i = 0; node.children && i < node.children.length; i++) {
				children.push(buildNode(node.children[i]));
			}
			return (<Node
				isDescendant={this.isDescendant}
				position={this.position.bind(this)}
				canDrop={this.props.canDrop}
				node={node}
				nodeRenderer={this.props.renderNode}
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
export const DNDTree = DragDropContext(HTML5Backend)(Tree);
export default DNDTree;
