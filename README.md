
# react-dnd-tree #

### What is this repository for? ###

* Drag and Drop Tree using [React dnd library](http://react-dnd.github.io/)


### Installation
```sh
	npm install react-dnd-tree --save
```


### Usage
```javascript

<Tree
	tree={tree}
	cancelDrop={cancelDrop()}
	drop={drop()}
	drag={drag()}
	hover={hover()}
	draggable={true}
	stopHover={stopHover()}
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
## Options



| Property | Type                             | Default | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|----------|----------------------------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| tree     | immutable List of Immutable Maps |         | yes      | Tree data with the following keys: `id` is the primary key for the node.`hover` true if the node is being hovered by another node, false if not.`drag` true if the node is being dragged, false if not.`collapsed` hides children of the node if false, or hides them if true. Defaults to false.`children` is an array of child nodes belonging to the node.`selected` true if the node is selected, false if not.`className` a string,of classes separated by space for any extra class you want to add to the node.other properties can be added and used in the renderNode prop |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
|renderNode      | function                          |               |   yes       | a function that expects the nodeData (immutable Map) and returns a JSX object of how the node would look like.
|cancelDrop      | function                          |     () => {}  |             | called when a dragged node is dropped while not hovering on any other node.
|drop            | function                          |     () => {}  |             | called when a dragged node is dropped in a new position.
|drag            | function                          |     () => {}  |             | called when dragging begins.
|hover           | function                          |     () => {}  |             | called when a dragged node is hovering another node
|stopHover       | function                          |     () => {}  |             | called when the dragged node stops hovering on any other node.
|draggable       | boolean                           |      true     |             | True if the nodes are draggable, false if not.

You can implement these functions, or use the already made reducers and actionCreators as specified in storybook example.

### Development ###

* run npm install
* Usage examples are in storybook.
* Running storybook using : `npm run storybook`
* In your browser, go to http://localhost:9001/
