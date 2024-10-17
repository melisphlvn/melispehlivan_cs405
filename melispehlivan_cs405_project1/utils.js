function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
    0.17677669, -0.28661165, 0.36959946, 0.3,
    0.30618623, 0.36959946, 0.14016505, -0.25,
    -0.35355338, 0.17677669, 0.30618623, 0,
    0, 0, 0, 1

    ]);
    return getTransposeMatrix(transformationMatrix);
}

/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // Açıları radyan cinsine çevirme
    const radianX = (30 * Math.PI) / 180;  // 30 dereceyi radyana çevirme
    const radianY = (45 * Math.PI) / 180;  // 45 dereceyi radyana çevirme
    const radianZ = (60 * Math.PI) / 180;  // 60 dereceyi radyana çevirme

    // Dönüşüm matrislerini oluşturma
    const rotationXMatrix = createRotationMatrix_X(radianX);
    const rotationYMatrix = createRotationMatrix_Y(radianY);
    const rotationZMatrix = createRotationMatrix_Z(radianZ);

    // 1. Kimlik matrisi oluşturma (başlangıç matrisi)
    let modelViewMatrix = createIdentityMatrix();  // Başlangıç matrisi

    // Adım 1: Rotasyonları uygulama (Z, Y, X sırasıyla)
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationZMatrix); // Z ekseninde dönüş
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix); // Y ekseninde dönüş
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix); // X ekseninde dönüş

    // Adım 2: Ölçeklendirme matrisi oluşturma ve uygulama (X ve Y ekseninde 0.5, Z ekseninde 1)
    const scaleMatrix = createScaleMatrix(0.5, 0.5, 1);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);

    // Adım 3: Yer değiştirme matrisi oluşturma ve uygulama (X ekseninde 0.3, Y ekseninde -0.25, Z ekseninde 0)
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);

    // Son adım: Model görünüm matrisini Float32Array olarak döndürme
    return new Float32Array(modelViewMatrix);
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */

/**
 * Animate the cube object infinitely, transitioning between the initial 
 * and target transformations every 10 seconds.
 */
function getPeriodicMovement(startTime) {
    // Current time in seconds
    const currentTime = (Date.now() - startTime) / 1000; // Time in seconds
    const period = 10; // Total period of the animation (in seconds)
    const halfPeriod = period / 2;

    // Calculate the current time within the period
    const t = currentTime % period;

    // Define initial and target transformation matrices
    const initialMatrix = createIdentityMatrix(); // Identity matrix represents the initial state
    const targetMatrix = getModelViewMatrix();    // Use the transformation from Task 2

    // Helper function to interpolate between two matrices
    function lerpMatrix(matrixA, matrixB, alpha) {
        const result = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            result[i] = matrixA[i] + alpha * (matrixB[i] - matrixA[i]);
        }
        return result;
    }

    // Determine interpolation factor
    let modelViewMatrix;
    if (t < halfPeriod) {
        // First 5 seconds: Interpolate from initial to target matrix
        const alpha = t / halfPeriod; // Progress from 0 to 1
        modelViewMatrix = lerpMatrix(initialMatrix, targetMatrix, alpha);
    } else {
        // Next 5 seconds: Interpolate from target matrix back to initial matrix
        const alpha = (t - halfPeriod) / halfPeriod; // Progress from 0 to 1
        modelViewMatrix = lerpMatrix(targetMatrix, initialMatrix, alpha);
    }

    // Return the interpolated model view matrix
    return modelViewMatrix;
}





   




