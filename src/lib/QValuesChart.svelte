<script>
    import * as d3 from "d3";
    import InfoTooltip from './InfoTooltip.svelte';

    export let allQTables = [];
    export let inspectedRow = null;
    export let inspectedCol = null;
    export let width = 650;
    export let height = 250;

    let svgContainer;

    let qValuesOverEpisodes = {
        up: [],
        down: [],
        left: [],
        right: []
    };

    // Reatividade para recalcular os Q-valores quando inspectedRow, inspectedCol ou allQTables mudam
    $: {
        if (allQTables.length > 0 && inspectedRow !== null && inspectedCol !== null) {
            qValuesOverEpisodes = extractQValuesForCell(allQTables, inspectedRow, inspectedCol);
            if (svgContainer) {
                const svg = d3.select(svgContainer);
                drawChart(svg, width, height, qValuesOverEpisodes);
            }
        }
    }

    function extractQValuesForCell(allQTablesData, row, col) {
        const qValues = {
            up: [],
            down: [],
            left: [],
            right: []
        };

        allQTablesData.forEach(episodeQTables => {
            // Pega o último Q-table de cada episódio
            const finalQTable = episodeQTables[episodeQTables.length - 1];
            const stateKey = `${row},${col}`;
            if (finalQTable && finalQTable[stateKey]) {
                qValues.up.push(finalQTable[stateKey].up);
                qValues.down.push(finalQTable[stateKey].down);
                qValues.left.push(finalQTable[stateKey].left);
                qValues.right.push(finalQTable[stateKey].right);
            } else {
                // Se não houver dados para a célula, adiciona 0 para manter o comprimento do array
                qValues.up.push(0);
                qValues.down.push(0);
                qValues.left.push(0);
                qValues.right.push(0);
            }
        });
        return qValues;
    }

    function drawChart(svg, w, h, data) {
        const margin = { top: 30, right: 60, bottom: 50, left: 70 };

        svg.attr("width", w)
           .attr("height", h);

        // Remove elementos que serão redesenhados a cada atualização
        svg.selectAll(".chart-line, .axis-label, .x-axis-group, .y-axis-group, .legend").remove();

        const allValues = [
            ...data.up,
            ...data.down,
            ...data.left,
            ...data.right
        ];

        const x = d3
            .scaleLinear()
            .domain([0, allQTables.length > 0 ? allQTables.length - 1 : 0])
            .range([margin.left, w - margin.right]);

        const y = d3
            .scaleLinear()
            .domain(d3.extent(allValues))
            .nice()
            .range([h - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d, i) => x(i))
            .y(d => y(d));

        const tickInterval = Math.round(allQTables.length / 100) * 10;
        const xTicks = [];
        const totalEpisodes = allQTables.length;
        
        for (let i = 0; i <= totalEpisodes; i += tickInterval) {
            xTicks.push(i);
        }

        if (totalEpisodes > 0 && xTicks[xTicks.length - 1] < totalEpisodes - 1) {
            xTicks.push(totalEpisodes - 1);
        }

        // Eixos e Títulos de Eixos
        svg.append("g")
            .attr("class", "x-axis-group")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

        svg.append("g")
            .attr("class", "y-axis-group")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", w / 2 + 35)
            .attr("y", h - 12)
            .style("fill", "#ffffff")
            .text("Episodes");

        svg.append("text")
            .attr("class", "y axis-label")
            .attr("text-anchor", "middle")
            .attr("x", - (h / 2) + 15)
            .attr("y", margin.left - 47)
            .attr("transform", "rotate(-90)")
            .style("fill", "#ffffff")
            .text("Q-Value");

        const colors = {
            up: "cyan",
            down: "lime",
            left: "orange",
            right: "magenta"
        };

        const actions = ['up', 'down', 'left', 'right'];

        actions.forEach(action => {
            svg.append("path")
                .datum(data[action])
                .attr("class", `chart-line ${action}-line`)
                .attr("fill", "none")
                .attr("stroke", colors[action])
                .attr("stroke-width", 2)
                .attr("d", line);
        });

        // Legenda
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${w - margin.right + 10}, ${margin.top})`);

        actions.forEach((action, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colors[action]);

            legendRow.append("text")
                .attr("x", 15)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .style("fill", "white")
                .style("font-size", "10px")
                .style("font-family", "Press Start 2P")
                .text(action.charAt(0).toUpperCase() + action.slice(1));
        });
    }
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400..700&family=Press+Start+2P&family=Tiny5&family=VT323&display=swap" rel="stylesheet">

<div class="chart-wrapper">
    <h3>Q-Values Over Episodes for Cell ({inspectedRow}, {inspectedCol})
        <InfoTooltip>
            <div slot="tooltipContent">
                This chart displays the Q-values for each action<br>
                (Up, Down, Left, Right) in the selected cell<br>
                across all training episodes.
            </div>
        </InfoTooltip>
    </h3>
    <svg bind:this={svgContainer}></svg>
</div>

<style>
    .chart-wrapper {
        margin-top: 0px;
        text-align: center;
    }

    .chart-wrapper h3 {
        margin-bottom: -5px;
        color: #ffffff;
        font-weight: normal;
        font-size: 14px;
        font-family: "Press Start 2P";
    }

    svg {
        margin-top: 20px;
        border: 1px solid #3318e9;
        background-color: #0d0d0d;
        border-radius: 8px;
    }

    :global(.axis-label) {
        font-size: 0.6em;
        font-weight: normal;
        font-family: "Press Start 2P";
    }

    :global(.tick text) {
        font-family: "Press Start 2P";
        font-weight: normal;
        font-size: 0.7em;
    }
</style>