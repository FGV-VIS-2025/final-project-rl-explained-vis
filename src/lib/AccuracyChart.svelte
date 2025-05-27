<script>
    import * as d3 from "d3";

    export let success_rates_data = [];
    export let currentEpisode = 0;
    export let width = 1000;
    export let height = 300;

    import InfoTooltip from './InfoTooltip.svelte';

    let svgContainer;

    let focusLine;
    let focusCircle;
    let tooltip;
    let tooltipBg;
    let tooltipTextEpisode;
    let tooltipTextRate;

    // Função reativa para desenhar/atualizar o gráfico
    $: if (svgContainer && success_rates_data.length > 0) {
        drawChart(svgContainer, width, height, success_rates_data.slice(0, currentEpisode + 1));
    }

    function drawChart(container, w, h, data) {
        const margin = { top: 30, right: 48, bottom: 50, left: 60 };

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

        // Eixo X
        svg.append("g")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

        // Título do Eixo X
        svg.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", w / 2 + 35)
            .attr("y", h - 12)
            .style("fill", "#ffffff")
            .text("Episodes");

        // Linha do gráfico
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Eixo Y
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Título do Eixo Y
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

            // Círculo do último ponto
            svg.append("circle")
                .attr("cx", circleX)
                .attr("cy", circleY)
                .attr("r", 5)
                .attr("fill", "blue")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5);

            // Linha vertical do último ponto
            svg.append("line")
                .attr("x1", circleX)
                .attr("y1", margin.top)
                .attr("x2", circleX)
                .attr("y2", h - margin.bottom)
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("opacity", 0.2);

            // Texto da taxa de sucesso do último ponto
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

        // Elementos de interatividade
        focusLine = svg.append("line")
            .attr("class", "focus-line")
            .attr("y1", margin.top)
            .attr("y2", h - margin.bottom)
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0);

        focusCircle = svg.append("circle")
            .attr("class", "focus-circle")
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0);

        tooltip = svg.append("g")
            .attr("class", "tooltip")
            .attr("opacity", 0);

        tooltipBg = tooltip.append("rect")
            .attr("width", 90)
            .attr("height", 40)
            .attr("fill", "rgba(0, 0, 0, 0.9)")
            .attr("rx", 5)
            .attr("ry", 5);

        tooltipTextEpisode = tooltip.append("text")
            .attr("x", 10)
            .attr("y", 16)
            .style("fill", "white")
            .style("font-size", "11px");

        tooltipTextRate = tooltip.append("text")
            .attr("x", 10)
            .attr("y", 31)
            .style("fill", "white")
            .style("font-size", "11px");

        // Retângulo invisível para capturar eventos do mouse sobre a área do gráfico
        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", w - margin.left - margin.right)
            .attr("height", h - margin.top - margin.bottom)
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            // .on("mouseover", mousemove)
            .on("mouseout", () => {
                focusLine.transition().duration(50).attr("opacity", 0);
                focusCircle.transition().duration(50).attr("opacity", 0);
                tooltip.transition().duration(50).attr("opacity", 0);
            })
            .on("mousemove", mousemove)
            .on("click", clickHandler);

        function mousemove(event) {
            const x0 = x.invert(d3.pointer(event)[0]);
            const i = Math.round(x0);
            
            if (i < 0 || i >= success_rates_data.length || i > currentEpisode) {
                focusLine.transition().duration(50).attr("opacity", 0);
                focusCircle.transition().duration(50).attr("opacity", 0);
                tooltip.transition().duration(50).attr("opacity", 0);
                return;
            }

            const d = success_rates_data[i];

            focusLine.attr("x1", x(i)).attr("x2", x(i));
            focusCircle.attr("cx", x(i)).attr("cy", y(d));

            const tooltipX = x(i) + 15;
            const tooltipY = d < 15 ? y(15) - 20 : y(d) - 20;

            const tooltipWidth = 120;
            const adjustedTooltipX = (tooltipX + tooltipWidth > w - margin.right) ? (x(i) - tooltipWidth + 15) : tooltipX;

            tooltip.attr("transform", `translate(${adjustedTooltipX},${tooltipY})`);
            tooltipTextEpisode.text(`Episode: ${i}`);
            tooltipTextRate.text(`Rate: ${Math.trunc(d)}%`);

            focusLine.transition().duration(50).attr("opacity", 0.15);
            focusCircle.transition().duration(50).attr("opacity", 0.5);
            tooltip.transition().duration(50).attr("opacity", 1);
        }

        // Função para atualizar o episódio atual ao clicar no gráfico
        function clickHandler(event) {
            const x0 = x.invert(d3.pointer(event)[0]);
            const clickedEpisode = Math.round(x0);

            if (clickedEpisode >= 0 && clickedEpisode < success_rates_data.length) {
                currentEpisode = clickedEpisode;
            }
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

    :global(.tooltip) {
        pointer-events: none;
    }
</style>