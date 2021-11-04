import React from 'react';
import { View, AdaptivityProvider, AppRoot, Epic, Tabbar, TabbarItem } from '@vkontakte/vkui';
import { Icon28HistoryBackwardOutline, Icon28ScanViewfinderOutline } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
import '@vkontakte/vkui/dist/vkui.css';

import History from './tabs/History';
import Scan from './tabs/Scan';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeStory: 'scan',
			scanned: []
		}
	}

	componentDidMount() {
		bridge.send('VKWebAppStorageGet', {keys: ['scanned']}).then(data => {
			console.log(data)
			if (data.keys[0]['value'].length) {
				this.setState({scanned: JSON.parse(data.keys[0]['value'])})
			}
		})
	}

	addScan = (text) => {
		let results = this.state.scanned;
		results.push(text);

		bridge.send("VKWebAppStorageSet", {"key": "scanned", "value": JSON.stringify(results)});
	}

	onStoryChange = (story) => {
		this.setState({activeStory: story})
	}

	render() {
		const available_domains = ['vk.com'];

		return (
			<AdaptivityProvider>
				<AppRoot>
					<Epic activeStory={this.state.activeStory} tabbar={
						<Tabbar>
							<TabbarItem onClick={() => this.onStoryChange('scan')} text={'Сканер'} selected={this.state.activeStory === 'scan'}>
								<Icon28ScanViewfinderOutline/>
							</TabbarItem>
							<TabbarItem onClick={() => this.onStoryChange('history')} text={'Мои сканы'} selected={this.state.activeStory === 'history'}>
								<Icon28HistoryBackwardOutline/>
							</TabbarItem>
						</Tabbar>
					}>
						<Scan id='scan' addScan={this.addScan}/>
						<History id='history' scanned={this.state.scanned}/>
					</Epic>
				</AppRoot>
			</AdaptivityProvider>
		);
	}

}

export default App;
