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

const getHoverPos = (component, monitor) => {
	const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
	// Get vertical middle
	const nodeChildren = document.getElementById(
		`children_node_${component.props.node.id}`);
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
	// let hover = { isHoveringBefore: false, isHoveringAfter: false };

	// Dragging downwards
	if (hoverClientY <= (hoverMiddleY - hoverTolerance)) {
		hoverPosition = 'before';
		// hover = { isHoveringBefore: true, isHoveringAfter: false };
	}
	// Dragging upwards
	else if (hoverClientY > (hoverMiddleY + hoverTolerance)) {
		hoverPosition = 'after';
		// hover = { isHoveringBefore: false, isHoveringAfter: true };

	}

	else {
		hoverPosition = 'into';
		// hover = { isHoveringBefore: false, isHoveringAfter: false };

	}

	return hoverPosition;
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
			props.drop(props, droppedTo, dropPosition);
		}
		else {
			props.cancelDrop();
		}
	},
};

const nodeTarget = {
	hover(props, monitor, component) {
		if (monitor.isOver({ shallow: true })) {
			const hoverPosition = getHoverPos(component, monitor);
			const dragged = monitor.getItem();
			const hovered = props;
			const currentHover = `${dragged.id}-${hovered.id}-${hoverPosition}`;
			if (component.lastHover === currentHover) { return; }
			component.lastHover = currentHover;
			props.hover(dragged, hovered, hoverPosition);
		}
	},
	drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		const didDrop = monitor.didDrop();
		if (!didDrop) {
			const dropPos = getHoverPos(component, monitor);
			return { props: props, dropPos: dropPos };
		}
		return undefined;
	},
};

class Node extends Component {
	// constructor(props) {
	// 	super(props);
	// 	this.state = {
	// 		node: this.props.node,
	// 	};
	// }
	// updateNode(node) {
	// 	this.setState({ node: node });
	// }
	render() {
		// const node = this.state.node;
		const collapsed = this.props.collapsed ? this.props.collapsed : false;
		const { connectDragSource, connectDropTarget, children,
				nodeRenderer, node } = this.props;
	//	console.warn("Node is rendering ", node);


		// const hoveringOnNode = isHovering && !isDragging;
		// const hoveringBeforeNode = isHoveringBefore && isHovering && !isDragging;
		// const hoveringAfterNode = isHoveringAfter && isHovering && !isDragging;

		const visibility = (collapsed) ? 'none' : 'block';
		const nodeJSX = nodeRenderer(node);

		if (node.rootNode) {
			return(<div style={{ width: '100%'}}>
					<ul
						id={`node_${node.id}`}
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
						(node.hover ? ` ${node.hover} hover` : '')}
						id={`node_${node.id}`}
						key={node.id}
						style={{
							...style,
							cursor: 'move',
							display: 'block',
							width: '100%',
						}}
					>
						{nodeJSX}
						<ul
							id={`children_node_${node.id}`}
							style={{ listStyleType: 'none', display: visibility }}
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
	isDescendant: PropTypes.func.isRequired,
	isHovering: PropTypes.bool.isRequired,
	isHoveringAfter: PropTypes.bool,
	isHoveringBefore: PropTypes.bool,
	collapsed: PropTypes.bool,
	nodeRenderer: PropTypes.func.isRequired,
};


export default DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isHovering: monitor.isOver({ shallow: true }),
}))(DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))(Node));
