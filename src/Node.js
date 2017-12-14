import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';


const style = {
	marginBottom: '.5rem',
	padding: '0.5rem 1rem',
	margin: '0.0rem',
};

const getDropPos = (component, monitor) => {
	const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

	// Get vertical middle
	const nodeChildren = document.getElementById('children_node_' +
		component.props.node.id);
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

	let dropPos = null;

	// Dragging downwards
	if (hoverClientY <= (hoverMiddleY - hoverTolerance)) {
		dropPos = 'before';
		component.setState({ isHoverBefore: true });
		component.setState({ isHoverAfter: false });
	}
	// Dragging upwards
	else if (hoverClientY > (hoverMiddleY + hoverTolerance)) {
		dropPos = 'after';
		component.setState({ isHoverBefore: false });
		component.setState({ isHoverAfter: true });
	}

	else {
		dropPos = 'into';
		component.setState({ isHoverBefore: false });
		component.setState({ isHoverAfter: false });
	}

	return dropPos;
};

const nodeSource = {
	beginDrag(props) {
		return props;
	},
	endDrag(props, monitor) {
		const droppedObj = monitor.getDropResult();
		// preventing a node to be dropped inside itself
		const hasTarget = droppedObj && droppedObj.props && droppedObj.props.node;
		const droppedIntoItself = hasTarget && droppedObj.props.node.id === props.node.id;
		const targetUnderSource = hasTarget &&
							props.isDescendant(props.node, droppedObj.props.node.id);
		if (hasTarget && !droppedIntoItself && !targetUnderSource) {
			const droppedTo = droppedObj.props;
			const dropPosition = droppedObj.dropPos;
			props.addNode(props, droppedTo, dropPosition);
		}
	},
};

const nodeTarget = {
	hover(props, monitor, component) {
		// Expanding a folder/project when a node is hovering on it
		// if (component.props.collapsed) {
		// 	component.props.expandOrCollapse();
		// }
		return getDropPos(component, monitor);
	},
	drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		const didDrop = monitor.didDrop();
		if (!didDrop) {
			const dropPos = getDropPos(component, monitor);
			// these (props which is the node that I dropped into)
			// are available to the nodesource as monitor.getDropResult()
			return { props: props, dropPos: dropPos };
		}
		return undefined;
	},
};

class Node extends Component {
	render() {
		const { isDragging, connectDragSource, connectDropTarget, select, node, children,
				isHovering, collapsed, isHoverBefore, isHoverAfter,
				hasSelectedChild } = this.props;
		const opacity = isDragging ? 0.4 : 1;
		const shade = (isHovering && !isDragging &&
			isHoverBefore && isHoverAfter &&
		node.type !== 'search') ? { backgroundColor: '#e4dedd' } :
		{ backgroundColor: 'transparent' };

		const hasSelectedChildrenShade = (collapsed && hasSelectedChild(node)) ?
		{ backgroundColor: '#e8dddc' } : {};
		const hoveringBeforeNode = isHoverBefore && isHovering && !isDragging;
		const borderTop = (hoveringBeforeNode) ?
		{ borderTop: '0.1rem solid' } : { borderTop: 'hidden' };

		const hoveringAfterNode = isHoverAfter && isHovering && !isDragging;
		const borderBottom = (hoveringAfterNode) ?
		{ borderBottom: '0.1rem solid' } : { borderBottom: 'hidden' };

		const visibility = (collapsed) ? 'none' : 'block';

		if (node.rootNode) {
			return connectDropTarget(
				<div style={{ ...shade, width: '100%' }}>
					<ul
						id={'node_' + node.id}
						style={{ listStyleType: 'none', ...style }}
					>
						{children}
					</ul>
				</div>
			);
		}
		else {
			return connectDragSource(connectDropTarget(
				<li
					id={'node_' + node.id}
					key={node.id}
					style={{
						...style,
						opacity,
						...shade,
						...hasSelectedChildrenShade,
						...borderBottom,
						...borderTop,
						cursor: 'move',
						display: 'block',
						width: '100%',
					}}
				>
					<input
						id={'checkbox_node_' + node.id}
						type="checkbox"
						checked={node.selected}
						onChange={select}
					/>
					<span
						style={{ padding: '0.0rem 0.5rem', border: '0.1rem' }}
					>
						<small> {node.title } </small>
					</span>
					<ul
						id={'children_node_' + node.id}
						style={{ listStyleType: 'none', display: visibility }}
					>
						{children}
					</ul>
				</li>
					,
				));

		}

	}
}
Node.propTypes = {
	connectDragSource: PropTypes.func.isRequired,
	connectDropTarget: PropTypes.func.isRequired,
	isDragging: PropTypes.bool.isRequired,
	select: PropTypes.func.isRequired,
	node: PropTypes.any.isRequired,
	children: PropTypes.node,
	addNode: PropTypes.func.isRequired,
	hasSelectedChild: PropTypes.func.isRequired,
	isDescendant: PropTypes.func.isRequired,
	isHovering: PropTypes.bool.isRequired,
	isHoverAfter: PropTypes.bool,
	isHoverBefore: PropTypes.bool,
	collapsed: PropTypes.bool.isRequired,
};


export default DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isHovering: monitor.isOver({ shallow: true })
}))(DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))(Node));
