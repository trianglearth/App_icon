import React, { Component } from 'react';
import Result from './Result';
import { searchApp } from './searchApp';
import { getUrlArgs, changeUrlArgs } from './Url.js';
import search from './search.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        if (getUrlArgs('country') != "") { var c = getUrlArgs('country') } else var c = 'us';
        if (getUrlArgs('entity') != "") { var d = getUrlArgs('entity') } else var d = 'software';
        if (getUrlArgs('cut') != "") { var r = getUrlArgs('cut') } else var r = '1';
        if (getUrlArgs('limit') != "") { var l = getUrlArgs('limit') } else var l = 12;
        this.state = {
            name: getUrlArgs('name'),
            country: c,
            entity: d,
            limit: l,
            cut: r,
            results: [],
        };
        this.search = this.search.bind(this);
        if (getUrlArgs('name') != null) this.search();
    }

    async search() {
        let { name, country, entity, limit } = this.state;
        name = name.trim();
        try {
            const data = await Promise.all([searchApp(name, country, entity, limit)]);
            this.setState({
                results: data[0].results,
            });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const { name, country, entity, cut, limit, results } = this.state;
        if (name != '') {
            history.replaceState(null, null, changeUrlArgs('name', name));
            history.replaceState(null, null, changeUrlArgs('country', country));
            history.replaceState(null, null, changeUrlArgs('entity', entity));
            history.replaceState(null, null, changeUrlArgs('limit', limit));
            history.replaceState(null, null, changeUrlArgs('cut', cut));
        }
        return (
            <div className="app">
                <header>
                    <div className="center">
                        <div className="left">
                        <div className="logo">APP ICON</div>
                        <div className="description">Download HQ app icons from App Store<br /><span>从 App Store 下载高清应用图标</span></div>
                        </div>
                        <div className="right">
                        <div className="parent">
                        <div className="ant-checkbox-input">
                            <label onClick={() => this.setState({ entity: 'software' })} >
                                <input name="entity" type="checkbox" checked={entity === 'software'} />
                                iOS
                            </label>
                            <label onClick={() => this.setState({ entity: 'macSoftware' })} >
                                <input name="entity" type="checkbox" checked={entity === 'macSoftware'} />
                                MacOS
                            </label>
                            </div>
                        <div className="ant-checkbox-input">
                            <label onClick={() => this.setState({ cut: '1' })} >
                                <input name="cut" type="checkbox" checked={cut === '1'} />
                                rounded/裁切圆角
                            </label>
                            <label onClick={() => this.setState({ cut: '0' })} >
                                <input name="cut" type="checkbox" checked={cut === '0'} />
                                original/原始图像
                            </label>
                        </div>
                        <div className="ant-checkbox-input"> 
                            <label onClick={() => this.setState({ country: 'us' })} >
                                <input name="store" type="checkbox" checked={country === 'us'} />
                                US/美区
                            </label>
                            <label onClick={() => this.setState({ country: 'cn' })} >
                                <input name="store" type="checkbox" checked={country === 'cn'} />
                               CN/中国区
                            </label>
                            <label onClick={() => this.setState({ country: 'jp' })} >
                                <input name="store" type="checkbox" checked={country === 'jp'} />
                                JP/日区
                            </label>
                            <label onClick={() => this.setState({ country: 'kr' })} >
                                <input name="store" type="checkbox" checked={country === 'kr'} />
                                KR/韩国
                            </label>
                        </div>
                        </div>
                        <div className="search">
                            <input
                                className="search-input"
                                placeholder="app name / 应用名称"
                                value={name}
                                onChange={(e) => this.setState({ name: e.target.value })}
                                onKeyDown={(e) => e.key == 'Enter' ? this.search() : ''} />
                            <div className="search-button" onClick={this.search} >
                                <img src={search} className="search-icon" alt="search" />
                            </div>
                        </div>
                        </div>
                    </div>
                </header>
                <main className="results">
                    {results.map((result) => (
                        <Result
                            key={result.trackId}
                            data={result}
                            cut={cut}
                        />
                    ))}
                </main>
                <footer className="footer">Copyrights © 2023 - 3earth.space</footer>
            </div>
        );
    }
}

export default App;
