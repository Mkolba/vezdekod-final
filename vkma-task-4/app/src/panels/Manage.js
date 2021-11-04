import React from 'react';

import {Panel, PanelHeader, Div, Button, Group, Placeholder, Snackbar, PanelHeaderBack} from '@vkontakte/vkui';
import {
	Icon24Play,
	Icon28LightbulbStarOutline,
	Icon28LightbulbOutline,
	Icon24Stop,
	Icon28GlobeOutline
} from '@vkontakte/icons';


export default class Manage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buttons: [
				false, false, false, false,
				false, false, false, false,
			],
			isRunning: false,
			connected: false,
			currentIndex: 0,
			snackbar: null,
			socket: null,
			timer: null,
			slaves: 0
		}
	}

	componentDidMount() {
		const endpoint = 'wss://websocket.adawhite.ru/vkma-4' + window.location.search + '&role=manager';
		let socket = new WebSocket(endpoint);
		this.setState({socket: socket});

		socket.onclose = (e) => {
			this.setState({connected: false});
			if (e.reason === 'taken') {
				this.setState({snackbar:
						<Snackbar onClose={() => this.setState({snackbar: null}, () => window.history.back())}>
							Упс! Роль управляющего уже занята. Попробуйте позже.
						</Snackbar>
				});
			}
		};

		socket.onmessage = (event) => {
			event = JSON.parse(event.data);
			console.log(event);
			if (event.type === 'connected') {
				this.setState({connected: true, slaves: event.slaves});
			} else if (event.type === 'update_slaves') {
				this.setState({slaves: event.slaves})
			}
		}
	}

	componentWillUnmount() {
		if (this.state.socket && !this.state.socket.closed) {
			this.state.socket.close()
		}
	}

	flashlightTick = () => {
		let index = this.state.currentIndex;
		if (index === this.state.buttons.length) {
			index = 0;
		}

		if (this.state.socket) {
			if (this.state.buttons[index]) {
				this.state.socket.send(JSON.stringify({type: 'flash'}))
			} else {
				this.state.socket.send(JSON.stringify({type: 'off'}))
			}
		}

		index += 1;
		this.setState({currentIndex: index});
	}

	start = () => {
		if (!this.state.socket) {
			this.setState({snackbar:
					<Snackbar onClose={() => this.setState({snackbar: null})}>
						Упс! Пока что вы не подключены к серверу. Подождите немного.
					</Snackbar>
			});
			return;
		}

		this.state.socket.send(JSON.stringify({type: 'play'}));
		let timer = setInterval(this.flashlightTick, 1000);
		this.setState({isRunning: true, timer: timer}, this.flashlightTick);
	}

	stop = () => {
		if (this.state.timer) {
			clearInterval(this.state.timer);
		}
		this.state.socket.send(JSON.stringify({type: 'stop'}))
		this.setState({isRunning: false, timer: null, currentIndex: 0});
	}

	onButtonChange = (i) => {
		if (this.state.isRunning) {
			this.setState({snackbar:
					<Snackbar onClose={() => this.setState({snackbar: null})}>
						Остановите проигрывание, прежде чем изменять композицию.
					</Snackbar>
			});
			return;
		}
		let buttons = this.state.buttons;
		buttons[i] = !buttons[i];

		this.setState({buttons: buttons});
	}

	render() {
		let goBack = () => window.history.back();
		return (
			<Panel id={this.props.id}>
				<PanelHeader left={<PanelHeaderBack onClick={goBack}/>}>Flashlight DJ</PanelHeader>
				{
					!this.state.connected ?
						<Placeholder header={"Подождите..."} icon={<Icon28GlobeOutline width={96} height={96} fill={'var(--button_primary_background)'}/>}
									 action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
							Подключаем вас к серверу
						</Placeholder>
						:
						!this.state.slaves ?
							<Placeholder header={"Некому мигать"} icon={<Icon28GlobeOutline width={96} height={96} fill={'var(--button_primary_background)'}/>}
										 action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
								Дождитесь, пока кто-нибудь выберет роль фонарика
							</Placeholder>
							:
							<Placeholder icon={<Icon28LightbulbStarOutline width={96} height={96}/>} header={'Управление фонариком'}>
								Почувствуйте себя светооператором!<br/>Фонариков: {this.state.slaves}
							</Placeholder>
				}
				<Group className={'Content'}>
					<Div>Одна кнопка - одна секунда свечения или простоя</Div>
					<Div className={'Buttons'}>
						{
							this.state.buttons.map((isButtonEnabled, i) => {
								let isIndicatorEnabled = this.state.isRunning && (this.state.currentIndex - 1 === i);
								return (
									<div className={'CustomButton'} key={i}>
										<Button onClick={() => this.onButtonChange(i)} mode={isButtonEnabled ? 'primary' : 'outline'}>
											{isButtonEnabled ?
												<Icon28LightbulbStarOutline width={20} height={20}/> :
												<Icon28LightbulbOutline width={20} height={20}/>
											}
										</Button>
										<div className={'Indicator ' + `Indicator-${isIndicatorEnabled ? "enabled" : 'disabled'}`}/>
									</div>
								);
							})
						}
					</Div>
					<Div>
						{
							!this.state.isRunning ?
								<Button stretched size={'l'} before={<Icon24Play/>} onClick={this.start}>
									Запустить
								</Button>
								:
								<Button stretched size={'l'} before={<Icon24Stop/>} mode={'destructive'} onClick={this.stop}>
									Остановить
								</Button>
						}

					</Div>
				</Group>

				{this.state.snackbar}
			</Panel>
		)
	}
} 