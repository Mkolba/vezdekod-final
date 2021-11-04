import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import { Panel, PanelHeader, Button, Placeholder, PanelHeaderBack } from '@vkontakte/vkui';
import {
    Icon28Pause,
    Icon28GlobeOutline,
    Icon24CrownOutline,
    Icon28LightbulbOutline,
    Icon28LightbulbStarOutline
} from '@vkontakte/icons';


export default class Slave extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasManager: false,
            connected: false,
            playing: false,
            socket: null,
            flash: false
        }
    }

    componentDidMount() {
        const endpoint = 'wss://websocket.adawhite.ru/vkma-4' + window.location.search + '&role=slave';
        let socket = new WebSocket(endpoint);
        this.setState({socket: socket});

        socket.onclose = (e) => {
            console.log(e)
            this.setState({connected: false})
        };

        socket.onmessage = (event) => {
            event = JSON.parse(event.data);
            console.log(event);
            if (event.type === 'connected') {
                this.setState({connected: true, hasManager: event.hasManager, playing: event.playing});
            } else if (event.type === 'manager_connected') {
                this.setState({hasManager: true});
            } else if (event.type === 'manager_disconnected') {
                this.setState({hasManager: false});
            } else if (event.type === 'flash') {
                bridge.send("VKWebAppFlashSetLevel", {"level": 1});
                this.setState({flash: true})
            } else if (event.type === 'off') {
                bridge.send("VKWebAppFlashSetLevel", {"level": 0});
                this.setState({flash: false})
            } else if (event.type === 'play') {
                this.setState({playing: true})
            } else if (event.type === 'stop') {
                bridge.send("VKWebAppFlashSetLevel", {"level": 0});
                this.setState({playing: false})
            }
        }
    }

    componentWillUnmount() {
        bridge.send("VKWebAppFlashSetLevel", {"level": 0});
        if (this.state.socket && !this.state.socket.closed) {
            this.state.socket.close()
        }
    }

    render() {
        let goBack = () => window.history.back();
        return (
            <Panel id={this.props.id}>
                <PanelHeader left={<PanelHeaderBack onClick={goBack}/>}>Flashlight DJ</PanelHeader>
                {
                    !this.state.connected ?
                        <Placeholder stretched header={"Подождите..."} icon={<Icon28GlobeOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
                                     action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
                            Подключаем вас к серверу
                        </Placeholder>
                        :
                        !this.state.hasManager ?
                            <Placeholder stretched header={"Подождите..."} icon={<Icon24CrownOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
                                         action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
                                Ждём управляющего
                            </Placeholder>
                            :
                            !this.state.playing ?
                                <Placeholder stretched header={"Подождите..."} icon={<Icon28Pause width={128} height={128} fill={'var(--button_primary_background)'}/>}
                                             action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
                                    Ждём, пока управляющий начнет проигрывание
                                </Placeholder>
                                :
                                this.state.flash ?
                                    <Placeholder stretched header={"Горим!"} icon={<Icon28LightbulbStarOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
                                                 action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
                                        Фонарик включен
                                    </Placeholder>
                                    :
                                    <Placeholder stretched header={"Спааать.."} icon={<Icon28LightbulbOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
                                                 action={<Button onClick={goBack} size={'m'} mode={'destructive'}>Выйти</Button>}>
                                        Фонарик выключен
                                    </Placeholder>
                }
            </Panel>
        )
    }
}