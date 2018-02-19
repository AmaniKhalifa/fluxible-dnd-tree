import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { fromJS } from 'immutable';
import ItemTypes from './ItemTypes';
import positions from './positions';
import './css/styles.css';

function isDescendant(node, id) {
	if (node.has('children')) {
		return node.get('children').map(function(child) {
			if (child.get('id') === id) {
				return child;
			}
			else if (child.has('children')) {
				return isDescendant(child, id);
			}
			return undefined;
		}).filter(Boolean).first();
	}
	return undefined;
}


const getMousePosition = (monitor) => monitor.getClientOffset().y;


const getTopPixels = (clientOffset, hoverBoundingRect) =>
	clientOffset - hoverBoundingRect.top;


const getHoverPos = (component, monitor) => {
	const rawComponent = component.getDecoratedComponentInstance();
	const hoverBoundingRect = rawComponent.element.getBoundingClientRect();

	const nodeChildren = document.getElementById(
		`children_node_${component.props.node.get('id')}`);
	const nodeChildrenHeight = (nodeChildren) ? nodeChildren.offsetHeight : 0;

	const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top -
		nodeChildrenHeight) / 2;
	const tolerance = 3;
	const hoverTolerance = (hoverBoundingRect.bottom - hoverBoundingRect.top -
		nodeChildrenHeight) / tolerance;

	const clientOffset = getMousePosition(monitor);
	const hoverClientY = getTopPixels(clientOffset, hoverBoundingRect);
	let hoverPosition = null;

	const isDraggingDown = hoverClientY <= (hoverMiddleY - hoverTolerance);
	const isDraggingUp = hoverClientY > (hoverMiddleY + hoverTolerance);
	if (isDraggingDown) {
		hoverPosition = positions.get('BEFORE');
	}
	else if (isDraggingUp) {
		hoverPosition = positions.get('AFTER');
	}

	else {
		hoverPosition = positions.get('INTO');
	}

	return hoverPosition;
};

const nodeSource = {
	beginDrag(dragged) {
		return dragged;
	},
	endDrag(draggedJS, monitor) {
		const target = fromJS(monitor.getDropResult());
		const dragged = fromJS(draggedJS);
		const hasTarget = target && target.has('target') &&
			target.hasIn([ 'target', 'node' ]);
		const targetIsDragged = hasTarget &&
			target.getIn([ 'target', 'node', 'id' ]) === dragged.getIn([ 'node', 'id' ]);
		const targetUnderSource = hasTarget &&
							isDescendant(dragged.get('node'),
							target.getIn([ 'target', 'node', 'id' ]));
		if (hasTarget && !targetIsDragged && !targetUnderSource) {
			dragged.get('drop')(dragged, target.get('target'),
				target.get('position'));
		}
		else {
			dragged.get('cancelDrop')();
		}
	},
};

const nodeTarget = {
	hover(hovered, monitor, component) {
		const hoveredNode = fromJS(hovered.node);
		if (monitor.isOver({ shallow: true })) {
			const hoverPosition = getHoverPos(component, monitor);
			const dragged = fromJS(monitor.getItem().node);
			if (hoveredNode.get('hover') === hoverPosition) { return; }
			hovered.hover(dragged, hoveredNode, hoverPosition);
		}
	},
	drop(target, monitor, component) {
		const didDrop = monitor.didDrop();
		if (!didDrop) {
			const position = getHoverPos(component, monitor);
			return { target, position };
		}
		return undefined;
	},
};

class Node extends Component {

	componentWillReceiveProps(nextProps) {
		const node = nextProps.node;
		if (!nextProps.isHovering && node.has('hover')) {
			nextProps.cancelDrop();
		}
	}

	shouldComponentUpdate(newProps) {
		return newProps.node !== this.props.node;
	}

	render() {
		const { connectDragSource, connectDropTarget, isDragging, children,
				nodeRenderer, node } = this.props;

		const nodeJSX = nodeRenderer(node);

		if (node.get('rootNode')) {
			return (
				<ul
					id={'root_node'}
					className={'no-list'}
				>
					{children}
				</ul>
			);
		}

		return connectDragSource(connectDropTarget(
			(<li
				ref={(element) => { this.element = element; }}
				className={`no-list node${
					node.get('hover') ? ` ${node.get('hover')} hover` : ''
					}${isDragging ? ' drag' : ''}
					${node.get('selected') ? ' selected' : ''}
					${node.has('className') ? node.get('className') : ''}`}
				id={`node_${node.get('id')}`}
			>
				{nodeJSX}
				<ul
					className={`no-list children${
						node.get('collapsed') ? ' collapsed' : ''}`}
					id={`children_node_${node.get('id')}`}
				>
					{children}
				</ul>
			</li>)
					,
				));


	}
}
Node.propTypes = {
	connectDragSource: PropTypes.func.isRequired,
	connectDropTarget: PropTypes.func.isRequired,
	isDragging: PropTypes.bool.isRequired,
	node: PropTypes.shape({}).isRequired,
	drop: PropTypes.func.isRequired, //eslint-disable-line
	hover: PropTypes.func.isRequired, //eslint-disable-line
	cancelDrop: PropTypes.func.isRequired, //eslint-disable-line
	isHovering: PropTypes.bool.isRequired, //eslint-disable-line
	children: PropTypes.node,
	nodeRenderer: PropTypes.func.isRequired,
};

Node.defaultProps = {
	children: undefined,
	isHovering: false,
	cancelDrop() {},
	hover() {},
	drop() {},

};

export default DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isHovering: monitor.isOver({ shallow: true }),
}))(DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))(Node));
