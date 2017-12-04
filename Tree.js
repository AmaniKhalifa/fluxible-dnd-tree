import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Modal, Button, InputGroup, FormControl} from 'react-bootstrap';
import Node from './Node';

@DragDropContext(HTML5Backend)
export default class Tree extends Component {

    state = {
          tree: [
              {title:'DummyNode', id:0, rootNode:true,  children:[
                  {title: 'Root', id: 1, type:'folder', selected: false, children: [
                                                {title: 'Child', selected: false, id: 2, type:'folder', children:[ {title: ' Child 22 abc def ghi', selected: false, id: 3, type:'search'}]}
                                        ]},

              {title: 'Empty', id: 4, type:'search', selected: false},

              {title: 'Two Nodes', selected: false, id: 5, type:'folder',  children: [
                                {title: 'Node 1', selected: false, id: 6, type: 'search'},
                                {title: 'Node 2', selected: false, id: 7, type: 'folder'}
              ]}
              ]}
        ],
        collapsed: false,
        modal: {show: false, enterButtonDisabled: true, input: ''},
        lastId: 7
    };

    addNew = () => {
        this.addNode({'node': {title: this.state.modal.input, id: this.state.lastId + 1, type:'folder' }}, {'node': this.state.tree[0]}, 'into', true);
        this.close();
        this.setState({ lastId: this.state.lastId + 1 });

    }
    setModalState = (name) =>{
        if(name && name != ''){
            this.setState({ modal: {show: true, enterButtonDisabled: false, input: name} });
        }else{
            this.setState({ modal: {show: true, enterButtonDisabled: true, input: name } });
        }
    }
    close = () =>{
        this.setState({ modal: {show: false, enterButtonDisabled: true} });
    }
    openAddNodeModal = () => {
      this.setState({ modal: {show: true, enterButtonDisabled: true} });
    }

    removeNode = (array, ids) => {
        for (var i = array.length-1; i >= 0; i--) {
            var obj = array[i];
            let indexOfFound = ids.indexOf(obj.id)
            if ( indexOfFound > -1) {
                array.splice(i, 1);
                ids.splice(indexOfFound, 1);
            }
            else if (obj.children) {
                this.removeNode(obj.children, ids);
            }
        }
    }


    isDescendant(node, id){
        if(node.children){
            let children = node.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].id === id ) {
                    return true;
                }
            }
            for (let i = 0; i < children.length; i++) {
                let res = this.isDescendant(children[i], id);
                if(res){
                    return res;
                }
            }
        }
        return false;
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
    addNode = (node, parent, position, isNew=false) => {
        parent = parent.node;
        node = node.node;
        // Not dropping before/after dummy root node
        if(!(parent.rootNode && position !== 'into')){
            if(!isNew)
                this.removeNode(this.state.tree, [node.id]);
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

    removeSelected = (array) =>{
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            if( obj.selected) {
                array.splice(i, 1);
            }
            else if (obj.children) {
                this.removeSelected(obj.children);
            }
        }
    }

    selectAllChildren = (node, checked) => {
        node.selected = checked;
        let children = node.children;
        if(children){
            for (var i = 0; i < children.length; i++) {
                this.selectAllChildren(children[i], checked);
            }
        }
    }
    selectNode = (node, checked) => {
        this.selectAllChildren(node, checked);
        this.setState({
            tree: this.state.tree
        })
    }
	render() {
        const buildNode = (node) => {
            var children = [];
            for (var i = 0; node.children && i < node.children.length; i++) {
                  children.push(buildNode(node.children[i]));
            }
            return <Node  select={this.selectNode} isDescendant={this.isDescendant} collapsed={this.state.collapsed} addNode={this.addNode} node={node} > {node.children && children } </Node>;
        };

        let nodes = [];
        for (let i = 0; i < this.state.tree.length; i++) {
            nodes.push(buildNode( this.state.tree[i] ));
        }
		return (
			<span >
                <Modal show={this.state.modal.show} onHide={this.close}>
                      <Modal.Header closeButton>
                        <Modal.Title>Add Node</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                                <FormControl type="text" onChange={ (e) => {this.setModalState(e.target.value);} } placeholder="Folder Name"/>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button onClick={() => {this.addNew()}} disabled={this.state.modal.enterButtonDisabled } >Enter</Button>
                      </Modal.Footer>
                </Modal>

                <button onClick={() => {
                    this.setState({
                        collapsed: !this.state.collapsed
                    });
                }}>
                    {this.state.collapsed ? 'Expand All' : 'Collapse All'}
                </button>

                <button onClick={() => {
                    this.openAddNodeModal();
                }}>
                    Add Node
                </button>

                <button onClick={() => {
                    this.removeSelected(this.state.tree);
                    this.setState({
                        tree: this.state.tree
                    });
                }}>
                    Remove Node
                </button>
                {/* <input type="text" id="uname" name="name"/> */}
                <div style={{width: '100%'}}>
                    {nodes}
                </div>

			</span>

		)
	}
}
