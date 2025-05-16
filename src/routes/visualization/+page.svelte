<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { q_learning } from "$lib/q_learning";

    // Exemplo de uso (ver nomes dos parâmetros na função)
    var data = q_learning({ epsilon_decay: 0 });
    var data_success_rates = data.success_rates;

    let svgContainer;

    onMount(() => {
        const width = 1200;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = d3
            .select(svgContainer)
            .attr("width", width)
            .attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, data_success_rates.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d, i) => x(i))
            .y((d) => y(d));

        const tickInterval = 100;
        const xTicks = [];

        for (let i = 0; i <= data_success_rates.length; i += tickInterval) {
            xTicks.push(i);
        }

        console.log(xTicks);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

        svg.append("path")
            .datum(data_success_rates)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    });
</script>

<svg bind:this={svgContainer}></svg>
