import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import PropTypes from 'prop-types';
import HTML5Backend from 'react-dnd-html5-backend';
import Node from './Node';

function buildNode(nodes, handlers, draggable) {
	return nodes.map((node) => (
		<Node
			key={node.get('id')}
			cancelDrop={(...args) => handlers.cancelDrop(...args)}
			drag={(...args) => handlers.drag(...args)}
			drop={(...args) => handlers.drop(...args)}
			hover={(...args) => handlers.hover(...args)}
			stopHover={(...args) => handlers.stopHover(...args)}
			draggable={draggable}
			node={node}
			nodeRenderer={handlers.renderNode}
		>
			{node.has('children') && buildNode(node.get('children'), handlers, draggable)}
		</Node>
	));
}

class Tree extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tree: this.props.tree,
		};
	}


	componentWillReceiveProps(newProps) {
		this.setState({
			tree: newProps.tree,
		});
	}


	shouldComponentUpdate(newProps) {
		return newProps.tree !== this.props.tree;
	}


	render() {
		const {
			cancelDrop,
			stopHover,
			drop,
			drag,
			hover,
			tree,
			renderNode,
			draggable,
		} = this.props;
		return (
			<ul className="no-list">
				{buildNode(
					this.state.tree,
					{
						cancelDrop,
						stopHover,
						drop,
						drag,
						hover,
						tree,
						renderNode,
					},
					draggable)}
			</ul>
		);
	}
}

Tree.defaultProps = {
	cancelDrop() {},
	drop() {},
	hover() {},
	renderNode() {},
	stopHover() {},
	drag() {},
	draggable: true,
	tree: [],
};

Tree.propTypes = {
	cancelDrop: PropTypes.func,
	stopHover: PropTypes.func,
	drop: PropTypes.func,
	drag: PropTypes.func,
	hover: PropTypes.func,
	draggable: PropTypes.bool,
	tree: PropTypes.shape([]).isRequired,
	renderNode: PropTypes.func.isRequired,
};


export default DragDropContext(HTML5Backend)(Tree);
