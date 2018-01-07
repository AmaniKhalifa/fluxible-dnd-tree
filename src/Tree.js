import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { fromJS, Map, List } from 'immutable';
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

	cancelDrop() {
		const action = {
			type: Actions.CANCEL_DROP,
		};
		this.props.dispatch(action);
	}
	drop(dragged, target, position) {
		const action = {
			type: Actions.DROP,
			dragged: dragged.get('node'),
			target: target.get('node'),
			position: position,
		};
		this.props.dispatch(action);
	}
	hover(dragged, hovered, position) {
		const action = {
			type: Actions.HOVER,
			dragged: dragged.get('node'),
			hovered: hovered.get('node'),
			position: position,
		};
		this.props.dispatch(action);

	}

	render() {
		const buildNode = (node) => {
			let children = List([]);
			if (node.get('children')) {
				children = node.get('children').map(
					(child) => {
						return buildNode(child);
					}
				);
			}
			return (<Node
				isDescendant={this.isDescendant}
				cancelDrop={this.cancelDrop.bind(this)}
				drop={this.drop.bind(this)}
				hover={this.hover.bind(this)}
				node={node}
				nodeRenderer={this.props.renderNode}
			> {node.get('children') && children }
			</Node>);
		};

		const nodes = buildNode(fromJS(this.state.tree[0]));
		return (
			<span>
				<div style={{ width: '100%' }}> {nodes} </div>
			</span>);
	}
}
Tree.defaultProps = {
	dispatch() {},
	renderNode() {},
	tree: {},
};
const Positions = Map({
	INTO: 'into',
	BEFORE: 'before',
	AFTER: 'after',
});
export { Positions };
export default DragDropContext(HTML5Backend)(Tree);
