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
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // apply lighting effect
      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // Fragement shader
  const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform highp float uAlpha;

    uniform sampler2D uSampler;

    void main() {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a * uAlpha);
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

    /*
           f-----g
          /|    /|
      1 d-----c  |
        |  |  |  |
     y  |  e--|--h   -1
        | /   | /      z
     -1 a-----b    1
           x
       -1      1
    */

    const a = [-1, -1,  1];
    const b = [ 1, -1,  1];
    const c = [ 1,  1,  1];
    const d = [-1,  1,  1];
    const e = [-1, -1, -1];
    const f = [-1,  1, -1];
    const g = [ 1,  1, -1];
    const h = [ 1, -1, -1];

    // Faces are defined in counter-clockwise order, which means
    // the "front" of the face.
    const positionBuffer = createBufferFrom2DArray([
      a, b, c, d, // Front face
      e, f, g, h, // Back face
      f, d, c, g, // Top face
      e, h, b, a, // Bottom face
      h, g, c, b, // Right face
      e, a, d, f, // Left face
    ]);

    const bl = [0, 0];
    const tl = [1, 0];
    const tr = [1, 1];
    const br = [0, 1];

    // defined this way to match positions array
    const textureCoordBuffer = createBufferFrom2DArray([
      bl, tl, tr, br, // Front
      bl, tl, tr, br, // Back
      bl, tl, tr, br, // Top
      bl, tl, tr, br, // Bottom
      bl, tl, tr, br, // Right
      bl, tl, tr, br, // Left
    ]);

    const outward = [0, 0, 1];
    const inward  = [0, 0, -1];
    const up      = [0, 1, 0];
    const down    = [0, -1, 0];
    const right   = [1, 0, 0];
    const left    = [-1, 0, 0];

    // defined this way to match positions array
    const normalBuffer = createBufferFrom2DArray([
      outward, outward, outward, outward, // Front
      inward, inward, inward, inward,     // Back
      up, up, up, up,                     // Top
      down, down, down, down,             // Bottom
      right, right, right, right,         // Right
      left, left, left, left,             // Left
    ]);

    // This array defines each face as two triangles, using the indices into the
    // vertex array to specify each triangle's position.
    // E.g. 0, 1, 2 is the triangle abc and 0, 2, 3 is acd
    // This enables us to reuse vertices to draw more than one triangle.
    const indices = [
      0,  1,  2,   0,  2,  3,  // front
      4,  5,  6,   4,  6,  7,  // back
      8,  9,  10,  8,  10, 11, // top
      12, 13, 14,  12, 14, 15, // bottom
      16, 17, 18,  16, 18, 19, // right
      20, 21, 22,  20, 22, 23, // left
    ];

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      normal: normalBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
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

    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(
      projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar
    );

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, z]        // translate z axis
    );

    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      yRotation,       // amount to rotate in radians
      [0, 1, 0]        // axis to rotate around (y axis)
    );

    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      xRotation,       // amount to rotate in radians
      [1, 0, 0]        // axis to rotate around (x axis)
    );

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set shader uniforms
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

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix
    );

    setupVertexAttrib(gl, buffers.position, programInfo.attribLocations.vertexPosition);
    setupVertexAttrib(gl, buffers.textureCoord, programInfo.attribLocations.textureCoord);
    setupVertexAttrib(gl, buffers.normal, programInfo.attribLocations.vertexNormal);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Only draw front face
    //gl.cullFace(gl.BACK);
    //gl.enable(gl.CULL_FACE);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.uniform1f(programInfo.uniformLocations.alphaUniform, 0.5);

    gl.drawElements(gl.TRIANGLES, /*vertexCount*/ 36, /*type*/ gl.UNSIGNED_SHORT, /*offset*/ 0);
  }

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      alphaUniform: gl.getUniformLocation(shaderProgram, 'uAlpha'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const buffers = initBuffers(gl);

  const texture = loadTexture(gl, 'https://s3-us-west-2.amazonaws.com/skilldrick-webgl/crate2.jpg');

  var xRotation = 0.0;
  var yRotation = 0.0;
  var z = -6.0;

  var xSpeed = 0.5;
  var ySpeed = 1.0;

  const currentlyPressedKeys = {};

  // add event listeners
  (function () {
    document.addEventListener('keydown', function (e) {
      currentlyPressedKeys[e.key] = true;
    });

    document.addEventListener('keyup', function (e) {
      currentlyPressedKeys[e.key] = false;
    });

    var previousTouch = null;

    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      previousTouch = null;
    });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();

      const touch = e.touches[0];
      const currentTouch = { x: touch.clientX, y: touch.clientY };

      if (previousTouch) {
        xSpeed += (currentTouch.y - previousTouch.y) / 100;
        ySpeed += (currentTouch.x - previousTouch.x) / 100;
      }

      previousTouch = currentTouch;
    });
  })()

  function handleInput() {
    if (currentlyPressedKeys['w']) {
      xSpeed -= 0.05;
    }
    if (currentlyPressedKeys['s']) {
      xSpeed += 0.05;
    }
    if (currentlyPressedKeys['a']) {
      ySpeed -= 0.05;
    }
    if (currentlyPressedKeys['d']) {
      ySpeed += 0.05;
    }
    if (currentlyPressedKeys['='] || currentlyPressedKeys['+']) {
      z += 0.05;
    }
    if (currentlyPressedKeys['_'] || currentlyPressedKeys['-']) {
      z -= 0.05;
    }
  }

  function updateState(deltaTime) {
    xRotation += xSpeed * deltaTime;
    yRotation += ySpeed * deltaTime;
  }

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    handleInput();

    updateState(deltaTime)

    drawScene(gl, programInfo, buffers, texture, deltaTime);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
