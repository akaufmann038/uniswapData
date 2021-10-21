const nodes = [
      { token: "DIA" },
      { token: "ETH" },
      { token: "OMI" },
      { token: "AMP" }]

const links = [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 2, target: 1 },
      { source: 0, target: 3 }]

const width = 400
const height = 400

const svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height)

const node = svg
      .append("g")
      .attr("fill", "black")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.token)
      //.attr("r", d => d.age)
      

const link = svg
      .append("g")
      .attr("stroke", "grey")
      .selectAll("line")
      .data(links)
      .join("line")
      

var simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', d3.forceLink().links(links).distance(100))
      .on("tick", ticked)

function ticked() {

      node
            .attr('x', d => d.x)
            .attr('y', d => d.y)

      link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
}