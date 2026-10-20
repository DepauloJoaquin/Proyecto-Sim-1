// Loads the fragment shader file as text

async function loadMetaballShader(){
    const response = await fetch("./metaball.frag");

    const shaderCode = await response.text();

    return shaderCode;
}

export{
    loadMetaballShader,
    metaballVertexShader
}

// Vertex shader used by the metaball filter
const metaballVertexShader = `
     in vec2 aPosition;

    out vec2 vTextureCoord;

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition() {

        vec2 position =
            aPosition * uOutputFrame.zw
            + uOutputFrame.xy;

        position.x =
            position.x
            * (2.0 / uOutputTexture.x)
            - 1.0;

        position.y =
            position.y
            * (2.0 * uOutputTexture.z / uOutputTexture.y)
            - uOutputTexture.z;

        return vec4(
            position,
            0.0,
            1.0
        );
    }

    vec2 filterTextureCoord() {

        return aPosition
            * (uOutputFrame.zw * uInputSize.zw);
    }

    void main() {

        gl_Position =
            filterVertexPosition();

        vTextureCoord =
            filterTextureCoord();
    }



`;

