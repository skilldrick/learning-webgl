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

    uniform highp vec3 uColor;

    void main() {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = texelColor * vec4(uColor, 1);
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

  function initBuffers(gl) {
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

      return buffer;
    }

    const starVertexPositionBuffer = createBufferFrom2DArray([
      [-1, -1, 0],
      [1, -1, 0],
      [-1, 1, 0],
      [1, 1, 0],
    ]);

    const textureCoord = createBufferFrom2DArray([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);

    return {
      starVertexPositionBuffer: starVertexPositionBuffer,
      textureCoord: textureCoord,
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

  function drawScene(gl, programInfo, buffers, texture, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to 100% opaque black
    gl.clearDepth(1.0);                 // Clear everything
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Use src alpha for source, identity for dest
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);          // Disable depth testing

    //gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear canvas before drawing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(
      projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar
    );

    // set modelViewMatrix back to identity
    mat4.identity(modelViewMatrix);

    // Now move the drawing position back by `z`
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, z]        // translate z axis
    );

    // Rotate around x axis
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      degToRad(tilt),  // amount to rotate in radians
      [1, 0, 0]        // axis to rotate around (x axis)
    );

    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    stars.forEach(star => {
      star.draw(tilt, spin);
      spin += 0.001;
    });
  }

  function drawStar() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    setupVertexAttrib(gl, buffers.starVertexPositionBuffer, programInfo.attribLocations.vertexPosition);
    setupVertexAttrib(gl, buffers.textureCoord, programInfo.attribLocations.textureCoord);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function Star(startingDistance, rotationSpeed) {
    this.angle = 0;
    this.dist = startingDistance;
    this.rotationSpeed = rotationSpeed;

    // Set the colors to a starting value.
    this.randomiseColors();
  }

  Star.prototype.draw = function (tilt, spin) {
    pushModelViewMatrix();

    // Move to the star's position
    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(this.angle), [0.0, 1.0, 0.0]);
    mat4.translate(modelViewMatrix, modelViewMatrix, [this.dist, 0.0, 0.0]);

    // Rotate back so that the star is facing the viewer
    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(-this.angle), [0.0, 1.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(-tilt), [1.0, 0.0, 0.0]);

    // All stars spin around the Z axis at the same rate
    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(spin), [0.0, 0.0, 1.0]);

    // Draw the star in its main color
    gl.uniform3f(programInfo.uniformLocations.colorUniform, this.r, this.g, this.b);
    drawStar()

    popModelViewMatrix();
  };

  const effectiveFPMS = 60 / 1000;

  Star.prototype.animate = function (elapsedTimeMs) {
    this.angle += this.rotationSpeed * effectiveFPMS * elapsedTimeMs;

    // Decrease the distance, resetting the star to the outside of
    // the spiral if it's at the center.
    this.dist -= 0.01 * effectiveFPMS * elapsedTimeMs;
    if (this.dist < 0.0) {
      this.dist += 5.0;
      this.randomiseColors();
    }
  };

  Star.prototype.randomiseColors = function () {
    // Give the star a random color for normal
    // circumstances...
    this.r = Math.random();
    this.g = Math.random();
    this.b = Math.random();
    /*
    // When the star is twinkling, we draw it twice, once
    // in the color below (not spinning) and then once in the
    // main color defined above.
    this.twinkleR = Math.random();
    this.twinkleG = Math.random();
    this.twinkleB = Math.random();
    */
  };

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  function initWorldObjects() {
    const stars = [];
    const numStars = 50;

    for (var i = 0; i < numStars; i++) {
      stars.push(new Star((i / numStars) * 5.0, i / numStars));
    }

    return stars;
  }

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
      colorUniform: gl.getUniformLocation(shaderProgram, 'uColor'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const buffers = initBuffers(gl);

  const stars = initWorldObjects();

  const texture = loadTexture(gl, 'https://s3-us-west-2.amazonaws.com/skilldrick-webgl/star.gif');

  const modelViewMatrixStack = [];

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var modelViewMatrix = mat4.create();
  const projectionMatrix = mat4.create();

  function pushModelViewMatrix() {
      var copy = mat4.create();
      mat4.copy(copy, modelViewMatrix);

      modelViewMatrixStack.push(copy);
  }

  function popModelViewMatrix() {
    if (modelViewMatrixStack.length === 0) {
        throw "Invalid popModelViewMatrix!";
    }

    modelViewMatrix = modelViewMatrixStack.pop();
  }

  function setMatrixUniforms() {
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
  }

  var z = -15.0;

  var tilt = 90;
  var spin = 0;

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
    if (currentlyPressedKeys['='] || currentlyPressedKeys['+']) {
      z += 0.1;
    }
    if (currentlyPressedKeys['_'] || currentlyPressedKeys['-']) {
      z -= 0.1;
    }

    if (currentlyPressedKeys['[']) {
      tilt += 2;
    }
    if (currentlyPressedKeys[']']) {
      tilt -= 2;
    }
  }

  function updateState(deltaTimeMs) {
    stars.forEach(star => {
      star.animate(deltaTimeMs);
    });
  }

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    handleInput();

    updateState(deltaTime * 1000);

    drawScene(gl, programInfo, buffers, texture, deltaTime);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
