import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Actions from './Actions';
import Node from './Node';

class Tree extends Component {

	constructor(props) {
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

	cancelDrop() {
		const action = {
			type: Actions.CANCEL_DROP,
		}
		this.props.dispatch(action);
	}
	drop(dragged, hovered, position) {
		const action = {
			type: Actions.DROP,
			dragged: dragged.node,
			hovered: hovered.node,
			position: position,
		};
		this.props.dispatch(action);
	}
	hover(dragged, hovered, position) {
		const action = {
			type: Actions.HOVER,
			dragged: dragged.node,
			hovered: hovered.node,
			position: position,
		};
		this.props.dispatch(action);

	}

	render() {
		const buildNode = (node) => {
			const children = [];
			for (let i = 0; node.children && i < node.children.length; i++) {
				children.push(buildNode(node.children[i]));
			}
			return (<Node
				isDescendant={this.isDescendant}
				cancelDrop={this.cancelDrop.bind(this)}
				drop={this.drop.bind(this)}
				hover={this.hover.bind(this)}
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
Tree.defaultProps = {
	dispatch() {},
};
const Positions = {
	INTO: 'into',
	BEFORE: 'before',
	AFTER: 'after',
};
export { Positions };
export default DragDropContext(HTML5Backend)(Tree);
