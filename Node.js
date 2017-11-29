import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import FontAwesome from 'react-fontawesome';
import ReactTooltip from 'react-tooltip';
import ItemTypes from './ItemTypes';


const style = {
	// border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
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
	hover(props, monitor, component) {
		if(component.props.collapsed){
			component.props.testToggle();
		}
		const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

		// Get vertical middle
		const nodeChildren = document.getElementById('children_node_'+component.props.node.id);
		const nodeChildrenHeight = (nodeChildren) ? nodeChildren.offsetHeight : 0;

		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top - nodeChildrenHeight) / 2;
		const hoverEightY = (props.node.type == 'search') ? 0 : (hoverBoundingRect.bottom - hoverBoundingRect.top - nodeChildrenHeight) / 8;


		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = clientOffset.y - hoverBoundingRect.top;

		var dropPos = null;
		// Dragging downwards
		if (hoverClientY <= (hoverMiddleY - hoverEightY)) {
			dropPos = 'before';
			component.setState({'isHoverBefore': true});
			component.setState({'isHoverAfter': false});

		}

		// Dragging upwards
		else if (hoverClientY > (hoverMiddleY + hoverEightY )) {
			dropPos = 'after';
			component.setState({'isHoverBefore': false});
			component.setState({'isHoverAfter': true});

		}

		else {
			dropPos = 'into';
			component.setState({'isHoverBefore': false});
			component.setState({'isHoverAfter': false});
		}
		return dropPos;


    },
    drop(props, monitor, component) {
        // monitor.didDrop() checkes if the event was handled by a nested (child) node.
		let didDrop = monitor.didDrop();
		let isHoveringOnThisNode = monitor.isOver({shallow: true});
		if(!didDrop){
			// Determine rectangle on screen
			const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

			// Get vertical middle
			const nodeChildren = document.getElementById('children_node_'+component.props.node.id);
			const nodeChildrenHeight = (nodeChildren) ? nodeChildren.offsetHeight : 0;

			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top - nodeChildrenHeight) / 2;
			const hoverEightY = (props.node.type == 'search') ? 0 : (hoverBoundingRect.bottom - hoverBoundingRect.top - nodeChildrenHeight) / 8;

			// Determine mouse position
			const clientOffset = monitor.getClientOffset();

			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			var dropPos = null;
			// Dragging downwards
			if (hoverClientY <= (hoverMiddleY - hoverEightY)) {
				console.log(" Before Node");
				dropPos = 'before';
			}

			// Dragging upwards
			else if (hoverClientY > (hoverMiddleY + hoverEightY)) {
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
    isHovering: monitor.isOver({ shallow: true })
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
		expandOrCollapse: PropTypes.func.isRequired,
		onMouseEnter: PropTypes.func.isRequired,
		onMouseLeave: PropTypes.func.isRequired,
        node: PropTypes.any.isRequired,
        children: PropTypes.node,
        addNode: PropTypes.func.isRequired,
        isHovering: PropTypes.bool.isRequired,
		isHoverBefore: PropTypes.bool.isRequired,
		isHoverAfter: PropTypes.bool.isRequired,
		collapsed: PropTypes.bool.isRequired,
		color: PropTypes.any.isRequired
	}

	render() {
        const { isDragging, connectDragSource, connectDropTarget, testToggle, node, children, isHovering,
			isHoverBefore, isHoverAfter, collapsed, expandOrCollapse, onMouseLeave, onMouseEnter, color} = this.props;
        const opacity = isDragging ? 0.4 : 1;
		let shade = (isHovering && !isDragging && !isHoverBefore && !isHoverAfter && node.type !=='search') ? {backgroundColor: '#e4dedd'} : {backgroundColor: 'transparent'};

		let hoveringBeforeNode = isHoverBefore && isHovering && !isDragging;
		let hoverBeforeVisibility = hoveringBeforeNode ? 'visible' : 'hidden';

		let hoveringAfterNode = isHoverAfter && isHovering && !isDragging;
		let hoverAfterVisibility = hoveringAfterNode ? 'visible' : 'hidden';

		let visibility = (collapsed) ? 'none' : 'block';
		let statusIcon = (collapsed) ? 'plus' : 'minus';
		let icon = (!collapsed && node.type !== 'search' ) ? 'folder-open' : node.type;

		if(node.rootNode){
				return connectDropTarget(
					<div>
						<ul id={"node_"+node.id} style={{ listStyleType: 'none'}} >{children}</ul>
						{ isHovering && <hr />}
					</div>

		        );
		}else{
				return connectDragSource(connectDropTarget(
					<div>
		            <li
						onMouseOver={onMouseEnter}
						onMouseOut={onMouseLeave}
						id={"node_"+node.id}
		                key={node.id}
		                style={{
		                    ...style,
							...shade,
							color,
		                    opacity,
		                    cursor: 'move'
		                }}
		            >
						<hr style={{visibility: hoverBeforeVisibility}} id="before"/>
		                <input
		                    type="checkbox"
		                    onChange={testToggle}
		                />
						<span data-tip data-for={'hover_node_'+node.id}>
							<FontAwesome
								onClick={expandOrCollapse}
						        name={icon}
						        style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
						      />
			                <small  > {node.title } </small>
						</span>
						<ReactTooltip offset={{bottom:10, right: node.title.length*10 }} isCapture={false} event="mouseover" eventOff="mouseout" place="right" type="dark" effect="solid" id={'hover_node_'+node.id}>
							{node.title}
						</ReactTooltip>
		                <ul  id={'children_node_'+node.id} style={{ listStyleType: 'none', display: visibility}}>
		                    {children}
		                </ul>
						<hr style={{visibility: hoverAfterVisibility}} id="after"/>

		            </li>

					</div>
					,
		        ));

		}

	}
}

export default class StatefulNode extends Component {
    constructor(props) {
        super(props);
		this.state = {
			color: 'black',
			hoverBefore: false,
			hoverAfter: false,
			collapsed: this.props.collapsed
		}
    }

	componentWillReceiveProps(nextProps){
		this.setState({
			collapsed: nextProps.collapsed
		});
	}

	render() {
		return (
			<Node
				{...this.props}
				node={this.props.node}
				isHoverBefore = {this.state.hoverBefore}
				isHoverAfter = {this.state.hoverAfter}
				collapsed = {this.state.collapsed}
				onMouseEnter= {(e) => this.onMouseEnter(e)}
				onMouseLeave= {(e) => this.onMouseLeave(e)}
				expandOrCollapse = {(e) => this.changeCollapsedState(e)}
				color = {this.state.color}
				testToggle={() => this.testToggle()}
			/>
		)
	}

	changeCollapsedState(e) {
		this.setState({
			collapsed: !this.state.collapsed
		});
	}
	onMouseEnter(e){
		e.stopPropagation();
		// e.nativeEvent.stopImmediatePropagation();
		this.setState({
			color: 'red'
		});
	}

	onMouseLeave(e){
		e.stopPropagation();
		// e.nativeEvent.stopImmediatePropagation();
		this.setState({
			color: 'black'
		});
	}

	testToggle() {
		//console.log("Toggle ...");
	}


}
