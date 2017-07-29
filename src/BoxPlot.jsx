import React from "react"
import PropTypes from "prop-types"
import {Motion, spring} from "react-motion"
import Distribution from "./Distribution.js"
import {Resize} from "replot-core"
import {Axis} from "../../replot-core/src/Axis.jsx"


class Plot extends React.Component {

  constructor(props){
    super(props)
    this.d = this.props.distribution
    this.offset = this.props.offset
    this.buffer = this.props.buffer
    this.padding = this.props.padding
    this.unit = this.props.unit
    this.width = this.props.width
    this.max = this.props.max
    this.min = this.props.min
    this.medY = this.props.medY
    this.index = this.props.index
    this.color = this.props.color.bind(this)
    //begin calculated attributes
    this.maxY = this.buffer+((this.max+this.padding-this.d.max)*this.unit)
    this.q4Y1 = this.buffer+((this.max+this.padding-this.d.max)*this.unit)
    this.q4Y2 = this.buffer+((this.max+this.padding-this.d.q3)*this.unit)
    this.rectY = this.buffer+((this.max+this.padding-this.d.q3)*this.unit)
    this.rectHeight = ((this.max+this.padding-this.d.q1)*this.unit)-((this.max+this.padding-this.d.q3)*this.unit)
    this.cY = this.buffer+((this.max+this.padding-this.d.mean)*this.unit)
    this.q0Y1 = this.buffer+((this.max+this.padding-this.d.q1)*this.unit)
    this.q0Y2 = this.buffer+((this.max+this.padding-this.d.min)*this.unit)
    this.minY = this.buffer+((this.max+this.padding-this.d.min)*this.unit)
  }

  render(){
    return (
      <Motion
        defaultStyle={{
          maxY: this.medY,
          q4Y1: this.medY,
          q4Y2: this.medY,
          rectY: this.medY,
          rectHeight: 0,
          cY: this.medY,
          q0Y1: this.medY,
          q0Y2: this.medY,
          minY: this.medY
        }}
        style={{
          maxY: spring(this.maxY, {stiffness: 40, damping: 10}),
          q4Y1: spring(this.q4Y1, {stiffness: 40, damping: 10}),
          q4Y2: spring(this.q4Y2, {stiffness: 40, damping: 10}),
          rectY: spring(this.rectY, {stiffness: 40, damping: 10}),
          rectHeight: spring(this.rectHeight, {stiffness: 40, damping: 10}),
          cY: spring(this.cY, {stiffness: 40, damping: 10}),
          q0Y1: spring(this.q0Y1, {stiffness: 40, damping: 10}),
          q0Y2: spring(this.q0Y2, {stiffness: 40, damping: 10}),
          minY: spring(this.minY, {stiffness: 40, damping: 10}),
        }}
      >
        {(interpolatingStyle) =>
          <g>
            <line x1={-this.width/4 + this.offset} y1={interpolatingStyle.maxY}
              x2={this.width/4 + this.offset} y2={interpolatingStyle.maxY}
              stroke={this.color(this.index, this.d.group)}/>
            <line x1={this.offset} y1={interpolatingStyle.q4Y1}
              x2={this.offset} y2={interpolatingStyle.q4Y2}
              stroke={this.color(this.index, this.d.group)}/>
            <rect x={-this.width/2 + this.offset} y={interpolatingStyle.rectY}
              width={this.width} height={interpolatingStyle.rectHeight}
              stroke={this.color(this.index, this.d.group)}
              fill="#f5f5f5"/>
            <circle cx={this.offset} cy={interpolatingStyle.cY} r={3}
              stroke={this.color(this.index, this.d.group)}
              fill="#f5f5f5"/>
            <line x1={-this.width/2 + this.offset} y1={this.medY}
              x2={this.width/2 + this.offset} y2={this.medY}
              stroke={this.color(this.index, this.d.group)}/>
            <line x1={this.offset} y1={interpolatingStyle.q0Y1}
              x2={this.offset} y2={interpolatingStyle.q0Y2}
              stroke={this.color(this.index, this.d.group)}/>
            <line x1={-this.width/4 + this.offset} y1={interpolatingStyle.minY}
              x2={this.width/4 + this.offset} y2={interpolatingStyle.minY}
              stroke={this.color(this.index, this.d.group)}/>
          </g>
        }
      </Motion>
    )
  }

}

