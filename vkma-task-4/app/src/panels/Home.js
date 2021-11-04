import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import { Panel, PanelHeader, Div, Button, Group, Placeholder, Snackbar } from '@vkontakte/vkui';
import { Icon24Play, Icon28LightbulbStarOutline, Icon28LightbulbOutline, Icon24Stop } from '@vkontakte/icons';


export default class Home extends React.Component {
    render() {
        let {selectRole} = this.props;

        return (
            <Panel id={this.props.id}>
                <PanelHeader>Выбор роли</PanelHeader>
                <Placeholder stretched header={'Выберите роль'} action={
                    <Div className={'RoleSelector'}>
                        <Button stretched size={'m'} onClick={() => selectRole('manager')}>Управляющий</Button>
                        <Button stretched size={'m'} onClick={() => selectRole('slave')}>Мигающий</Button>
                    </Div>
                }>
                </Placeholder>
            </Panel>
        )
    }
}