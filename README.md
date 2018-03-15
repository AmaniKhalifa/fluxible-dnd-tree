



# fluxible-dnd-tree #
> Highly customizable drag and drop tree

  fluxible-dnd-tree is a highly customizable drag and drop tree emphasizing uni-directional data flow and seamless integration with the flux pattern.


## Key Features
  * Uni-directional data flow and seamless integration with the flux pattern.
  * You can render your own node component.
  * Custom constraints over dragging sources and dropping targets.
  * The tree view is completely stateless. All view effects have to be represented in the outside state. (This lib provides reducers which implement common dnd behaviour, see examples.)
  * The library use [immutable data](https://facebook.github.io/immutable-js/). So **Map** and **List** refers to [immutable Map object](https://facebook.github.io/immutable-js/docs/#/Map) and [immutable List object](https://facebook.github.io/immutable-js/docs/#/List) respectively.


## Dependencies

[React](https://reactjs.org/)
[React DnD](https://github.com/react-dnd/react-dnd)
[Immutable.js](https://facebook.github.io/immutable-js/)


## Installation
```sh
	npm install fluxible-dnd-tree --save
```


## Usage

* **Implementing a simple tree with no interactions**

```javascript

// tree structure
let tree = List([
	Map({
		id: 1,
		title: 'Node 1',
		children: List([
			Map({ id: 2, title: 'Child 1' }),
			Map({ id: 3, title: 'Child 2' }),
		]),
	}),
	Map({ id: 4, title: 'Node 2' }),
	Map({ id: 5, title: 'Node 3' }),
]);

// tree component to render
<Tree
	tree={tree}
	renderNode={(nodeData) => (<span>{nodeData.title}</span>)}
/>
```
Hint: currently this configuration adds default dnd listeners which makes the nodes draggable. You can turn this off by adding the property `draggable={false}`

* **Drag and Drop tree implementation**

	`fluxible-dnd-tree`  provides readymade action types, action creators and reducers for the dragging and 	dropping events,  they can be used with redux as described below.

```javascript
import React from 'react';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import Tree, { positions, reducers, actions, actionCreators } from 'fluxible-dnd-tree';
import './styles.css';

let initState = fromJS({'tree': tree});
const store = createStore(reducer, initState);

function reducer(state, actionObj) {
	const action = fromJS(actionObj);
	switch (action.get('type')) {
		case actions.DRAG:
			return state.set('tree', reducers.dragNode(state.get('tree'), action));
		case actions.HOVER:
			return state.set('tree', reducers.setHoverEffects(state.get('tree'), action));
		case actions.DROP:
			return state.set('tree', reducers.dropNode(state.get('tree'), action));
		case actions.CANCEL_DROP:
			return state.set('tree', reducers.cancelDrop(state.get('tree')));
		case actions.STOP_HOVER:
			return state.set('tree', reducers.stopHover(state.get('tree')));
		default:
			return state;
	}
}

store.subscribe(render);

function render() {
	return ( <Tree
		tree={store.get('tree')}
		drag={store.dispatch(actionCreators.createDragAction(dragged))}
		hover={store.dispatch(actionCreators.createHoverAction(dragged, target, position))}
		cancelDrop={store.dispatch(actionCreators.createCancelDropAction())}
		stopHover={store.dispatch(actionCreators.createStopHoverAction())}
		drop={store.dispatch(actionCreators.createDropAction(dragged, target, position))}
		renderNode={(nodeData) => /*...*/ }
	/> );
}
```
`styles.css`
In your css file you can define the effects of hovering and dragging.

```css
.node.hover.into {
	background-color: #e4dedd
}
.node.hover.after {
	border-bottom: 1px solid;
}
.node.hover.before {
	border-top: 1px solid;
}
.node.drag {
	opacity: 0.4;
}
```

## Examples

* small working example [here](./blob/master/examples/MyTree.js)
* Storybook examples [here](./blob/master/stories/index.js)


## Props


| Property | Type                             | Default | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|----------|----------------------------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [tree](#tree)     | immutable List of Immutable Maps |         | yes      | Tree data with the following keys: `id` is the primary key for the node.`hover` true if the node is being hovered by another node, false if not.`drag` true if the node is being dragged, false if not.`collapsed` hides children of the node if false, or hides them if true. Defaults to false.`children` is an array of child nodes belonging to the node.`selected` true if the node is selected, false if not.`className` a string of classes separated by space for any extra class you want to add to the node.other properties can be added and used in the renderNode prop |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
|[renderNode](#render-node)      | function                          |               |   yes       | a function that expects the nodeData (immutable Map) and returns a JSX object of how the node would look like.
|[cancelDrop](#cancel-drop)      | function                          |     () => {}  |             | called when a dragged node is dropped while not hovering on any other node.
|[drop](#drop)            | function                          |     () => {}  |             | called when a dragged node is dropped in a new position.
|[drag](#drag)            | function                          |     () => {}  |             | called when dragging begins.
|[hover](#hover)           | function                          |     () => {}  |             | called when a dragged node is hovering another node
|[stopHover](#stop-hover)       | function                          |     () => {}  |             | called when the dragged node stops hovering on any other node.
|[draggable](#draggable)       | boolean                           |      true     |             | True if the nodes are draggable, false if not.



#### <a name="tree">Tree</a>
> Immutable List of immutable Maps

####  <a name="drag">drag</a>
> Function

called when a node is dragged.

* **signature**
	* drag(draggedNode)
* **args**
	* **dragged**: a Map that contains the data of the dragged node. It is called at the start of node dragging.


* If you're using Redux, or Redux like architecture.

`reducers.js`
```javascript
import { actions, reducers } from 'fluxible-dnd-tree';
import { dragNodeReducer } from './reducers';

// handle the action in your store reducer function
case actions.DRAG:
	return state.set('tree', reducers.dragNode(state.get('tree'), action));
```

`yourComponent.js`
```javascript
import Tree, { actionCreators } from 'fluxible-dnd-tree';
import myStore from './store';

// Pass the action reducer to the Tree component
function drag(dragged) {
	myStore.dispatch(actionCreators.createDragAction(dragged));
}

const component = (
	<Tree
		tree={tree}
		drag={drag}
		...
	/>
);

```
---
* When you don't have Redux or Redux like architecture.
```javascript
import Tree, { reducers, actionCreators } from 'fluxible-dnd-tree';
import { List } from 'immutable';

let projectList = List.of(...); // define your Tree

function drag(draggedNode) {
	projectList = reducers.dragNode(projectList,
		actionCreators.createDragAction(dragged, target, position));
	// The projectList is now updated using the default dragNode reducer.
	// In order to see the changes in the Tree component
	// It should be re-rendered using the new projectList.
}

const component = (
	<Tree
		tree={tree}
		drag={drag}
		...
	/>
);
```

----
####   <a name="hover">hover</a>
> Function

called when a node is hovered by another node.

* **signature**
	* hover(dragged, target, position)
* **args**
	* **dragged**: Map object of the dragged node data.
	* **target**: Map object of the hovered node data.
	* **position**: string of the position of the dragged node from the target node.
		* You can import positions from 'fluxible-dnd-tree' to get all the values of position.
		* It could be one of three :
			* positions.get('BEFORE')
			* positions.get('INTO')
			* positions.get('AFTER')

* If you're using Redux, or Redux like architecture.



`reducers.js`

```javascript
import { actions, reducers } from 'fluxible-dnd-tree';
import { hoverNodeReducer } from './reducers'

// handle the action in your store reducer function
case actions.HOVER:
	return hoverNodeReducer(state, action);

// used in the hoverNodeReducer to control the hovering behavior
function canHover(action) {
	if (action.getIn([ 'target', 'type' ]) === 'leaf' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}

function hoverNodeReducer(state, action) {
	if (!canHover(action)) {
		// If the hovering is not allowed you have to remove all hovering effects.
		const treeCopy = reducers.removeEffects(state.get('tree'), [ 'hover' ]);
		return state.set('tree', treeCopy);
	}
	return state.set('tree',
		reducers.setHoverEffects(state.get('tree'), action));
}

```

`yourComponent.js`
```javascript
import Tree, { actionCreators } from 'fluxible-dnd-tree';
import myStore from './store';

// Pass the action reducer to the Tree component
function hover(dragged, target, position) {
	myStore.dispatch(actionCreators.createHoverAction(dragged, target, position));
}

const component = (
	<Tree
		tree={tree}
		hover={hover}
		...
	/>
);

```

* When you don't have Redux or Redux like architecture.
```javascript
import Tree, { reducers, actionCreators } from 'fluxible-dnd-tree';
import { List } from 'immutable';

let projectList = List.of(...); // define your Tree

function hover(draggedNode) {
	projectList = reducers.setHoverEffects(projectList,
		actionCreators.createHoverAction(dragged, target, position));
	// The projectList is now updated using the default setHoverEffects reducer.
	// In order to see the changes in the Tree component
	// It should be re-rendered using the new projectList.
}

const component = (
	<Tree
		tree={tree}
		hover={hover}
		...
	/>
);
```

----

####   <a name="cancel-drop">cancelDrop</a>
>Function

called when the node is dropped outside of a hovering area.

* **signature**
	* cancelDrop()


`reducers.js`

```javascript
import { actions, reducers } from 'fluxible-dnd-tree';

// handle the action in your store reducer function
case actions.CANCEL_DROP:
	return state.set('tree', reducers.cancelDrop(state.get('tree')));
```
`yourComponent.js`
```javascript
import Tree, { actionCreators } from 'fluxible-dnd-tree';
import myStore from './store';

// Pass the action reducer to the Tree component
function cancelDrop() {
	myStore.dispatch(actionCreators.createCancelDropAction());
}

const component = (
	<Tree
		tree={tree}
		cancelDrop={cancelDrop}
		...
	/>
);
```

------

####   <a name="drop">drop</a>

> Function

called when the node is dropped into a hovering area.

* **signature**
	* drop(dragged, target, position)
* **args**
	* **dragged**: Map object of the dragged node data.
	* **target**: Map object of the target node data.
	* **position**: string of the position of the dragged node from the target node.
		* You can import positions from 'fluxible-dnd-tree' to get all the values of position.
		* It could be one of three :
			* positions.get('BEFORE')
			* positions.get('INTO')
			* positions.get('AFTER')


* If you're using Redux, or Redux like architecture.


`reducers.js`

```javascript
import { actions, reducers } from 'fluxible-dnd-tree';

// handle the action in your store reducer function
case actions.DROP:
	return dropNodeReducer(state, action);

// used in the dropNodeReducer to control the dropping behavior
function canDrop(action) {
	if (action.getIn([ 'target', 'type' ]) === 'leaf' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}

function dropNodeReducer(state, action) {
	if (!canDrop(action)) {
		// If the dropping is not allowed you have to remove all hovering/dragging effects.
		return state.set('tree',
			reducers.removeEffects(state.get('tree'), [ 'hover', 'drag' ])
		);
	}
	return state.set('tree', reducers.dropNode(state.get('tree'), action));
}

```

`yourComponent.js`
```javascript
import Tree, { actionCreators } from 'fluxible-dnd-tree';
import myStore from './store';

// Pass the action reducer to the Tree component
function drop(dragged, target, position) {
	myStore.dispatch(actionCreators.createDropAction(dragged, target, position));
}

const component = (
	<Tree
		tree={tree}
		drop={drop}
		...
	/>
);

```
* When you don't have Redux or Redux like architecture.
```javascript
import Tree, { reducers, actionCreators } from 'fluxible-dnd-tree';
import { List } from 'immutable';

let projectList = List.of(...); // define your Tree

function drop(draggedNode) {
	projectList = reducers.dropNode(projectList,
		actionCreators.createDropAction(dragged, target, position));
	// The projectList is now updated using the default dropNode reducer.
	// In order to see the changes in the Tree component
	// It should be re-rendered using the new projectList.
}

const component = (
	<Tree
		tree={tree}
		drop={drop}
		...
	/>
);
```

-----

###   <a name="stop-hover">stopHover</a>
> Function

called when the node is still being dragged but not hovering on any other node.

* **signature**
	* stopHover()

* If you're using Redux, or Redux like architecture.


`reducers.js`

```javascript
import { actions, reducers } from 'fluxible-dnd-tree';

// handle the action in your store reducer function
case actions.STOP_HOVER:
	return state.set('tree', reducers.stopHover(state.get('tree')));
```

`yourComponent.js`
```javascript
import Tree, { actionCreators } from 'fluxible-dnd-tree';
import myStore from './store';

// Pass the action reducer to the Tree component
function stopHover() {
	myStore.dispatch(actionCreators.createStopHoverAction());
}

const component = (
	<Tree
		tree={tree}
		stopHover={stopHover}
		...
	/>
);

```

-----

###  <a name="draggable">draggable</a>
>Boolean

`False` if the tree nodes are not draggable, default is `True`

------

###  <a name="render-node">renderNode</a>
>Function

* **signature** `renderNode(nodeData)`
* **args**
	* nodeData : Map object with the data needed to render the node.
* **return value**
	* a JSX node component

## Development ###

* run `npm install`
* Usage examples are in storybook.
	* Running storybook using : `npm run storybook`
	* In your browser, go to http://localhost:9001/

## How to contribute ###

* Contribution is welcome through pull requests.
