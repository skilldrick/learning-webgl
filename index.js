const levelData = `
NUMPOLLIES 36

// Floor 1
-3.0  0.0 -3.0 0.0 6.0
-3.0  0.0  3.0 0.0 0.0
 3.0  0.0  3.0 6.0 0.0

-3.0  0.0 -3.0 0.0 6.0
 3.0  0.0 -3.0 6.0 6.0
 3.0  0.0  3.0 6.0 0.0

// Ceiling 1
-3.0  1.0 -3.0 0.0 6.0
-3.0  1.0  3.0 0.0 0.0
 3.0  1.0  3.0 6.0 0.0
-3.0  1.0 -3.0 0.0 6.0
 3.0  1.0 -3.0 6.0 6.0
 3.0  1.0  3.0 6.0 0.0

// A1

-2.0  1.0  -2.0 0.0 1.0
-2.0  0.0  -2.0 0.0 0.0
-0.5  0.0  -2.0 1.5 0.0
-2.0  1.0  -2.0 0.0 1.0
-0.5  1.0  -2.0 1.5 1.0
-0.5  0.0  -2.0 1.5 0.0

// A2

 2.0  1.0  -2.0 2.0 1.0
 2.0  0.0  -2.0 2.0 0.0
 0.5  0.0  -2.0 0.5 0.0
 2.0  1.0  -2.0 2.0 1.0
 0.5  1.0  -2.0 0.5 1.0
 0.5  0.0  -2.0 0.5 0.0

// B1

-2.0  1.0  2.0 2.0  1.0
-2.0  0.0   2.0 2.0 0.0
-0.5  0.0   2.0 0.5 0.0
-2.0  1.0  2.0 2.0  1.0
-0.5  1.0  2.0 0.5  1.0
-0.5  0.0   2.0 0.5 0.0

// B2

 2.0  1.0  2.0 2.0  1.0
 2.0  0.0   2.0 2.0 0.0
 0.5  0.0   2.0 0.5 0.0
 2.0  1.0  2.0 2.0  1.0
 0.5  1.0  2.0 0.5  1.0
 0.5  0.0   2.0 0.5 0.0

// C1

-2.0  1.0  -2.0 0.0  1.0
-2.0  0.0   -2.0 0.0 0.0
-2.0  0.0   -0.5 1.5 0.0
-2.0  1.0  -2.0 0.0  1.0
-2.0  1.0  -0.5 1.5  1.0
-2.0  0.0   -0.5 1.5 0.0

// C2

-2.0  1.0   2.0 2.0 1.0
-2.0  0.0   2.0 2.0 0.0
-2.0  0.0   0.5 0.5 0.0
-2.0  1.0  2.0 2.0 1.0
-2.0  1.0  0.5 0.5 1.0
-2.0  0.0   0.5 0.5 0.0

// D1

2.0  1.0  -2.0 0.0 1.0
2.0  0.0   -2.0 0.0 0.0
2.0  0.0   -0.5 1.5 0.0
2.0  1.0  -2.0 0.0 1.0
2.0  1.0  -0.5 1.5 1.0
2.0  0.0   -0.5 1.5 0.0

// D2

2.0  1.0  2.0 2.0 1.0
2.0  0.0   2.0 2.0 0.0
2.0  0.0   0.5 0.5 0.0
2.0  1.0  2.0 2.0 1.0
2.0  1.0  0.5 0.5 1.0
2.0  0.0   0.5 0.5 0.0

// Upper hallway - L
-0.5  1.0  -3.0 0.0 1.0
-0.5  0.0   -3.0 0.0 0.0
-0.5  0.0   -2.0 1.0 0.0
-0.5  1.0  -3.0 0.0 1.0
-0.5  1.0  -2.0 1.0 1.0
-0.5  0.0   -2.0 1.0 0.0

// Upper hallway - R
0.5  1.0  -3.0 0.0 1.0
0.5  0.0   -3.0 0.0 0.0
0.5  0.0   -2.0 1.0 0.0
0.5  1.0  -3.0 0.0 1.0
0.5  1.0  -2.0 1.0 1.0
0.5  0.0   -2.0 1.0 0.0

// Lower hallway - L
-0.5  1.0  3.0 0.0 1.0
-0.5  0.0   3.0 0.0 0.0
-0.5  0.0   2.0 1.0 0.0
-0.5  1.0  3.0 0.0 1.0
-0.5  1.0  2.0 1.0 1.0
-0.5  0.0   2.0 1.0 0.0

// Lower hallway - R
0.5  1.0  3.0 0.0 1.0
0.5  0.0   3.0 0.0 0.0
0.5  0.0   2.0 1.0 0.0
0.5  1.0  3.0 0.0 1.0
0.5  1.0  2.0 1.0 1.0
0.5  0.0   2.0 1.0 0.0


// Left hallway - Lw

-3.0  1.0  0.5 1.0 1.0
-3.0  0.0   0.5 1.0 0.0
-2.0  0.0   0.5 0.0 0.0
-3.0  1.0  0.5 1.0 1.0
-2.0  1.0  0.5 0.0 1.0
-2.0  0.0   0.5 0.0 0.0

// Left hallway - Hi

-3.0  1.0  -0.5 1.0 1.0
-3.0  0.0   -0.5 1.0 0.0
-2.0  0.0   -0.5 0.0 0.0
-3.0  1.0  -0.5 1.0 1.0
-2.0  1.0  -0.5 0.0 1.0
-2.0  0.0   -0.5 0.0 0.0

// Right hallway - Lw

3.0  1.0  0.5 1.0 1.0
3.0  0.0   0.5 1.0 0.0
2.0  0.0   0.5 0.0 0.0
3.0  1.0  0.5 1.0 1.0
2.0  1.0  0.5 0.0 1.0
2.0  0.0   0.5 0.0 0.0

// Right hallway - Hi

3.0  1.0  -0.5 1.0 1.0
3.0  0.0   -0.5 1.0 0.0
2.0  0.0   -0.5 0.0 0.0
3.0  1.0  -0.5 1.0 1.0
2.0  1.0 -0.5 0.0 1.0
2.0  0.0   -0.5 0.0 0.0
`;


