import React, { Component } from 'react';
import PropTypes from 'prop-types';
import drawOutline from './drawOutline';
import './Result.css';

class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      base64: '',
      colors: [],
      hoverColor: ''
    };
  }

  async componentDidMount() {
    const { data, cut } = this.props;
    const base64 = await drawOutline(data, cut);
    this.setState({ base64 });
    this.getColors();
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.cut !== this.props.cut) {
      const { data, cut } = nextProps;
      const base64 = await drawOutline(data, cut);
      this.setState({ base64 });
      this.getColors();
    }
  }

  getColors = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = {};
      for (let i = 0, l = pixels.length; i < l; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (a < 128) {
          // 忽略透明像素
          continue;
        }
        const hex = this.rgbToHex(r, g, b);
        if (colorMap[hex]) {
          colorMap[hex]++;
        } else {
          colorMap[hex] = 1;
        }
      }
      
      const colors = Object.keys(colorMap);
      const k = Math.min(colors.length, 5); // 控制聚类数量
      const centroids = this.initializeCentroids(colors, k);
      const clusters = this.kMeans(colors, centroids);
      const sortedClusters = clusters.sort((a, b) => b.length - a.length);
      const palette = sortedClusters.map(cluster => {
        const centroid = this.calculateCentroid(cluster);
        const hex = this.rgbToHex(centroid[0], centroid[1], centroid[2]);
        return hex;
      });
      this.setState({ colors: palette });
    };
    img.src = this.state.base64;
  };

  initializeCentroids = (data, k) => {
    const centroids = [];
    for (let i = 0; i < k; i++) {
      const index = Math.floor(Math.random() * data.length);
      centroids.push(this.hexToRgb(data[index]));
    }
    return centroids;
  };

  kMeans = (data, centroids) => {
    const clusters = new Array(centroids.length);
    for (let i = 0; i < clusters.length; i++) {
      clusters[i] = [];
    }
    let converge = false;
    while (!converge) {
      for (let i = 0; i < data.length; i++) {
        const color = this.hexToRgb(data[i]);
        let minDistance = Number.MAX_VALUE;
        let clusterIndex = -1;
        for (let j = 0; j < centroids.length; j++) {
          const centroid = centroids[j];
          const distance = this.calculateDistance(color, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            clusterIndex = j;
          }
        }
        clusters[clusterIndex].push(color);
      }
      const newCentroids = new Array(centroids.length);
      for (let i = 0; i < newCentroids.length; i++) {
        newCentroids[i] = this.calculateCentroid(clusters[i]);
      }
      if (this.isCentroidsConverge(centroids, newCentroids)) {
        converge = true;
      } else {
        centroids = newCentroids;
        for (let i = 0; i < clusters.length; i++) {
          clusters[i] = [];
        }
      }
    }
    return clusters;
  };

  calculateDistance = (a, b) => {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  calculateCentroid = data => {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    for (let i = 0; i < data.length; i++) {
      rSum += data[i][0];
      gSum += data[i][1];
      bSum += data[i][2];
    }
    const r = Math.round(rSum / data.length);
    const g = Math.round(gSum / data.length);
    const b = Math.round(bSum / data.length);
    return [r, g, b];
  };

  isCentroidsConverge = (a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (this.calculateDistance(a[i], b[i]) > 1) {
        return false;
      }
    }
    return true;
  };

  rgbToHex = (r, g, b) => {
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  hexToRgb = hex => {
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return [r, g, b];
  };

  render() {
    const { data } = this.props;
    const { trackName, kind, primaryGenreName, artistName, trackViewUrl, artistViewUrl } = data;
    const { base64, colors } = this.state;
    const platform = kind.startsWith('mac') ? 'Mac' : 'iOS';
    return (
      <div className="result">
        
        <a href={base64} download={`${trackName}-${platform}-512x512.png`}>
          <img className="icon" src={base64} alt={trackName} />
        </a>
        <div className="platform">
          {platform} - {primaryGenreName}
        </div>
        <div className="trackName">
          <a href={trackViewUrl}>{trackName}</a>
        </div>
        <div className="artistName">
          <a href={artistViewUrl}>{artistName}</a>
        </div>
        <div className="color-palette">
          {colors.map((color, index) => (
            <div key={index} className="color" style={{ backgroundColor: `#${color}` }} title={`#${color}`}
            onMouseEnter={() => this.setState({ hoverColor: color })}
            onMouseLeave={() => this.setState({ hoverColor: '' })}
            >
            {this.state.hoverColor === color && (
            <div className="color-value">{`#${color}`}</div>
            )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

Result.propTypes = {
  data: PropTypes.object.isRequired
};
export default Result;
