import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import HeSetup from './HeSetup'

class HeSetupContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: null,
            output: null,
            terminated: false,
            denied: false,
            success: false
        };

        this.resetState = this.resetState.bind(this);
        this.processExit = this.processExit.bind(this);
        this.parseOutput = this.parseOutput.bind(this);
        this.passInput = this.passInput.bind(this);
        this.restart = this.restart.bind(this);
    }

    resetState() {
        let question = {
            prompt: [],
            suggested: '',
            password: false,
            complete: false
        };

        let output = {
            infos: [],
            warnings: [],
            errors: [],
            lines: [],
        };

        this.setState({question: question});
        this.setState({output: output});
        this.setState({terminated: false});
        this.setState({success: false})
    }

    restart() {
        this.resetState();
        this.props.setupCallback();
        this.setState({setup: this.props.setup.start(this.parseOutput,
            this.processExit)
        })
    }

    componentWillMount() {
        this.resetState();
        this.setState({setup: this.props.setup.start(this.parseOutput,
            this.processExit)
        })
    }

    componentDidMount() {
        $(ReactDOM.findDOMNode(this)).modal('show');
    }

    componentWillUnmount() {
        this.props.setup.close();
        $(ReactDOM.findDOMNode(this)).modal('hide');
    }

    processExit(status, accessDenied = false) {
        this.setState({terminated: true});
        this.setState({denied: accessDenied});
        this.setState({success: status === 0});
        console.log(this.state.success)
    }

    passInput(input) {
        if (this.state.question.prompt.length > 0) {
            this.props.setup.handleInput(input);
            this.resetState()
        }
    }

    parseOutput(ret) {
        const question = this.state.question;
        question.suggested = ret.question.suggested !== '' ?
            ret.question.suggested :
            this.state.question.suggested;

        question.prompt = question.prompt.concat(ret.question.prompt);
        question.password = ret.question.password || this.state.question.password;
        question.complete = ret.question.complete || this.state.question.complete;

        this.setState({question: question});

        for (let key in ret.output) {
            let value = this.state.output
            if (key === "terminated") {
                this.setState({terminated: ret.output.terminated})
            } else {
                // Pop off the beginning of the box if it gets too long, since
                // otopi has a lot of informational messages for some steps,
                // and it pushes everything down the screen
                if (key !== "lines" && value[key].length > 10) {
                    value[key].shift()
                }
                value[key] = value[key].concat(ret.output[key])
            }
            this.setState({output: value })
        }
    }

    render() {
        const finishedError = this.state.terminated && this.state.output.errors.length > 0;

        const showInput = !this.state.terminated &&
            (this.state.question.prompt.length > 0 &&
                this.state.question.complete);

        return (
            <HeSetup
                denied={this.state.denied}
                finishedError={finishedError}
                output={this.state.output}
                passInput={this.passInput}
                question={this.state.question}
                restart={this.restart}
                showInput={showInput}
                success={this.state.success}
                terminated={this.state.terminated}
            />
        )
    }
}

export default HeSetupContainer;