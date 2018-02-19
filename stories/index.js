import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import { ExampleNode, ExampleNodeSelection,
	ExampleNodeCollapse } from './examples';
import Tree, { positions, reducers, actions } from '../src/index';
import small from './data_S';
import medium from './data_M';
import large from './data_L';
import xlarge from './data_XL';

import './css/styles.css';
import './css/font-awesome.min.css';


const initState = fromJS({
	tree: xlarge,
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
	const action = {
		type: actions.CANCEL_DROP,
	};
	store.dispatch(action);
}


function drop(dragged, target, position) {
	const action = {
		type: actions.DROP,
		dragged: dragged.get('node'),
		target: target.get('node'),
		position,
	};
	store.dispatch(action);
}


function hover(dragged, hovered, position) {
	const action = {
		type: actions.HOVER,
		dragged: dragged,
		target: hovered,
		position,
	};
	store.dispatch(action);

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
