<script>
    import { onMount } from 'svelte';
    import * as d3 from "d3";

    export let success_rates_data = [];
    export let currentEpisode = 0;
    export let width = 1000;
    export let height = 300;

    import InfoTooltip from './InfoTooltip.svelte';

    let svgContainer;

    // Função reativa para desenhar/atualizar o gráfico
    $: if (svgContainer && success_rates_data.length > 0) {
        drawChart(svgContainer, width, height, success_rates_data.slice(0, currentEpisode + 1));
    }

    function drawChart(container, w, h, data) {
        const margin = { top: 20, right: 48, bottom: 50, left: 60 };

        const svg = d3
            .select(container)
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("*").remove();

        const x = d3
            .scaleLinear()
            .domain([0, success_rates_data.length > 0 ? success_rates_data.length - 1 : 0])
            .range([margin.left, w - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .nice()
            .range([h - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d, i) => x(i))
            .y((d) => y(d));

        const tickInterval = Math.round(success_rates_data.length / 100) * 10;
        const xTicks = [];
        const totalEpisodes = success_rates_data.length;
    
        for (let i = 0; i <= totalEpisodes; i += tickInterval) {
            xTicks.push(i);
        }

        if (totalEpisodes > 0 && xTicks[xTicks.length - 1] < totalEpisodes - 1) {
            xTicks.push(totalEpisodes - 1);
        }

        svg.append("g")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

        svg.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", w / 2 + 50)
            .attr("y", h - 12)
            .style("fill", "#ffffff")
            .text("Episodes");

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "y axis-label")
            .attr("text-anchor", "middle")
            .attr("x", - (h / 2) + 15)
            .attr("y", margin.left - 37)
            .attr("transform", "rotate(-90)")
            .style("fill", "#ffffff")
            .text("Success Rate (%)");

        if (data.length > 0) {
            const lastDataPoint = data[data.length - 1];
            const lastEpisodeIndex = data.length - 1;

            const circleX = x(lastEpisodeIndex);
            const circleY = y(lastDataPoint);

            svg.append("circle")
                .attr("cx", circleX)
                .attr("cy", circleY)
                .attr("r", 5)
                .attr("fill", "blue")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5);

            svg.append("line")
                .attr("x1", circleX)
                .attr("y1", margin.top)
                .attr("x2", circleX)
                .attr("y2", h - margin.bottom)
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("opacity", 0.2);

            svg.append("text")
                .attr("class", "success-rate-label")
                .attr("x", circleX + 12)
                .attr("y", lastDataPoint < 7 ? y(7) + 4 : circleY + 4)
                .attr("text-anchor", "left")
                .style("fill", "white")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(`${Math.trunc(lastDataPoint)}%`);
        }
    }
</script>

<div class="chart-wrapper">
    <h3>Success Rate Over Episodes
        <InfoTooltip>
            <div slot = "tooltipContent">
                This chart tracks the agent's success rate,<br>
                showing the percentage of the last episodes<br>
                where it successfully reached the goal.
            </div>
        </InfoTooltip>
    </h3>
    <svg bind:this={svgContainer}></svg>
</div>

<style>
    .chart-wrapper {
        margin-top: -50px;
        text-align: center;
    }

    .chart-wrapper h3 {
        margin-bottom: -5px;
        color: #ffffff;
    }

    svg {
        margin-top: 20px;
        border: 1px solid #3318e9;
        background-color: #0d0d0d;
        border-radius: 8px;
    }

    :global(.axis-label) {
        font-size: 13px;
        font-weight: bold;
    }
</style>