import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Node from './Node';

@DragDropContext(HTML5Backend)
export default class Tree extends Component {

    state = {
          tree: [
              {title:'DummyNode', id:0, rootNode:true, children:[
                  {title: 'Root', id: 1, type:'folder', children: [
                                                {title: 'Child', pid:1, id: 2, type:'folder', children:[ {title: ' Child 22 abc def ghi', id: 3, type:'search'}]}
                                        ]},

              {title: 'Empty', id: 4, type:'search'},

              {title: 'Two Nodes', id: 5, type:'folder',  children: [
                                {title: 'Node 1', id: 6, type: 'search'},
                                {title: 'Node 2', id: 7, type: 'folder'}
              ]}
              ]}
        ],
        collapsed: false
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


    getParent = (node, id) => {
        if (node.children) {
            let children = node.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].id === id ) {
                    return {'node':node,'index':i};
                }
            }
            for (let i = 0; i < children.length; i++) {
                let res = this.getParent(children[i], id);
                if(res){
                    return res;
                }
            }
        }

    }
    addNode = (node, parent, position) => {
        parent = parent.node;
        node = node.node;
        // Not dropping before/after dummy root node
        if(!(parent.rootNode && position !== 'into')){
            this.removeNode(this.state.tree, node.id);
            if(position == 'into'){
                if(!parent.children){
                    parent.children = [];
                }
                parent.children.push(node);
            }else {
                var t = this.getParent(this.state.tree[0], parent.id);
                let tNode = t['node'];
                let tIndex = t['index'];
                if(position == 'before'){
                    tNode.children.splice(tIndex, 0, node);
                }else{
                    tNode.children.splice(tIndex + 1, 0, node);
                }
            }
        }


        this.forceUpdate();

    };

	render() {
        const buildNode = (node) => {
            var children = [];
            for (var i = 0; node.children && i < node.children.length; i++) {
                  children.push(buildNode(node.children[i]));
            }
            return <Node  collapsed={this.state.collapsed} addNode={this.addNode} node={node} > {node.children && children } </Node>;
        };

        let nodes = [];
        for (let i = 0; i < this.state.tree.length; i++) {
            nodes.push(buildNode( this.state.tree[i] ));
        }

		return (
			<span >
                <button onClick={() => {
                    this.setState({
                        collapsed: !this.state.collapsed
                    });
                }}>
                    {this.state.collapsed ? 'Expand All' : 'Collapse All'}
                </button>

                {/* <input type="text" id="uname" name="name"/> */}
                <div style={{width: '100%'}}>
                    {nodes}
                </div>

			</span>

		)
	}
}
