import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';
import FontAwesome from 'react-fontawesome';
import ReactDOM from 'react-dom';


const style = {
	// border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'transparent',
	width: '20rem',
}


const nodeSource = {
	beginDrag(props) {
        return props;
	},
    endDrag(props, monitor) {
		const droppedObj = monitor.getDropResult();

        // preventing a node to be dropped inside itself
		let hasDropTarget = droppedObj && droppedObj.props && droppedObj.props.node;
		let droppedIntoItself = hasDropTarget && droppedObj.props.node.id === props.node.id;
        if(hasDropTarget && !droppedIntoItself){
			const droppedTo = droppedObj.props;
			const dropPosition = droppedObj.dropPos;
			props.addNode(props, droppedTo, dropPosition);
		}
    },
}

const nodeTarget = {
	canDrop(props, monitor){
		// You cannot drop into a search node
		if(props.node.type == 'search'){
			return false;
		}else{
			return true;
		}
	},
	hover(props, monitor, component) {
        const dragged  = monitor.getItem();
        const droppedTo  = props;
        // TODO Do some stuff when on hover

		// const dragIndex = monitor.getItem().node.id;
		// const hoverIndex = props.node.id;
		//
		//
		// let dragEl = document.getElementById("node_"+dragIndex);
		// let hoverEl = document.getElementById("node_"+hoverIndex);
		// let position = dragEl.compareDocumentPosition(hoverEl);
		// // console.log(position);
		// // console.log("following", position & 0x04);
		// // console.log("preceding", position & 0x02);
		// //
		// // if( position & 0x04) {
		// //   console.log("Dragged before hover");
		// //  	}
		// //  	if( position & 0x02){
		// //   console.log("Hovered is before Dragged");
		// // }
		// let dragbefore = position & 0x04;
		// let hoverbefore = position & 0x02;
		// // Determine rectangle on screen
		// const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
		//
		// // Get vertical middle
		// const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
		//
		// // Determine mouse position
		// const clientOffset = monitor.getClientOffset()
		//
		// // Get pixels to the top
		// const hoverClientY = clientOffset.y - hoverBoundingRect.top
		//
		// // Only perform the move when the mouse has crossed half of the items height
		// // When dragging downwards, only move when the cursor is below 50%
		// // When dragging upwards, only move when the cursor is above 50%
		//
		// // Dragging downwards
		// if (hoverClientY < hoverMiddleY) {
		// 	console.log(" vvv - Dragging downwards");
		// }
		//
		// // Dragging upwards
		// if (hoverClientY > hoverMiddleY) {
		// 	console.log(" ^^^ - Dragging upwards");
		//
		// }
		// Time to actually perform the action


    },
    drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		let didDrop = monitor.didDrop();
		let isHoveringOnThisNode = monitor.isOver({shallow: true});
		if(!didDrop){

			const draggedIndex = monitor.getItem().node.id;
			const dropToIndex = props.node.id;
			console.log("dragged ", draggedIndex);
			console.log("dropToIndex", dropToIndex);

			let draggedEl = document.getElementById("node_"+draggedIndex);
			let droppedToEl = document.getElementById("node_"+dropToIndex);
			let position = draggedEl.compareDocumentPosition(droppedToEl);
			// console.log(position);
			// console.log("following", position & 0x04);
			// console.log("preceding", position & 0x02);
			//
			// if( position & 0x04) {
			//   console.log("Dragged before hover");
			//  	}
			//  	if( position & 0x02){
			//   console.log("Hovered is before Dragged");
			// }
			let draggedBefore = position & 0x04;
			let deoppedBefore = position & 0x02;
			// Determine rectangle on screen
			const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

			// Get vertical middle
			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const hoverEightY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 8;


			// Determine mouse position
			const clientOffset = monitor.getClientOffset();

			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			var dropPos = null;
			// Dragging downwards
			if (hoverClientY < hoverMiddleY - hoverEightY) {
				console.log(" Before Node");
				dropPos = 'before';
			}

			// Dragging upwards
			else if (hoverClientY > hoverMiddleY + hoverEightY) {
				console.log(" After Node");
				dropPos = 'after';
			}

			else{
				console.log(" Into Node");
				dropPos = 'into';
			}


            // these (props which is the node that I dropped into) are available to the nodesource as monitor.getDropResult()
			return {'props':props, 'dropPos': dropPos};
        }
    },
};


@DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isHovering: monitor.isOver({ shallow: true }),
	isHoveringOnSearchChild: monitor.canDrop()  && monitor.isOver({shallow: true})
}))
@DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))
class Node extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        testToggle: PropTypes.func.isRequired,
        node: PropTypes.any.isRequired,
        children: PropTypes.node,
        addNode: PropTypes.func.isRequired,
        isHovering: PropTypes.bool.isRequired,
		isHoveringOnSearchChild: PropTypes.bool.isRequired

	}

	render() {
        const { isDragging, connectDragSource, connectDropTarget, testToggle, node, children, isHovering, isHoveringOnSearchChild } = this.props;
        const opacity = isDragging ? 0.4 : 1;
		let color = 'black';
		// This is for testing purposes

		color = (isHovering && !isDragging && node.type !=='search') || isHoveringOnSearchChild ? 'red' : 'black';
		if(node.rootNode){
			if(!isHovering){
				return connectDragSource(connectDropTarget(
					<ul id={"node_"+node.id} style={{ listStyleType: 'none'}} >{children}</ul>
		        ));
			}else{
				return connectDragSource(connectDropTarget(
					<div>
						<ul id={"node_"+node.id} style={{ listStyleType: 'none'}} >{children}</ul>
						<hr/>
					</div>

		        ));
			}
		}else{
			return connectDragSource(connectDropTarget(
	            <li id={"node_"+node.id}
	                key={node.id}
	                style={{
	                    ...style,
	                    opacity,
	                    cursor: 'move'
	                }}

	            >
	                <input
	                    type="checkbox"
	                    onChange={testToggle}
	                />
					<FontAwesome
				        name={node.type}
				        style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
				      />
	                <small  style={{color}}> {node.title } </small>
	                <ul  style={{ listStyleType: 'none'}}>
	                    {children}
	                </ul>

	            </li>,
	        ));
		}

	}
}

export default class StatefulNode extends Component {
    constructor(props) {
        super(props);
    }

	render() {
		return (
			<Node
				{...this.props}
				node={this.props.node}
				testToggle={() => this.handleToggle()}
			/>
		)
	}

	handleToggle() {
		console.log("Checked!!");
	}
}
