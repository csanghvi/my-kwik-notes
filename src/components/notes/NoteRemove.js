import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../Modal';
import {Dropdown, Icon} from 'semantic-ui-react'


class NoteRemove extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      show:false
    }
    console.log("Current note is %o", this.props.currentNote);
  }

  setShow = () => {
    this.setState({
      show:true
    })
  }
  unSetShow() {
    this.setState({
      show:false
    })
  }

  deleteNote(){
    console.log("Delete note with id %o", this.props.currentNote);
    this.props.onSelectRemove(this.props.currentNote)
    this.setState({
      show:false
    })

  }

  renderActions() {
    return (
      <React.Fragment>
        <button
          onClick={() => this.deleteNote()}
          className="ui button negative"
        >
          Delete
        </button>
        <button
          onClick={() => this.unSetShow()}
          className="ui button negative"
        >
          Cancel
        </button>
      </React.Fragment>
    );
  }

  renderContent() {
      return 'Are you sure you want to delete this note?';
  }


  render() {
    return (

      <div className="right floated content">
        <Dropdown icon='setting' floating button className='icon'>
          <Dropdown.Menu>
            <Dropdown.Item icon='trash' text='Delete' onClick={this.setShow}/>
            <Dropdown.Item icon='share alternate' text='Share'/>
            <Dropdown.Item icon='exchange' text='Change Notebook'/>
          </Dropdown.Menu>
        </Dropdown>
      {this.state.show === true && (
        <Modal
          title="Delete Note"
          content={this.renderContent()}
          actions={this.renderActions()}
          onDismiss={() => this.unSetShow()}
        />
      )}
    </div>

    );
  }
}

export default NoteRemove;
