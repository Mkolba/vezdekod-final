import React from 'react';
import { Panel, PanelHeader, Cell, Placeholder, Group } from '@vkontakte/vkui';
import {localStorage} from "@vkontakte/vkjs";

const TYPES = {'olympic': 'Олимпийская сетка', 'double': 'Cетка с выбыванием после двух поражений', 'swiss': 'Швейцарская сетка'}

export default class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grids: {}
        }
    }

    componentDidMount() {
        let grids = localStorage.getItem('grids');
        this.setState({
            grids: grids ? JSON.parse(grids) : {}
        })
    }

    loadGrid = (data) => {
        this.props.setGlobalState({panels: {edit: {...data}}}, () => this.props.go('tournament'));
    }

    render() {
        return (
            <Panel id={this.props.id}>
                <PanelHeader>Мои сетки</PanelHeader>
                <Group>
                    {   Object.values(this.state.grids).length ?
                            Object.values(this.state.grids).map((item, i) => (
                                <Cell key={i} description={TYPES[item.type]} onClick={() => this.loadGrid(item)}>
                                    {item.title}
                                </Cell>
                            ))
                        :
                        <Placeholder header={'Тут ничего нет!'}>
                            Вы еще не создали ни одну сетку
                        </Placeholder>
                    }
                </Group>
            </Panel>
        )
    }
}