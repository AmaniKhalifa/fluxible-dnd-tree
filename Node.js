import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'
import ItemTypes from './ItemTypes'

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
        if(droppedTo && droppedTo.node.id != props.node.id)
		      props.addNode(props, droppedTo);

	},
}

const nodeTarget = {
	hover(props, monitor) {
		const { id: draggedId } = monitor.getItem();
		const { id: overId } = props;
        // TODO Do some stuff when on hover

	},
    drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
        if(!monitor.didDrop()){
            // these (props which is the node that I dropped into) are available to the nodesource as monitor.getDropResult()
            return props;
        }

    },
};

@DropTarget(ItemTypes.NODE, nodeTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isHovering: monitor.isOver({ shallow: true })
}))
@DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
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
        isHovering: PropTypes.bool.isRequired

	}

	render() {
		const { isDragging, connectDragSource, connectDropTarget, testToggle, node, children, isHovering } = this.props;
		const opacity = isDragging ? 0.4 : 1;
        const color = isHovering && !isDragging ? 'red' : 'black';

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
                <small  style={{color}}> {node.title + " -- ID " + node.id} </small>
                <ul  style={{ listStyleType: 'none'}}>
                    {children}
                </ul>

            </li>,
		));
	}
}

export default class StatefulNode extends Component {
	constructor(props) {
		super(props)
		this.state = {
			node: props.node,
            addNode: props.addNode
		}
	}

	render() {
		return (
			<Node
				{...this.props}
				node={this.state.node}
				testToggle={() => this.handleToggle()}
			/>
		)
	}

	handleToggle() {
		console.log("Checked!!");
	}
}
