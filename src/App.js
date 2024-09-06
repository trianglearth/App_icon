import React, { Component } from 'react';
import Result from './Result';
import { searchApp } from './searchApp';
import { getUrlArgs, changeUrlArgs } from './Url.js';
import search from './search.svg';
import wechat from './wechat.png';
import qrCode from './qr-code.jpg'; // 假设我们有这个二维码图片
import './App.css';

// 新增 WeChatModal 组件
const WeChatModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>&times;</button>
          <h2>微信扫码加入用户群</h2>
          <img src={qrCode} alt="WeChat QR Code" className="qr-code" />
          <p className="group-name">群聊：APP_ICON用户沟通群</p>
          <p className="validity">该二维码7天内（9月13日前）有效，重新进入将更新</p>
          <p className="note">🙋‍♂大家使用时有啥想法或意见，我们可以在群里交流交流，提提反馈~</p>
        </div>
      </div>
    );
  };

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
            showModal: false, // 新增状态来控制弹窗显示
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

    // 新增方法来控制弹窗的显示和隐藏
    toggleModal = () => {
        this.setState(prevState => ({ showModal: !prevState.showModal }));
    }

    render() {
        const { name, country, entity, cut, limit, results, showModal } = this.state;
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
                        <div className="copyrights">Copyrights © 2023 - 3earth.space</div>
                            <div className="wechat" onClick={this.toggleModal}>
                                <img src={wechat} style={{width:'24px'}} />
                                <a>用户群</a>
                            </div>
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
                <WeChatModal isOpen={showModal} onClose={this.toggleModal} />
            </div>
        );
    }
}

export default App;