class BoxPlot extends React.Component {

  colorPlot(i, group) {
    if (this.props.color instanceof Array) {
      return this.props.color[i%this.props.color.length]
    } else {
      return this.props.color(i, group)
    }
  }

  draw(distributions, min, max, labels){
    let axes = []
    let plots = []
    let padding = (max-min) / 3
    let buffer = {left: (this.props.yTitle != "off" ? 75 : 50), top: (this.props.graphTitle != "off" ? 30 : 5), bot: (this.props.xTitle != "off" ? 50 : 25)}
    let unit = (this.props.height-buffer.bot-buffer.top) / ((max+padding) - (min-padding))

    axes.push(
      <Axis key="axis" graphTitle={this.props.graphTitle} width={this.props.width} height={this.props.height} minY={min-padding}
        maxY={max+padding} yScale={this.props.yScale} ySteps={this.props.ySteps}
        yTitle={this.props.yTitle} showYAxisLine={this.props.showYAxisLine}
        showYLabels={this.props.showYLabels} showGrid={this.props.showGrid}
        xTitle={this.props.xTitle} showXAxisLine={this.props.showXAxisLine}
        showXLabels={this.props.showXLabels} labels={labels}
        axisStyle={this.props.axisStyle} xAxisMode="strings"/>
    )

    let plotWidth = (this.props.width-buffer.left)/distributions.length/2
    for (let i = 0; i < distributions.length; i++){
      plots.push(
        <Plot key={"plot"+i} distribution={distributions[i]} width={plotWidth}
          medY={buffer.top+((max+padding-distributions[i].median)*unit)}
          offset={buffer.left + (this.props.width-buffer.left)/distributions.length/2 + i*((this.props.width-buffer.left)/distributions.length)}
          buffer={buffer.top} max={max} min={min} unit={unit}
          padding={padding} index={i} color={this.colorPlot.bind(this)} />
      )
    }

    let series = axes.concat(plots)
    return series
  }

  render() {
    let distributions = []
    let max, min, unique
    if (this.props.groupKey){
      unique = [...new Set(this.props.data.map(item => item[this.props.groupKey]))]
      for (let group of unique){
        let d = new Distribution(this.props.data, this.props.weightKey, this.props.groupKey, group)
        if (!max || d.max > max){
          max = d.max
        }
        if (!min || d.min < min){
          min = d.min
        }
        distributions.push(d)
      }
    } else {
      let d = new Distribution(this.props.data, this.props.weightKey)
      max = d.max
      min = d.min
      distributions.push(d)
    }

    let series = this.draw(distributions, min, max, unique)

    return (
      <svg width={this.props.width} height={this.props.height}>
        {series}
      </svg>
    )
  }
}

class BoxPlotResponsive extends React.Component {

  render() {
    return (
      <Resize width={this.props.width}>
        <BoxPlot {...this.props} />
      </Resize>
    )
  }
}


BoxPlot.defaultProps = {
  width: 400,
  height: 400,
  color: [
    "#fea9ac", "#fc858f", "#f46b72", "#de836e",
    "#caa56f", "#adcc6f", "#8ebc57", "#799b3f"
  ],
  graphTitle: "off",
  xTitle: "off",
  yTitle: "off",
  yScale: "lin",
  ySteps: 5,
  showXAxisLine: true,
  showXLabels: true,
  showYAxisLine: true,
  showYLabels: true,
  showGrid: true,
  axisStyle: {
    axisColor: "#000000",
    labelColor: "#000000",
    titleColor: "#000000",
    gridColor: "#DDDDDD",
    lineWidth: 2,
    lineOpacity: 1
  }
}

BoxPlotResponsive.defaultProps = {
  width: 400
}

BoxPlot.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
}

export default BoxPlotResponsive
