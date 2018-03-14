
# react-dnd-tree #
> Highly customisable drag and drop tree

  react-dnd-tree is a Drag and Drop Tree using [React dnd library](http://react-dnd.github.io/)

  ### Advantages
  * You can customize how will your node look like.
  * You get more control into the dragging and dropping behaviour.


### Installation
```sh
	npm install react-dnd-tree --save
```


### Usage
```javascript

<Tree
	tree={tree}
	drag={drag}
	hover={hover}
	cancelDrop={cancelDrop}
	stopHover={stopHover}
	drop={drop}
	draggable={true}
	renderNode={
		(nodeData) => <Node
			click={() => {
				collapse()
			}}
			data={nodeData}
		/>
	}
/>
```
**PLEASE NOTE:** The library do not handle the state changes of the tree on it is own. It is provided through default reducers or you can implement your own reducers. This will be shown by examples. Also the library use [immutable data](https://facebook.github.io/immutable-js/). So **Map** and **List** refers to [immtable Map object](https://facebook.github.io/immutable-js/docs/#/Map) and [immutable List object](https://facebook.github.io/immutable-js/docs/#/List) respectively.

#### Props

##### Tree
> Immutable List of immutable Maps
* ##### Node object
	* id: the primary key for the node.
	* hover: is equal to one of those values: 'BEFORE', 'INTO', 'AFTER'.
		+ If the node is being hovered by another node, hover will have the position of the dragged node relatively to this node.
		* The values are provided through the Map object positions.
			```javascript
			import { positions } from 'react-dnd-tree'; 
			```
	* drag: True if the node is being dragged, otherwise false.
	* collapsed:
		* true: Hides the children of the node.
		* false: Shows the children of the node.
	* selected: true if the node is selected, otherwise false.
	* className: A string of custom classes separated by space for any extra class you want to add to the node.
	* children: An array of nodes.

###  drag
> Function

* **signature**
	* drag(dragged)
* **args**
	* **dragged**: an immutable Map that contains the data of the dragged node. It is called at the start of node dragging.
If you're using redux, you can dispatch a `DRAG` action and handle your store state using the ready made reducers.
```javascript
import Tree, { reducers, actions, actionCreators } from 'react-dnd-tree';

const store = // define you store or import it.

// handle the action in your store reducer function
case actions.DRAG:
	return dragNodeReducer(state, action);

// Pass the action reducer to the Tree component
function drag(dragged) {
	store.dispatch(actionCreators.createDragAction(dragged));
}

function dragNodeReducer(state, action) {
	return state.set('tree', reducers.dragNode(state.get('tree'), action));
}
```

###  hover
> Function

* **signature**
	* hover(dragged, target, position)
* **args**
	* **dragged**: Map object of the dragged node data.
	* **target**: Map object of the hovered node data.
	* **position**: string of the position of the dragged node from the target node.
		* You can import positions from 'react-dnd-tree' to get all the values of position.
		* It could be one of three :
			* positions.get('BEFORE')
			* positions.get('INTO')
			* positions.get('AFTER')

called at the start of node dragging.
called when a node is hovered by another node.
If you're using redux, you can dispatch a `HOVER` action and handle your store state using the ready made reducers.
```javascript
import Tree, { reducers, actions, actionCreators } from 'react-dnd-tree';

const store = // define you store or import it.

// handle the action in your store reducer function
case actions.HOVER:
	return hoverNodeReducer(state, action);

// Pass the action reducer to the Tree component
function hover(dragged, target, position) {
		store.dispatch(actionCreators.createHoverAction(dragged, target, position));
}

// used in the hoverNodeReducer to control the hovering behavior
function canHover(action) {
	if (action.getIn([ 'target', 'type' ]) === 'leaf' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}

// Here you can control the hovering behavior.
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

###  cancelDrop
>Function

* **signature**
	* cancelDrop()

called when the node is dropped outside of a hovering area.
If you're using redux, you can dispatch a `CANCEL_DROP` action and handle your store state using the ready made reducers.
```javascript
import Tree, { reducers, actions, actionCreators } from 'react-dnd-tree';

const store = // define you store or import it.

// handle the action in your store reducer function
case actions.CANCEL_DROP:
	return cancelDropReducer(state);

// Pass the action reducer to the Tree component
function cancelDrop() {
	store.dispatch(actionCreators.createCancelDropAction());
}

function cancelDropReducer(state) {
	return state.set('tree', reducers.cancelDrop(state.get('tree')));
}

```

###  drop
> Function

* **signature**
	* drop(dragged, target, position)
* **args**
	* **dragged**: Map object of the dragged node data.
	* **target**: Map object of the target node data.
	* **position**: string of the position of the dragged node from the target node.
		* You can import positions from 'react-dnd-tree' to get all the values of position.
		* It could be one of three :
			* positions.get('BEFORE')
			* positions.get('INTO')
			* positions.get('AFTER')

called when the node is dropped into a hovering area.
If you're using redux, you can dispatch a `DROP` action and handle your store state using the ready made reducers.
```javascript
import Tree, { reducers, actions, positions, actionCreators } from 'react-dnd-tree';

const store = // define you store or import it.

// handle the action in your store reducer function
case actions.DROP:
	return dropNodeReducer(state, action);

// Pass the action reducer to the Tree component
function drop(dragged, target, position) {
	store.dispatch(actionCreators.createDropAction(dragged, target, position));
}


// used in the dropNodeReducer to control the dropping behavior
function canDrop(action) {
	if (action.getIn([ 'target', 'type' ]) === 'leaf' &&
		action.get('position') === positions.get('INTO')) {
		return false;
	}
	return true;
}


// Here you can control the dropping behaviour.
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

###  stopHover
> Function

* **signature**
	* stopHover()


called when the node is still being dragged but not hovering on any other node.
If you're using redux, you can dispatch a `STOP_HOVER` action and handle your store state using the ready made reducers.
```javascript
import Tree, { reducers, actions, actionCreators } from 'react-dnd-tree';

const store = // define you store or import it.

// handle the action in your store reducer function
case actions.STOP_HOVER:
	return stopHoverReducer(state);

// Pass the action reducer to the Tree component
function stopHover() {
	store.dispatch(actionCreators.createStopHoverAction());
}

function stopHoverReducer(state) {
	return state.set('tree', reducers.stopHover(state.get('tree')));
}

```

### draggable
>Boolean

`False` if the tree nodes are not draggable, default is `True`

### renderNode
>Function

* **signature** `renderNode(nodeData)`
* **args**
	* nodeData : Map object with the data needed to render the node.
* **return value**
	* a JSX node component

## Example
	check the example [here](examples/MyTree.js)

## Options



| Property | Type                             | Default | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|----------|----------------------------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| tree     | immutable List of Immutable Maps |         | yes      | Tree data with the following keys: `id` is the primary key for the node.`hover` true if the node is being hovered by another node, false if not.`drag` true if the node is being dragged, false if not.`collapsed` hides children of the node if false, or hides them if true. Defaults to false.`children` is an array of child nodes belonging to the node.`selected` true if the node is selected, false if not.`className` a string of classes separated by space for any extra class you want to add to the node.other properties can be added and used in the renderNode prop |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
|renderNode      | function                          |               |   yes       | a function that expects the nodeData (immutable Map) and returns a JSX object of how the node would look like.
|cancelDrop      | function                          |     () => {}  |             | called when a dragged node is dropped while not hovering on any other node.
|drop            | function                          |     () => {}  |             | called when a dragged node is dropped in a new position.
|drag            | function                          |     () => {}  |             | called when dragging begins.
|hover           | function                          |     () => {}  |             | called when a dragged node is hovering another node
|stopHover       | function                          |     () => {}  |             | called when the dragged node stops hovering on any other node.
|draggable       | boolean                           |      true     |             | True if the nodes are draggable, false if not.

You can implement these functions, or use the already made reducers and actionCreators as specified in storybook example.

### Development ###

* run `npm install`
* Usage examples are in storybook.
* Running storybook using : `npm run storybook`
* In your browser, go to http://localhost:9001/

### How to contribute ###

* Contribution is welcome through pull requests.
