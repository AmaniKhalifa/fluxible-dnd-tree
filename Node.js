import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';
import FontAwesome from 'react-fontawesome';

const style = {
	// border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'transparent',
	width: '20rem',
}


const nodeSource = {
	beginDrag(props) {
        console.log("Dragging ...");
        return props;
	},
    endDrag(props, monitor) {
        const didDrop = monitor.didDrop();
        const droppedTo = monitor.getDropResult();
        // preventing a node to be dropped inside itself
		let hasDropTarget =  droppedTo && droppedTo.node;
		let droppedIntoItself = hasDropTarget && droppedTo.node.id == props.node.id;
        if(hasDropTarget && !droppedIntoItself){
			props.addNode(props, droppedTo);
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
	hover(props, monitor) {
        const { id: draggedId } = monitor.getItem();
        const { id: overId } = props;
        // TODO Do some stuff when on hover

    },
    drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		let didDrop = monitor.didDrop();
        if(!didDrop){
            // these (props which is the node that I dropped into) are available to the nodesource as monitor.getDropResult()
			return props;
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
					<ul style={{ listStyleType: 'none'}} >{children}</ul>
		        ));
			}else{
				return connectDragSource(connectDropTarget(
					<div>
						<ul style={{ listStyleType: 'none'}} >{children}</ul>
						<hr/>
					</div>

		        ));
			}
		}else{
			return connectDragSource(connectDropTarget(
	            <li
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
