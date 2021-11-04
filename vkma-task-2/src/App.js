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

	share = (text) => {
		const background = "https://sun9-78.userapi.com/impg/scMK6xNyN8ebQOot5mDmto34_UORRDoLErTf7A/keEek25VREI.jpg?size=608x1136&quality=96&sign=6ebee5d3cbb3b71928056a718c1d7887&type=album"
		console.log("https://vk.com/app7992945#"+window.btoa(text))
		bridge.send("VKWebAppShowStoryBox", { "background_type" : "image", "url" : background, 'stickers': [
				{
					"sticker_type": "renderable",
					"sticker": {
						"can_delete": 0,
						"content_type": "image",
						"url": "https://host.adawhite.ru/static/qr_.png",
						"clickable_zones": [
							{
								"action_type": "link",
								"action": {
									"link": "https://vk.com/app7992945#"+window.btoa(text),
									"tooltip_text_key": "tooltip_open_default"
								},
								"clickable_area": [
									{
										"x": 0,
										"y": 0
									},
									{
										"x": 303,
										"y": 0
									},
									{
										"x": 303,
										"y": 215
									},
									{
										"x": 0,
										"y": 215
									}
								]
							}
						]
					}
				}
			]});
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
						<History id='history' scanned={this.state.scanned} share={this.share}/>
						<Scan id='scan' addScan={this.addScan} share={this.share}/>
					</Epic>
				</AppRoot>
			</AdaptivityProvider>
		);
	}

}

export default App;
