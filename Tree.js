import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Node from './Node';

@DragDropContext(HTML5Backend)
export default class Tree extends Component {

    state = {
          tree: [
              {title: 'Root', id: 1, children: [
                                            {title: 'Child', id: 2, children:[ {title: ' Child 22', id: 3}]}
                                    ]},

          {title: 'Empty', id: 4},

          {title: 'Two Nodes', id: 5, children: [
                            {title: 'Node 1', id: 6},
                            {title: 'Node 2', id: 7}
          ]}

        ]
    };


    removeNode = (array, id) => {
        for (var i = 0; i < array.length; ++i) {
            var obj = array[i];
            if (obj.id === id) {
                array.splice(i, 1);
                return true;
            }
            else if (obj.children) {
                if (this.removeNode(obj.children, id)) {
                    if (obj.children.length === 0) {
                        delete obj.children;
                    }
                    return true;
                }
            }
        }
        return;
    }

    addNode = (node, parent) => {
        parent = parent.node;
        node = node.node;
        // TODO delete the node and add the same node to the same place
        this.removeNode(this.state.tree, node.id);

        if(!parent.children){
            parent.children = [];
        }
        parent.children.push(node);
        console.log("Tree  ", this.state.tree);
        this.forceUpdate();

    };



	render() {
        const buildNode = (node) => {
            var children = [];
            for (var i = 0; node.children && i < node.children.length; i++) {
                  children.push(buildNode(node.children[i]));
            }
            return <Node addNode={this.addNode} node={node} > {node.children && children } </Node>;
        };

        let nodes = [];
        for (let i = 0; i < this.state.tree.length; i++) {
            nodes.push(buildNode( this.state.tree[i]));
        }

		return (
			<div style={{ overflow: 'hidden', clear: 'both', margin: '-.5rem' }}>
				<div style={{ float: 'left' }}>
                    <ul style={{ listStyleType: 'none'}}>
                        {nodes}
                    </ul>
				</div>

			</div>

		)
	}
}