main();

function main() {
  const canvas = document.querySelector("#glCanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  //window.gl = gl;

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragement shader
  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  function initShaderProgram(gl, vsSource, fsSource) {
    function loadShader(type, source) {
      // create a new shader object of type `type`
      const shader = gl.createShader(type);

      // set the source to the provided source
      gl.shaderSource(shader, source);

      // compile the shader program
      gl.compileShader(shader);

      // check to see if it compiled correctly
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // if creating the program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  function initBuffers(gl, worldCoords) {
    function createBufferFrom2DArray(array) {
      // create a new buffer
      const buffer = gl.createBuffer();

      // tell webgl this is the "current" array_buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      // load current buffer with contents of array, flattened and converted to Float32Array
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([].concat(...array)), gl.STATIC_DRAW);

      // by (my) convention the inner arrays each correspond to a vertex, so the length
      // is the number of components per vertex (this is used by setupVertexArray)
      buffer.numComponents = array[0].length;

      buffer.numItems = array.length;

      return buffer;
    }

    const worldVertexCoordBuffer = createBufferFrom2DArray(worldCoords.vertexPositions);

    const worldVertexTextureCoordBuffer = createBufferFrom2DArray(worldCoords.vertexTextureCoords);

    return {
      worldVertexCoordBuffer,
      worldVertexTextureCoordBuffer
    };
  }

  function loadTexture(gl, url) {
    function isPowerOf2(value) {
      return (value & (value - 1)) == 0;
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue

    gl.texImage2D(
      gl.TEXTURE_2D, level, internalFormat, 1, 1, 0, srcFormat, srcType, pixel
    );

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image
      );

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);

        // Use anisotropic filter (http://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html)
        const ext = gl.getExtension("EXT_texture_filter_anisotropic");
        if (ext) {
          gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        }
      } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        //
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
    };

    image.src = url;

    return texture;
  }

  // Tell WebGL how to pull out values from `buffer` into the attribute at `attribLocation`
  function setupVertexAttrib(gl, buffer, attribLocation) {
    const normalize = false;
    const stride = 0;
    const offset = 0;
    const type = gl.FLOAT;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.vertexAttribPointer(
      attribLocation,
      buffer.numComponents,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(attribLocation);
  }

  function drawScene(gl, programInfo, buffers) {
    // Clear canvas before drawing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a projection matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const projectionMatrix = mat4.create();

    mat4.perspective(
      projectionMatrix,
      45 * Math.PI / 180, // field of view
      gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
      0.1,   // zNear
      100    // zFar
    );

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Rotate around x axis (pitch)
    mat4.rotate(
      modelViewMatrix,  // destination matrix
      modelViewMatrix,  // matrix to rotate
      degToRad(-pitch), // amount to rotate in radians
      [1, 0, 0]         // axis to rotate around (x axis)
    );

    // Rotate around y axis (yaw)
    mat4.rotate(
      modelViewMatrix,  // destination matrix
      modelViewMatrix,  // matrix to rotate
      degToRad(-yaw), // amount to rotate in radians
      [0, 1, 0]         // axis to rotate around (y axis)
    );

    // Translate based on current player position
    mat4.translate(
      modelViewMatrix,      // destination matrix
      modelViewMatrix,      // matrix to translate
      [-xPos, -yPos, -zPos] // translate to current player position
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.drawArrays(gl.TRIANGLES, 0, 108);
  }

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  function loadWorld() {
    var vertexPositions = [];
    var vertexTextureCoords = [];

    levelData.split("\n").forEach(line => {
      const vals = line.replace(/^\s+/, "").split(/\s+/);
      if (vals.length === 5 && vals[0] !== "//") {
        // this line represents a vertex
        const floatVals = vals.map(v => parseFloat(v));

        // first 3 values are vertex coords
        vertexPositions.push(floatVals.slice(0, 3));

        // last 2 values are texture coords
        vertexTextureCoords.push(floatVals.slice(3, 5));
      }
    });

    return {
      vertexPositions,
      vertexTextureCoords,
    };
  }


  var pitch = 0;
  var pitchRate = 0;

  var yaw = 0;
  var yawRate = 0;

  var xPos = 0;
  var yPos = 0.4;
  var zPos = 0;

  var speed = 0;
  var strafe = 0;

  const currentlyPressedKeys = {};

  // add event listeners
  (function () {
    document.addEventListener('keydown', function (e) {
      currentlyPressedKeys[e.key] = true;
    });

    document.addEventListener('keyup', function (e) {
      currentlyPressedKeys[e.key] = false;
    });
  })()

  function handleInput() {
    if (currentlyPressedKeys['ArrowLeft']) {
      yawRate = 0.1;
    } else if (currentlyPressedKeys['ArrowRight']) {
      yawRate = -0.1;
    } else {
      yawRate = 0;
    }

    if (currentlyPressedKeys['ArrowUp']) {
      pitchRate = 0.1;
    } else if (currentlyPressedKeys['ArrowDown']) {
      pitchRate = -0.1;
    } else {
      pitchRate = 0;
    }

    if (currentlyPressedKeys['a']) {
      strafe = 0.003;
    } else if (currentlyPressedKeys['d']) {
      strafe = -0.003;
    } else {
      strafe = 0;
    }

    if (currentlyPressedKeys['w']) {
      speed = 0.003;
    } else if (currentlyPressedKeys['s']) {
      speed = -0.003;
    } else {
      speed = 0;
    }



    if (currentlyPressedKeys['='] || currentlyPressedKeys['+']) {
    }
    if (currentlyPressedKeys['_'] || currentlyPressedKeys['-']) {
    }

    if (currentlyPressedKeys['[']) {
    }
    if (currentlyPressedKeys[']']) {
    }
  }

  // Used to make us "jog" up and down as we move forward.
  var joggingAngle = 0;

  function animate(deltaTime) {
    if (speed !== 0 || strafe !== 0) {
      xPos -= Math.sin(degToRad(yaw)) * speed * deltaTime;
      zPos -= Math.cos(degToRad(yaw)) * speed * deltaTime;
      xPos -= Math.sin(degToRad(yaw + 90)) * strafe * deltaTime;
      zPos -= Math.cos(degToRad(yaw + 90)) * strafe * deltaTime;

      joggingAngle += deltaTime * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
      yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
    }

    yaw += yawRate * deltaTime;
    pitch += pitchRate * deltaTime;

    pitch = Math.min(Math.max(pitch, -75), 75);
  }

  function setup() {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };

    const worldCoords = loadWorld();
    const buffers = initBuffers(gl, worldCoords);


    const texture = loadTexture(
      gl,
      "https://s3-us-west-2.amazonaws.com/skilldrick-webgl/walltexture.jpg"
    );

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to 100% opaque black
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing

    //gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    setupVertexAttrib(gl, buffers.worldVertexTextureCoordBuffer, programInfo.attribLocations.textureCoord);
    setupVertexAttrib(gl, buffers.worldVertexCoordBuffer, programInfo.attribLocations.vertexPosition);


    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
      const deltaTime = now - then;
      then = now;

      handleInput();

      drawScene(gl, programInfo, buffers);

      animate(deltaTime);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  setup();
}
