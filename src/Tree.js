import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import { Map, List } from 'immutable';
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
		const tree = this.state.tree;
		this.setState({
			tree: List.of(tree.first().set('children', newProps.tree)),
		});
	}


	shouldComponentUpdate(newProps) {
		return newProps.tree !== this.props.tree;
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
				cancelDrop={(...args) => this.props.cancelDrop(...args)}
				drop={(...args) => this.props.drop(...args)}
				hover={(...args) => this.props.hover(...args)}
				node={node}
				nodeRenderer={this.props.renderNode}
			> {node.get('children') && children }
			</Node>);
		};

		const nodes = buildNode(this.state.tree.get(0));
		return (
			<div> {nodes} </div>
		);
	}
}

Tree.defaultProps = {
	cancelDrop() {},
	drop() {},
	hover() {},
	renderNode() {},
	tree: [],
};

Tree.propTypes = {
	cancelDrop: PropTypes.func,
	drop: PropTypes.func,
	hover: PropTypes.func,
	tree: PropTypes.shape([]).isRequired,
	renderNode: PropTypes.func.isRequired,
};


export default DragDropContext(HTML5Backend)(Tree);
