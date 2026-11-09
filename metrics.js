

let metricsPanel;

let metricFPS;
let metricParticles;
let metricWater;
let metricLava;
let metricSteam;
let metricOil;
let metricReactionChecks;

let metricReactions;
let metricFrameTime;

let metricWaterTemperature;
let temperatureFill;


function setupMetrics(){
    metricsPanel = document.getElementById("metrics-panel");

    metricFPS = document.getElementById("metricFPS");

    metricParticles = document.getElementById("metricParticles");

    metricWater = document.getElementById("metricWater");

    metricLava = document.getElementById("metricLava");

    metricSteam = document.getElementById("metricSteam");
    
    metricOil = document.getElementById("metricOil");

    metricReactionChecks = document.getElementById("metricReactionChecks");

    metricReactions = document.getElementById("metricReactions");

    metricFrameTime = document.getElementById("metricFrameTime")

    metricWaterTemperature =document.getElementById("metricWaterTemperature");

    temperatureFill = document.getElementById("temperatureFill");

    }


function updateMetrics({
    fps,
    particles,
    water,
    lava,
    steam,
    oil,
    reactionChecks,
    reactions,
    frameTime,
    maxWaterTemperature


})
{
    metricFPS.textContent = Math.round(fps);

    metricParticles.textContent = particles;

    metricWater.textContent = water;

    metricLava.textContent = lava;

    metricSteam.textContent = steam;

    metricOil.textContent = oil;

    metricReactionChecks.textContent = reactionChecks;

    metricReactions.textContent = reactions;

    metricFrameTime.textContent = frameTime.toFixed(2);

    metricWaterTemperature.textContent = maxWaterTemperature.toFixed(1);


   const temperaturePercentage = Math.max(0,Math.min(100, maxWaterTemperature));

    temperatureFill.style.width = `${temperaturePercentage}%`;



        if (maxWaterTemperature < 40) {

        temperatureFill.style.background =
            "#3399ff";

    } else if (maxWaterTemperature < 70) {

        temperatureFill.style.background =
            "#f1c40f";

    } else if (maxWaterTemperature < 90) {

        temperatureFill.style.background =
            "#ff8c00";

    } else {

        temperatureFill.style.background =
            "#ff3b30";
    }


}


export{
    setupMetrics,
    updateMetrics
}

