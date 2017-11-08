import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import ItemTypes from './ItemTypes'

const style = {
	// border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'white',
	width: '20rem',
}


const nodeSource = {
	beginDrag() {
        console.log("Dragging ...");
		return {}
	},
	endDrag() {
		console.log(" --- Dropped ...");
		return {}
	},
}


@DragSource(ItemTypes.NODE, nodeSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))
class Node extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		isDragging: PropTypes.bool.isRequired,
        testToggle: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        children: PropTypes.node,

	}

	render() {
		const { isDragging, connectDragSource, testToggle, title, id, children } = this.props;
		const opacity = isDragging ? 0.4 : 1;

		return connectDragSource(
            <li
                key={id}
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
                {title}
                <ul  style={{ listStyleType: 'none'}}>
                    {children}
                </ul>

            </li>,
		)
	}
}

export default class StatefulNode extends Component {
	constructor(props) {
		super(props)
		this.state = {
			title: props.title,
            id: props.id,
		}
	}

	render() {
		return (
			<Node
				{...this.props}
				title={this.state.title}
                id={this.state.id}
				testToggle={() => this.handleToggle()}
			/>
		)
	}

	handleToggle() {
		console.log("Checked!!");
	}
}
