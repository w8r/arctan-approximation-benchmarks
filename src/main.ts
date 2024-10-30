import * as d3 from 'd3';
import { generateDataPoints } from './utils/atan';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
const TERMS = [3, 5, 7, 9, 11];

function createChart() {
  // Setup dimensions
  const margin = { top: 40, right: 120, bottom: 60, left: 60 };
  const width = 920 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Generate data for different terms
  const allData = TERMS.map(terms => ({
    terms,
    data: generateDataPoints(terms)
  }));

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([-1, 1])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allData.flatMap(d => d.data.map(p => p.error)))!])
    .range([height, 0]);

  // Line generator
  const line = d3
    .line<{ x: number; error: number }>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.error))
    .curve(d3.curveMonotoneX);

  // Add lines for each term count
  allData.forEach((series, i) => {
    svg
      .append('path')
      .datum(series.data)
      .attr('fill', 'none')
      .attr('stroke', COLORS[i])
      .attr('stroke-width', 2)
      .attr('d', line);
  });

  // Add axes
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('x', width / 2)
    .attr('y', 40)
    .attr('fill', 'currentColor')
    .attr('text-anchor', 'middle')
    .text('x value');

  svg
    .append('g')
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -40)
    .attr('x', -height / 2)
    .attr('fill', 'currentColor')
    .attr('text-anchor', 'middle')
    .text('Relative Error (%)');

  // Add grid lines
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('opacity', 0.1)
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ''));

  // Add title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', '600')
    .text('Relative Error of Taylor Series Arctangent Approximation');

  // Add legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width + 10}, 0)`);

  TERMS.forEach((terms, i) => {
    const g = legend
      .append('g')
      .attr('transform', `translate(0, ${i * 25})`);

    g.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 10)
      .attr('y2', 10)
      .attr('stroke', COLORS[i])
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text(`${terms} terms`);
  });

  // Add hover effects
  const tooltip = d3
    .select('#chart')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', '#1f2937')
    .style('color', 'white')
    .style('padding', '8px')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('pointer-events', 'none');

  const bisect = d3.bisector((d: { x: number }) => d.x).left;

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mousemove', function(event) {
      const mouseX = d3.pointer(event)[0];
      const x0 = xScale.invert(mouseX);
      
      const tooltipContent = allData
        .map((series, i) => {
          const idx = bisect(series.data, x0);
          const d = series.data[idx];
          return `<div style="color: ${COLORS[i]}">
            ${series.terms} terms: ${d.error.toFixed(3)}%
          </div>`;
        })
        .join('');

      tooltip
        .style('visibility', 'visible')
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`)
        .html(`x: ${x0.toFixed(3)}<br>${tooltipContent}`);
    })
    .on('mouseout', () => tooltip.style('visibility', 'hidden'));
}

// Initialize chart when the page loads
createChart();