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

	const isDraggingDown = hoverClientY <= (hoverMiddleY - hoverTolerance);
	const isDraggingUp = hoverClientY > (hoverMiddleY + hoverTolerance);

	let hoverPosition = null;
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
		dragged.drag(dragged.node);
		return dragged;
	},


	endDrag(dragged, monitor) {
		const target = monitor.getDropResult();
		const draggedNode = fromJS(dragged.node);
		const hasTarget = target && target.target && target.target.node;
		const targetIsDragged = hasTarget &&
			target.target.node.id === draggedNode.get('id');
		const targetUnderSource = hasTarget &&
			isDescendant(draggedNode, target.target.node.id);

		if (hasTarget && !targetIsDragged && !targetUnderSource) {
			dragged.drop(draggedNode, fromJS(target.target.node), target.position);
		}
		else {
			dragged.cancelDrop();
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


function calculateNodeClassNames(node) {
	const hoverClass = node.has('hover') ? ` ${node.get('hover')} hover` : '';
	const dragClass = node.has('drag') ? ' drag' : '';
	const selectedClass = node.has('selected') ? ' selected' : '';
	const customClass = node.has('className') ? node.get('className') : '';
	const collapsedClass = node.get('collapsed') ? ' collapsed' : '';

	return hoverClass +
		dragClass +
		selectedClass +
		customClass +
		collapsedClass;
}


class Node extends Component {

	componentWillReceiveProps(nextProps) {
		const node = nextProps.node;
		if (!nextProps.isHovering && node.has('hover')) {
			nextProps.stopHover();
		}
	}

	shouldComponentUpdate(newProps) {
		return newProps.node !== this.props.node;
	}

	render() {
		const { connectDragSource, connectDropTarget, children,
				nodeRenderer, node } = this.props;
		const nodeJSX = nodeRenderer(node);

		return connectDragSource(connectDropTarget((
			<li
				ref={(element) => { this.element = element; }}
				className={`no-list node${calculateNodeClassNames(node)}`}
			>
				{nodeJSX}
				<ul
					className="no-list children"
				>
					{children}
				</ul>
			</li>
		)));
	}
}


Node.propTypes = {
	connectDragSource: PropTypes.func.isRequired,
	connectDropTarget: PropTypes.func.isRequired,
	node: PropTypes.shape({}).isRequired,
	// 2018-02-21 AmK,JaF: eslint does not check prop usage in componentWillReceiveProps
	//eslint-disable-next-line react/no-unused-prop-types
	isHovering: PropTypes.bool.isRequired,
	//eslint-disable-next-line react/no-unused-prop-types
	drag: PropTypes.func,
	//eslint-disable-next-line react/no-unused-prop-types
	drop: PropTypes.func,
	//eslint-disable-next-line react/no-unused-prop-types
	hover: PropTypes.func,
	//eslint-disable-next-line react/no-unused-prop-types
	cancelDrop: PropTypes.func,
	//eslint-disable-next-line react/no-unused-prop-types
	stopHover: PropTypes.func,
	children: PropTypes.node,
	nodeRenderer: PropTypes.func.isRequired,
};

Node.defaultProps = {
	children: undefined,
	cancelDrop() {},
	stopHover() {},
	hover() {},
	drop() {},
	drag() {},
};

export default DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isHovering: monitor.isOver({ shallow: true }),
}))(DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))(Node));
