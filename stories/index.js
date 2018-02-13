import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import { ExampleNode, ExampleNodeSelection,
	ExampleNodeCollapse } from './examples';
import Tree, { positions, reducers, actions, actionCreators } from '../src/index';
import './css/styles.css';
import './css/font-awesome.min.css';


const initState = fromJS({
	tree: [
		{ title: 'Root',
			id: 1,
			type: 'folder',
			selected: false,
			collapsed: false,
			children: [ { title: 'Child',
				selected: false,
				collapsed: false,
				id: 2,
				type: 'folder',
				children: [ {
					title: 'Child 22 abc def ghi',
					selected: false,
					collapsed: false,
					id: 3,
					type: 'search',
				} ],
			}, {
				title: 'Hovered Child',
				selected: false,
				collapsed: false,
				id: 8,
				type: 'folder',
			} ] },
			{ title: 'Empty', id: 4, type: 'search', selected: false, collapsed: false },
		{ title: 'Two Nodes',
			selected: false,
			collapsed: false,
			id: 5,
			type: 'folder',
			children: [
				{ title: 'Node 1',
					selected: false,
					collapsed: false,
					id: 6,
					type: 'search' },
				{ title: 'Node 2',
					selected: false,
					collapsed: false,
					id: 7,
					type: 'folder' },
			] },
	],
});

const store = createStore(reducer, initState);


function reducer(state, actionObj) {
	const action = fromJS(actionObj);
	switch (action.get('type')) {
	case actions.COLLAPSE:
		return state.set('tree', reducers.collapseNode(state.get('tree'), action));
	case actions.SELECT:
		return state.set('tree', reducers.selectNode(state.get('tree'), action));
	case actions.CANCEL_DROP:
		return state.set('tree', reducers.removeAllEffects(state.get('tree')));
	case actions.DROP:
		return state.set('tree', reducers.dropNode(state.get('tree'), action, canDrop));
	case actions.HOVER:
		return state.set('tree',
			reducers.setHoverEffects(state.get('tree'), action, canDrop));
	default:
		return state;
	}
}

function cancelDrop() {
	store.dispatch(actionCreators.createCancelDropAction());
}


function drop(dragged, target, position) {
	store.dispatch(actionCreators.createDropAction(dragged, target, position));
}


function hover(dragged, target, position) {
	store.dispatch(actionCreators.createHoverAction(dragged, target, position));
}


function canDrop(action) {
	if (action.getIn([ 'target', 'type' ]) === 'search' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}


class Subscriber extends Component {
	constructor(props) {
		super(props);

		this.unsubscribe = props.subscribe(() => {
			this.setState({ r: Math.random() });
		});
	}
	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {

		return (<div>
			{this.props.doRender()}
		</div>);
	}
}


Subscriber.propTypes = {
	subscribe: PropTypes.func.isRequired,
	doRender: PropTypes.func.isRequired,
};


function rerenderOn(subscribe, doRender) {
	return () => (
		<Subscriber
			subscribe={subscribe}
			doRender={doRender}
		/>
	);
}


storiesOf('Drag and Drop', module).
	add('Hover before rendering', () => {
		const action = {
			type: actions.HOVER,
			dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			position: positions.get('BEFORE'),
		};
		store.dispatch(action);
		return (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={
				(nodeData) => <ExampleNode
					data={nodeData}
				/>
			}
			/>

		);
	}).
		add('Hover after rendering', () => {
			const action = {
				type: actions.HOVER,
				dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				position: positions.get('AFTER'),
			};
			store.dispatch(action);
			return (
				<Tree
					tree={store.getState().get('tree')}
					renderNode={
					(nodeData) => <ExampleNode
						data={nodeData}
					/>
				}
				/>

			);
		}).
			add('Hover In', () => {
				const action = {
					type: actions.HOVER,
					dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					position: positions.get('INTO'),
				};
				store.dispatch(action);
				return (
					<Tree
						tree={store.getState().get('tree')}
						renderNode={
						(nodeData) => <ExampleNode
							data={nodeData}
						/>
						}
					/>

				);
			});

storiesOf('Interactive Tree', module).
		add('Tree Rendering', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={(nodeData) => (<ExampleNode
					data={nodeData}
				/>)}
			/>
		))).
		add('DND Tree', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop}
				drop={drop}
				hover={hover}
				renderNode={(nodeData) => (<ExampleNode
					data={nodeData}
				/>)}
			/>
		))).
		add('Select Node', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop}
				drop={drop}
				hover={hover}
				renderNode={
					(nodeData) => <ExampleNodeSelection
						select={() => {
							const action = {
								type: actions.SELECT,
								selected: nodeData,
							};
							store.dispatch(action);
						}}
						data={nodeData}
					/>
							}
			/>
		))).
		add('Expand/Collapse Node', rerenderOn(store.subscribe, () => (
			<Tree
				tree={store.getState().get('tree')}
				cancelDrop={cancelDrop}
				drop={drop}
				hover={hover}
				renderNode={
					(nodeData) => <ExampleNodeCollapse
						click={() => {
							const action = {
								type: actions.COLLAPSE,
								collapsed: nodeData,
							};
							store.dispatch(action);
						}}
						data={nodeData}
					/>
							}
			/>
		)));
