import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { Map, List } from 'immutable';
import Actions from './Actions';
import Node from './Node';

class Tree extends Component {

	constructor(props) {
		super(props);
		this.state = {
			tree: List([
				Map({ title: 'DummyNode',
					id: '__1',
					rootNode: true,
					children: this.props.tree,
				}),
			]),
		};
	}
	componentWillReceiveProps(newProps) {
		const tree = List([
			Map({ title: 'DummyNode',
				id: '__1',
				rootNode: true,
				children: newProps.tree,
			}),
		]);
		this.setState({
			tree,
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
			position,
		};
		this.props.dispatch(action);
	}
	hover(dragged, hovered, position) {
		const action = {
			type: Actions.HOVER,
			dragged: dragged.get('node'),
			target: hovered.get('node'),
			position,
		};
		this.props.dispatch(action);

	}

	render() {
		const buildNode = (node) => {
			let children = List();
			if (node.get('children')) {
				children = node.get('children').map(
					(child) => buildNode(child)
				);
			}
			return (<Node
				key={node.get('id')}
				isDescendant={this.isDescendant}
				cancelDrop={(...args) => this.cancelDrop(...args)}
				drop={(...args) => this.drop(...args)}
				hover={(...args) => this.hover(...args)}
				node={node}
				nodeRenderer={this.props.renderNode}
			> {node.get('children') && children }
			</Node>);
		};

		const nodes = buildNode(this.state.tree.get(0));
		return (
			<span>
				<div style={{ width: '100%' }}> {nodes} </div>
			</span>);
	}
}
Tree.defaultProps = {
	dispatch() {},
	renderNode() {},
	tree: [],
};
Tree.propTypes = {
	dispatch: PropTypes.func.isRequired,
	tree: PropTypes.any.isRequired,
	renderNode: PropTypes.func.isRequired,
};
const Positions = Map({
	INTO: 'into',
	BEFORE: 'before',
	AFTER: 'after',
});
export { Positions };
export default DragDropContext(HTML5Backend)(Tree);
