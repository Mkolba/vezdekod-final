import React from 'react';
import { View, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";
import '@vkontakte/vkui/dist/vkui.css';

import Manage from './panels/Manage';
import Slave from './panels/Slave';
import Home from "./panels/Home";
import './index.css';


export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activePanel: 'home',
			history: ['home'],
			role: null,
		}
	}

	componentDidMount() {
		window.onpopstate = this.goBack;
	}

	selectRole = (role) => {
		if (role === 'manager') {
			this.setState({role: 'manager'}, () => this.go('manage'))
		} else {
			this.setState({role: 'slave'}, () => this.go('slave'))
		}
	}

	goBack = () => {
		let history = this.state.history;

		if (history.length === 1) {
			bridge.send("VKWebAppClose", {"status": "success" });
		} else {
			this.setState({ activePanel: history[history.length - 2], history: history.slice(0, -1) });
		}
	}

	go = (panel) => {
		let history = this.state.history;

		window.history.pushState({panel: panel}, panel);
		history.push(panel);

		this.setState({ history, activePanel: panel });
	}

	render() {
		return (
			<AdaptivityProvider>
				<AppRoot>
					<View activePanel={this.state.activePanel}>
						<Manage id='manage' go={this.go}/>
						<Slave id='slave' go={this.go}/>
						<Home id='home' go={this.go} selectRole={this.selectRole}/>
					</View>
				</AppRoot>
			</AdaptivityProvider>
		)
	}
}
