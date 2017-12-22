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

	let dropPos = null;

	// Dragging downwards
	if (hoverClientY <= (hoverMiddleY - hoverTolerance)) {
		dropPos = 'before';
		component.setState({ isHoveringBefore: true });
		component.setState({ isHoveringAfter: false });
	}
	// Dragging upwards
	else if (hoverClientY > (hoverMiddleY + hoverTolerance)) {
		dropPos = 'after';
		component.setState({ isHoveringBefore: false });
		component.setState({ isHoveringAfter: true });
	}

	else {
		dropPos = 'into';
		component.setState({ isHoveringBefore: false });
		component.setState({ isHoveringAfter: false });
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
			props.position(props, droppedTo, dropPosition);
		}
	},
};

const nodeTarget = {
	hover(props, monitor, component) {
		// Expanding a folder/project when a node is hovering on it
		// if (component.props.collapsed) {
		// 	component.props.expandOrCollapse();
		// }
		const position = getDropPos(component, monitor);
		return position;
	},
	drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		const didDrop = monitor.didDrop();
		if (!didDrop) {
			const dropPos = getDropPos(component, monitor);
			const canDrop = props.canDrop(monitor.getItem().node,
			props.node, dropPos);
			// these (props which is the node that I dropped into)
			// are available to the nodesource as monitor.getDropResult()
			if (canDrop) {
				return { props: props, dropPos: dropPos };
			}
			return undefined;
		}
		return undefined;
	},
};

class Node extends Component {
	constructor(props) {
		super(props);
		this.state = {
			node: this.props.node,
		};
	}
	componentWillReceiveProps(newProps) {
		this.updateNode(newProps.node);
	}
	updateNode(node) {
		this.setState({ node: node });
	}
	render() {
		const collapsed = this.props.collapsed ? this.props.collapsed : false;
		const { isDragging, connectDragSource, connectDropTarget, children,
				isHovering, isHoveringBefore, isHoveringAfter,
				hasSelectedChild, nodeRenderer, canDrop } = this.props;
		const opacity = isDragging ? 0.4 : 1;
		const shade = (isHovering && !isDragging && !isHoveringBefore &&
		!isHoveringAfter) ?
		{ backgroundColor: '#e4dedd' } : { backgroundColor: 'transparent' };
		const hasSelectedChildrenShade = (collapsed &&
			hasSelectedChild(this.state.node)) ?
		{ backgroundColor: '#e8dddc' } : {};
		const hoveringBeforeNode = isHoveringBefore && isHovering && !isDragging;
		const borderTop = (hoveringBeforeNode) ?
		{ borderTop: '0.1rem solid' } : { borderTop: 'hidden' };

		const hoveringAfterNode = isHoveringAfter && isHovering && !isDragging;
		const borderBottom = (hoveringAfterNode) ?
		{ borderBottom: '0.1rem solid' } : { borderBottom: 'hidden' };

		const visibility = (collapsed) ? 'none' : 'block';
		const nodeJSX = nodeRenderer(this.state.node, this.updateNode.bind(this));

		if (this.state.node.rootNode) {
			return connectDropTarget(
				<div style={{ ...shade, width: '100%' }}>
					<ul
						id={`node_${this.state.node.id}`}
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
					id={`node_${this.state.node.id}`}
					key={this.state.node.id}
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
					{nodeJSX}
					<ul
						id={`children_node_${this.state.node.id}`}
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
	node: PropTypes.any.isRequired,
	children: PropTypes.node,
	position: PropTypes.func.isRequired,
	isDescendant: PropTypes.func.isRequired,
	canDrop: PropTypes.func.isRequired,
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
