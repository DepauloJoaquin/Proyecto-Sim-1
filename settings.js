import { Graphics } from "pixi.js";

export function setupSettings({
    app,
    world,
    Box2D,
    onRadiusChange,
    onWaterAmountChange,
    onFPSChange,
    onGridChange,
    onBrushSizeChange,
    onBrushAmountChange
}) {

    // -----------------------------
    // SETTINGS MENU
    // -----------------------------

    const settingsPanel =
        document.getElementById(
            "settings-panel"
        );

    const menuButton =
        new Graphics();

    menuButton
        .circle(0, -12, 3)
        .circle(0, 0, 3)
        .circle(0, 12, 3)
        .fill("#ffffff");

    menuButton.x = 760;
    menuButton.y = 40;

    menuButton.eventMode = "static";
    menuButton.cursor = "pointer";

    app.stage.addChild(menuButton);

    menuButton.on(
        "pointerdown",
        () => {

            settingsPanel.classList.toggle(
                "open"
            );
        }
    );


    // -----------------------------
    // GRAVITY
    // -----------------------------

    const gravityInput =
        document.getElementById(
            "gravityInput"
        );

    const gravityValue =
        document.getElementById(
            "gravityValue"
        );

    gravityInput.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    gravityInput.value
                );

            gravityValue.textContent =
                value;

            world.SetGravity(
                new Box2D.b2Vec2(
                    0,
                    value
                )
            );
        }
    );


    // -----------------------------
    // PARTICLE RADIUS
    // -----------------------------

    const radiusInput =
        document.getElementById(
            "radiusInput"
        );

    const radiusValue =
        document.getElementById(
            "radiusValue"
        );

    radiusInput.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    radiusInput.value
                );

            radiusValue.textContent =
                value;

            onRadiusChange(value);
        }
    );


    // -----------------------------
    // WATER AMOUNT
    // -----------------------------

    const waterAmountInput =
        document.getElementById(
            "waterAmountInput"
        );

    const waterAmountValue =
        document.getElementById(
            "waterAmountValue"
        );

    waterAmountInput.addEventListener(
        "input",
        () => {

            waterAmountValue.textContent =
                waterAmountInput.value;
        }
    );

    waterAmountInput.addEventListener(
        "change",
        () => {

            const value =
                Number(
                    waterAmountInput.value
                );

            onWaterAmountChange(
                value
            );
        }
    );

    // -----------------------------
    // BRUSH SIZE
    // -----------------------------

    const brushSizeInput =
    document.getElementById(
        "brushSizeInput"
    );

    const brushSizeValue =
        document.getElementById(
            "brushSizeValue"
        );

    brushSizeInput.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    brushSizeInput.value
                );

            brushSizeValue.textContent =
                value;

            onBrushSizeChange(value);
        }
    );


// -----------------------------
// BRUSH AMOUNT
// -----------------------------

const brushAmountInput =
    document.getElementById(
        "brushAmountInput"
    );

const brushAmountValue =
    document.getElementById(
        "brushAmountValue"
    );

brushAmountInput.addEventListener(
    "input",
    () => {

        const value =
            Number(
                brushAmountInput.value
            );

        brushAmountValue.textContent =
            value;

        onBrushAmountChange(value);
    }
);



    // -----------------------------
    // FPS
    // -----------------------------

    const fpsCheckBox =
        document.getElementById(
            "fpsCheckBox"
        );

    fpsCheckBox.addEventListener(
        "change",
        () => {

            onFPSChange(
                fpsCheckBox.checked
            );
        }
    );


    // -----------------------------
    // GRID
    // -----------------------------

    const gridCheckBox =
        document.getElementById(
            "gridCheckBox"
        );

    gridCheckBox.addEventListener(
        "change",
        () => {

            onGridChange(
                gridCheckBox.checked
            );
        }
    );
}