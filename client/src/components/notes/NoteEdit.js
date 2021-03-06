import React from "react";
import { Form, Button, Message } from "semantic-ui-react";
import { EditorState, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertFromRaw, convertToRaw } from "draft-js";
import { connect } from "react-redux";
import "./NoteEdit.css";
const NoteService = require("../../api/NoteServices");

class NoteEdits extends React.Component {
  constructor(props) {
    super(props);
    //this.props.note.title
    //this.props.note.setEditorContent
    //this.props.onSubmit => Updated
    this.state = {
      title: "",
      editorState: EditorState.createEmpty(),
      saveStatus: ""
    };
    this.onTitleChange = this.onTitleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setEditorContent = this.setEditorContent.bind(this);
  }

  componentDidMount() {
    if (!this.props.isSignedIn) {
      this.props.history.push("/login");
      return;
    }
    if (this.props.note) {
      this.setState({
        title: this.props.note.title,
        saveStatus: ""
      });
      this.setEditorContent(
        this.props.note.description,
        JSON.parse(this.props.note.content)
      );
    } else {
      //this.props
      NoteService.findNote(this.props.match.params.id)
        .then(rsp => {
          this.setState({
            title: rsp.title
          });
          this.setEditorContent(rsp.description, JSON.parse(rsp.content));
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (!this.props.isSignedIn && !this.props.note) {
      prevProps.history.push("/login");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.note) {
      //New note was clicked from manage notes
      this.setState({
        title: nextProps.note.title
      });
      this.setEditorContent(
        nextProps.note.description,
        JSON.parse(nextProps.note.content)
      );
      if (nextProps.note._id !== this.props.note._id) {
        this.setState({ saveStatus: "" });
      }
    } else {
      //new note was created from sidebar
      NoteService.findNote(nextProps.match.params.id)
        .then(rsp => {
          this.setState({
            title: rsp.title
          });
          this.setEditorContent(rsp.description, JSON.parse(rsp.content));
        })
        .catch(error => {
          console.log(error);
        });
      if (nextProps.note._id !== this.props.note._id) {
        this.setState({ saveStatus: "" });
      }
    }
  }

  onTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  onChange = editorState => this.setState({ editorState });

  setEditorContent(text, contentData) {
    if (contentData.hasOwnProperty("blocks")) {
      const content = convertFromRaw(contentData);
      this.setState({ editorState: EditorState.createWithContent(content) });
    } else {
      const contentState = ContentState.createFromText(text);
      const editorState = EditorState.push(
        this.state.editorState,
        contentState
      );
      this.setState({ editorState });
    }
  }

  renderSaveStatus = () => {
    if (this.state.saveStatus !== "") {
      return (
        <Message info header="Save Status" content={this.state.saveStatus} />
      );
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    var convertedData = convertToRaw(
      this.state.editorState.getCurrentContent()
    );
    var note_id = "";
    if (this.props.note) {
      note_id = this.props.note._id;
    } else {
      note_id = this.props.match.params.id;
    }
    var currentNote = {
      content: JSON.stringify(convertedData),
      description: this.state.editorState.getCurrentContent().getPlainText(),
      title: this.state.title,
      _id: note_id
    };
    NoteService.updateNote(currentNote)
      .then(rsp => {
        if (this.props.handleSave) {
          this.props.handleSave();
        }
        this.setState({
          saveStatus: rsp.data
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return (
      <div className="ui container stretched segment">
        <Form name="notes">
          <Form.Field>
            <input
              type="text"
              placeholder="Title"
              value={this.state.title}
              onChange={this.onTitleChange}
            />
          </Form.Field>
          <Form.Field className="textarea">
            <Editor
              editorState={this.state.editorState}
              wrapperClassName="demo-wrapper"
              editorClassName="editer-content"
              placeholder="Enter some note...."
              onEditorStateChange={this.onChange}
              toolbar={{
                options: [
                  "inline",
                  "blockType",
                  "fontSize",
                  "colorPicker",
                  "list",
                  "link",
                  "emoji",
                  "image"
                ],
                inline: {
                  inDropdown: true
                },
                list: {
                  inDropdown: true
                },
                link: {
                  inDropdown: true
                },
                history: {
                  inDropdown: true
                }
              }}
            />
          </Form.Field>
        </Form>
        <div id="note-button-div">
          <Button
            className="ui right floated"
            id="note-submit-button"
            onClick={this.handleSubmit}
            color="blue"
          >
            Save
          </Button>
          <br />
          <br />
          {this.renderSaveStatus()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentUserObj: state.auth.userObj,
    isSignedIn: state.auth.isSignedIn
  };
};

export default connect(
  mapStateToProps,
  {}
)(NoteEdits);
