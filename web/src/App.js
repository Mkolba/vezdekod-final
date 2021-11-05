import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	View,
	AdaptivityProvider,
	AppRoot,
	ConfigProvider,
	SplitLayout,
	SplitCol,
	Panel,
	SimpleCell, Spinner,
	PanelHeader, Group
} from '@vkontakte/vkui';

import {Icon24CupOutline, Icon24HistoryBackwardOutline} from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';
import './index.scss';

import Tournament from "./panels/Tournament";
import History from "./panels/History";


export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activePanel: 'tournament',
			globalState: {
				panels: {
					'edit': {}
				}
			},
			popout: null
		}
	}

	setGlobalState = (data, cb) => {
		this.setState({globalState: {...this.state.globalState, ...data}}, cb ? cb : () => {});
	}

	setPopout = (popout) => {
		this.setState({popout: popout});
	}

	componentDidMount() {
		if (window.location.hash) {
			let uid = window.location.hash.slice(1);
			this.setState({activePanel: 'loading'})
			fetch('https://websocket.adawhite.ru/grids/' + uid, {method: 'GET'}).then(resp => {
				if (resp.ok) {
					resp.json().then(data => {
						if (data.activeTab) {
							this.setState({globalState: {
									panels: {
										'edit': {...data, activeTab: 'observe'}
									}
								}, activePanel: 'tournament'})
						}
					})
				}
			})
		}
	}

	render() {
		let {activePanel} = this.state

		return (
			<ConfigProvider platform={'vkcom'} theme={'vkcom_light'}>
				<AdaptivityProvider>
					<AppRoot>
						<SplitLayout>
							<SplitCol width="280px">
								<Panel id="nav">
									<PanelHeader>#TOURNAMENTS</PanelHeader>
									<Group>
										<SimpleCell before={<Icon24CupOutline/>} onClick={() => this.setState({activePanel: 'tournament'})}
													style={activePanel === 'tournament' ? {backgroundColor: "var(--button_secondary_background)"} : {}}>
											Редактор сетки
										</SimpleCell>
										<SimpleCell before={<Icon24HistoryBackwardOutline/>} onClick={() => this.setState({activePanel: 'history'})}
													style={activePanel === 'history' ? {backgroundColor: "var(--button_secondary_background)"} : {}}>
											Мои сетки
										</SimpleCell>
									</Group>
								</Panel>
							</SplitCol>
							<SplitCol maxWidth={'calc(100vw - 280px - 60px)'} width={'100%'}>
								<View activePanel={this.state.activePanel} popout={this.state.popout}>
									<Tournament id='tournament' globalState={this.state.globalState} setGlobalState={this.setGlobalState} setPopout={this.setPopout}/>
									<History id={'history'} globalState={this.state.globalState} setGlobalState={this.setGlobalState} go={(panel) => this.setState({activePanel: panel})}/>
									<Panel id={'loading'}><Spinner size={'xl'}/></Panel>
								</View>
							</SplitCol>
						</SplitLayout>
					</AppRoot>
				</AdaptivityProvider>
			</ConfigProvider>
		)
	}
}