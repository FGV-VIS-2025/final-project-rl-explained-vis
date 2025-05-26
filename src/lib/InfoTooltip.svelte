<script>
    let showTooltip = false;
</script>

<div
    class="tooltip-container"
    on:mouseenter={() => (showTooltip = true)}
    on:mouseleave={() => (showTooltip = false)}
>
    <slot>
        <div class="info-circle">?</div>
    </slot>

    {#if showTooltip}
        <div class="tooltip-box">
            <slot name="tooltipContent">
                Nenhuma informação disponível.
            </slot>
        </div>
    {/if}
</div>

<style>
    .tooltip-container {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* cursor: help; */
    }

    .info-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #00bcd4;
        color: #000;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9em;
        line-height: 0.85;
        user-select: none;
        transition: background-color 0.2s ease;
        transform: translateY(-1px);
    }

    .info-circle:hover {
        background-color: #008c9e;
    }

    .tooltip-box {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 10px 15px;
        border-radius: 5px;
        white-space: nowrap;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        z-index: 100;
        opacity: 0;
        animation: fadeIn 0.2s forwards;
        font-size: 0.7em;
    }

    .tooltip-box::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: #333 transparent transparent transparent;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style>