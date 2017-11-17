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
        if(droppedTo.node && droppedTo.node.id != props.node.id){
			props.addNode(props, droppedTo);

		}
    },
}

const nodeTarget = {
	canDrop(props, monitor){
		// You cannot drop into a search node
		if(props.node.type == 'search'){
			console.log("Can't drop");
			console.log("Did Drop ", monitor.didDrop());
			console.log("Is over ", monitor.isOver({ shallow: true }));
			console.log("-------------------------");
			return false;
		}else{
			console.log("************");
			console.log("Can drop");
			console.log("Did Drop ", monitor.didDrop());
			console.log("Is over ", monitor.isOver({ shallow: true }));
			console.log("************");
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
		// monitor.isOver checks if the event is on the current droptarget not a nested one
        if( (monitor.canDrop() && !monitor.didDrop() && !monitor.isOver({ shallow: true }) ) || (!monitor.didDrop() && monitor.isOver({ shallow: true })) ){
            // these (props which is the node that I dropped into) are available to the nodesource as monitor.getDropResult()
			console.log("RETURNING PROPS ", props.node.title);
			return props;
        }

    },
};


@DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isHovering: monitor.isOver({ shallow: true }),
	isHoveringOnSearchChild: monitor.canDrop() && !monitor.didDrop() && monitor.isOver({child: true})
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
		if(isHoveringOnSearchChild){
			color = 'blue';
		}else{
			color = (isHovering && !isDragging && node.type !=='search') || isHoveringOnSearchChild ? 'red' : 'black';
		}
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
