import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { fromJS } from 'immutable';
import ItemTypes from './ItemTypes';
import { Positions } from './Tree';


const style = {
	marginBottom: '.5rem',
	padding: '0.5rem 1rem',
	margin: '0.0rem',
};

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
const getHoverPos = (component, monitor) => {
	const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
	const nodeChildren = document.getElementById(
		`children_node_${component.props.node.get('id')}`);
	const nodeChildrenHeight = (nodeChildren) ? nodeChildren.offsetHeight : 0;
	const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top -
		nodeChildrenHeight) / 2;
	const tolerance = 8;
	const hoverTolerance = (hoverBoundingRect.bottom - hoverBoundingRect.top -
		nodeChildrenHeight) / tolerance;


	// Determine mouse position
	const clientOffset = monitor.getClientOffset();

	// Get pixels to the top
	const hoverClientY = clientOffset.y - hoverBoundingRect.top;

	let hoverPosition = null;

	// Dragging downwards
	if (hoverClientY <= (hoverMiddleY - hoverTolerance)) {
		hoverPosition = Positions.get('BEFORE');
	}
	// Dragging upwards
	else if (hoverClientY > (hoverMiddleY + hoverTolerance)) {
		hoverPosition = Positions.get('AFTER');

	}

	else {
		hoverPosition = Positions.get('INTO');

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
							isDescendant(fromJS(dragged.get('node')),
							target.getIn([ 'target', 'node', 'id' ]));
		if (hasTarget && !targetIsDragged && !targetUnderSource) {
			dragged.toJS().drop(dragged, target.get('target'),
				target.get('position'));
		}
		else {
			dragged.toJS().cancelDrop();
		}
	},
};

const nodeTarget = {
	hover(hoveredJS, monitor, component) {
		const hovered = fromJS(hoveredJS);
		if (monitor.isOver({ shallow: true })) {
			const hoverPosition = getHoverPos(component, monitor);
			const dragged = fromJS(monitor.getItem());
			const currentHover = `${dragged.get('id')}-${
					hovered.get('id')}-${hoverPosition}`;
			if (component.lastHover === currentHover) { return; }
			component.lastHover = currentHover;
			hovered.toJS().hover(dragged, hovered, hoverPosition);
		}
	},
	drop(target, monitor, component) {
		const didDrop = monitor.didDrop();
		if (!didDrop) {
			const position = getHoverPos(component, monitor);
			return { target: target, position: position };
		}
		return undefined;
	},
};

class Node extends Component {

	render() {
		const { connectDragSource, connectDropTarget, isDragging, children,
				nodeRenderer, node } = this.props;

		const nodeJSX = nodeRenderer(node.toJS());

		if (node.get('rootNode')) {
			return (<div style={{ width: '100%'}}>
				<ul
					id={`node_${node.get('id')}`}
					style={{ listStyleType: 'none', ...style }}
				>
					{children}
				</ul>
			</div>);
		}
		else {
			return connectDragSource(connectDropTarget(
				<div>
					<li
						className={'node' +
						(node.get('hover') ? ` ${node.get('hover')} hover` : '') +
						(isDragging ? ' drag' : '')}
						id={`node_${node.get('id')}`}
						key={node.get('id')}
						style={{
							...style,
							cursor: 'move',
							display: 'block',
							width: '100%',
						}}
					>
						{nodeJSX}
						<ul
							className={'children' +
							(node.get('collapsed') ? ' collapsed' : '')}
							id={`children_node_${node.get('id')}`}
							style={{ listStyleType: 'none' }}
						>
							{children}
						</ul>
					</li>
				</div>
					,
				));

		}

	}
}
Node.propTypes = {
	connectDragSource: PropTypes.func.isRequired,
	connectDropTarget: PropTypes.func.isRequired,
	isDragging: PropTypes.bool.isRequired,
	node: PropTypes.any.isRequired,
	children: PropTypes.node,
	drop: PropTypes.func.isRequired,
	hover: PropTypes.func.isRequired,
	cancelDrop: PropTypes.func.isRequired,
	isHovering: PropTypes.bool.isRequired,
	nodeRenderer: PropTypes.func.isRequired,
};


export default DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isHovering: monitor.isOver({ shallow: true }),
}))(DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))(Node));
