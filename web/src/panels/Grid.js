import React from 'react';
import {Panel, PanelHeader, Cell, Placeholder, Group, Separator, Tappable} from '@vkontakte/vkui';
import { Icon20ShareOutline } from '@vkontakte/icons';
import './Grid.scss';


function chunk(arr, size) {
    const result = [];

    for (let i = 0; i < Math.ceil(arr.length/size); i++) {
        result.push(arr.slice((i * size), (i * size) + size));
    }

    return result;
}



export default class Grid extends React.Component {

    generateOlympicGrid = () => {
        let members = this.props.members;
        let rounds = [[]];

        if (this.props.sow) {
            for (let i=0; i<members.length;i++) {
                members[i]['index'] = i;
            }
            let sorted = members.sort((a, b) => {
                if (Number(a['rating']) < Number(b['rating'])) {
                    return 1
                } else if (Number(a['rating']) === Number(b['rating'])) {
                    return (a['index'] > b['index']) ? 1 : -1
                } else {
                    return -1
                }
            });

            for (let i=0; i<sorted.length / 2; i++) {
                rounds[0].push([{...sorted[i]}, {...sorted[sorted.length - 1 - i]}])
            }
        } else {
            for (let i=0; i<members.length; i+=2) {
                rounds[0].push([{...members[i], index: i}, {...members[i+1], index: i+1}])
            }
        }

        for (let round=1; round<(Math.log(members.length) / Math.log(2)); round++) {
            rounds.push([]);
            let winners = [];
            for (let i=0; i<rounds[round - 1].length; i++) {
                if (rounds[round - 1][i][0]['wins'] && rounds[round - 1][i][0]['wins'][round - 1]) {
                    winners.push(rounds[round - 1][i][0])
                } else if (rounds[round - 1][i][1]['wins'] && rounds[round - 1][i][1]['wins'][round - 1]) {
                    winners.push(rounds[round - 1][i][1])
                } else {
                    winners.push({})
                }
            }
            chunk(winners, 2).forEach(item => {
                rounds[round].push(item);
            })
        }

        return (
            <div className={'OlympicGrid'}>
                {rounds.map((members, i) => (
                    <div className={'Row'}>
                        {members.map((item, i_) => {
                            let disabled = !item[1]['key'] || !item[0]['key'];
                            return (
                                <>
                                    <div className={'Card'}>
                                        <div className={'Card__Content'}>
                                            <Tappable onClick={() => !disabled ? this.props.toggleWinner(item[0]['index'], i, item[1]['index']) : {}} className={(item[0]['wins'] && item[0]['wins'][i]) && 'winner'}
                                                      disabled={disabled}>
                                                {item[0]['name'] ? item[0]['name'] : item[0]['key'] ? `team-${item[0]['index']}` : ''}
                                            </Tappable>
                                            <Separator/>
                                            <Tappable onClick={() => !disabled ? this.props.toggleWinner(item[1]['index'], i, item[0]['index']) : {}} className={(item[1]['wins'] && item[1]['wins'][i]) && 'winner'}
                                                      disabled={disabled}>
                                                {item[1]['name'] ? item[1]['name'] : item[1]['key'] ? `team-${item[1]['index']}` : ''}
                                            </Tappable>
                                        </div>
                                        <div className={'Card__Share'}>
                                            <Tappable onClick={() => !disabled ? this.props.shareRound(item) : {}} disabled={disabled}>
                                                <Icon20ShareOutline/>
                                            </Tappable>
                                        </div>
                                    </div>
                                    {(members.length > 1) && <div className={'Arrow'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), left: 190}}/>}
                                    {(i > 0) &&
                                    <div className={'Arrow'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), right: 190}}/>
                                    }
                                    {(members.length > 1 && (i_ % 2 === 0)) &&
                                    <div className={'Arrow-vertical'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), left: 190 + 34, height: (500 - (members.length * 48)) / (members.length + 1) + 49}}/>
                                    }
                                </>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    generateDoubleGrid = () => {
        let members = this.props.members;
        let rounds = [[]];

        for (let i=0; i<members.length; i+=2) {
            rounds[0].push([{...members[i], index: i}, {...members[i+1], index: i+1}])
        }

        for (let round=1; round<((Math.log(members.length) / Math.log(2)) - 1); round++) {
            rounds.push([]);
            let winners = [];
            for (let i=0; i<rounds[round - 1].length; i++) {
                if (rounds[round - 1][i][0]['wins'] && rounds[round - 1][i][0]['wins'][round - 1]) {
                    winners.push(rounds[round - 1][i][0])
                } else if (rounds[round - 1][i][1]['wins'] && rounds[round - 1][i][1]['wins'][round - 1]) {
                    winners.push(rounds[round - 1][i][1])
                } else {
                    winners.push({})
                }
            }
            chunk(winners, 2).forEach(item => {
                rounds[round].push(item);
            })
        }

        return (
            <div className={'OlympicGrid'}>
                {rounds.map((members, i) => (
                    <div className={'Row'}>
                        {members.map((item, i_) => {
                            let disabled = !item[1]['key'] || !item[0]['key'];
                            return (
                                <>
                                    <div className={'Card'}>
                                        <div className={'Card__Content'}>
                                            <Tappable onClick={() => !disabled ? this.props.toggleWinner(item[0]['index'], i, item[1]['index']) : {}} className={(item[0]['wins'] && item[0]['wins'][i]) && 'winner'}
                                                      disabled={disabled}>
                                                {item[0]['name'] ? item[0]['name'] : item[0]['key'] ? `team-${item[0]['index']}` : ''}
                                            </Tappable>
                                            <Separator/>
                                            <Tappable onClick={() => !disabled ? this.props.toggleWinner(item[1]['index'], i, item[0]['index']) : {}} className={(item[1]['wins'] && item[1]['wins'][i]) && 'winner'}
                                                      disabled={disabled}>
                                                {item[1]['name'] ? item[1]['name'] : item[1]['key'] ? `team-${item[1]['index']}` : ''}
                                            </Tappable>
                                        </div>
                                        <div className={'Card__Share'}>
                                            <Tappable onClick={() => !disabled ? this.props.shareRound(item) : {}} disabled={disabled}>
                                                <Icon20ShareOutline/>
                                            </Tappable>
                                        </div>
                                    </div>
                                    {(members.length > 1) && <div className={'Arrow'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), left: 190}}/>}
                                    {(i > 0) &&
                                    <div className={'Arrow'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), right: 190}}/>
                                    }
                                    {(members.length > 1 && (i_ % 2 === 0)) &&
                                    <div className={'Arrow-vertical'} style={{top: -24 + (i_ + 1) * 48 + (i_ + 1) * ((500 - (members.length * 48)) / (members.length + 1)), left: 190 + 34, height: (500 - (members.length * 48)) / (members.length + 1) + 49}}/>
                                    }
                                </>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    render() {
        let { type } = this.props;
        return (
            <div className={'TournamentGrid__Wrapper'}>
                <div className={'TournamentGrid'}>
                    {type === 'olympic' ?
                        (this.props.members.length && this.props.members.length % 2 === 0) ?
                            this.generateOlympicGrid()
                        :
                        <div className={'Error'}>
                            Количество участников для такой сетки должно быть кратным двойке
                        </div>
                    : type === 'double' ?
                            (this.props.members.length && this.props.members.length % 2 === 0) ?
                                <>
                                    {this.generateOlympicGrid()}
                                    {this.generateDoubleGrid()}
                                </>
                            :
                            <div className={'Error'}>
                                Количество участников для такой сетки должно быть кратным двойке
                            </div>
                        :
                    <div className={'Error'}>
                        Этот тип сетки не поддерживается
                    </div>
                    }
                </div>
            </div>
        )
    }
}