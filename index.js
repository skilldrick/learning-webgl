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

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    uniform vec3 uLightingDirection;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLightWeighting;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      highp vec3 ambientColor = vec3(0.2, 0.2, 0.3);
      highp vec3 directionalColor = vec3(0.8, 0.8, 0.7);
      highp vec3 transformedNormal = uNormalMatrix * aVertexNormal;
      float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
      vLightWeighting = ambientColor + directionalColor * directionalLightWeighting;
    }
  `;

  // Fragment shader
  const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLightWeighting;

    uniform sampler2D uSampler;

    void main() {
      highp vec4 texel = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texel.rgb * vLightWeighting, 1);
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
      // is the number of components per vertex (this is used by setupVertexAttrib)
      buffer.numComponents = array[0].length;

      buffer.numItems = array.length;

      return buffer;
    }

    function createIndexBufferFromArray(array) {
      // create a new buffer
      const buffer = gl.createBuffer();

      // tell webgl this is the "current" element_array_buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

      // load current buffer with contents of array, converted to Uint16Array
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

      // the index buffer only contains one component per vertex
      buffer.numComponents = 1;

      buffer.numItems = indexData.length;

      return buffer;
    }

    const latitudeBands = 30;
    const longitudeBands = 30;
    const radius = 2;

    const vertexPositionData = [];
    const normalData = [];
    const textureCoordData = [];
    const indexData = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      let theta = latNumber * Math.PI / latitudeBands;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        let phi = longNumber * 2 * Math.PI / longitudeBands;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = cosPhi * sinTheta;
        let y = cosTheta;
        let z = sinPhi * sinTheta;

        let u = 1 - (longNumber / longitudeBands);
        let v = 1 - (latNumber / latitudeBands);

        normalData.push([x, y, z]);
        textureCoordData.push([u, v]);
        vertexPositionData.push([radius * x, radius * y, radius * z]);
      }
    }

    // the indexes don't use inclusive limits
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
        let first = (latNumber * (longitudeBands + 1)) + longNumber;
        let second = first + longitudeBands + 1;

        indexData.push(first, second, first + 1);
        indexData.push(second, second + 1, first + 1);
      }
    }

    return {
      moonVertexPositionBuffer: createBufferFrom2DArray(vertexPositionData),
      moonVertexNormalBuffer: createBufferFrom2DArray(normalData),
      moonVertexTextureCoordBuffer: createBufferFrom2DArray(textureCoordData),
      moonVertexIndexBuffer: createIndexBufferFromArray(indexData),
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

    // Translate back by 6
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -6]       // translate z by 6
    );

    const normalMatrix = mat3.create()
    mat3.fromMat4(normalMatrix, modelViewMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix3fv(
      programInfo.uniformLocations.uNormalMatrix,
      false,
      normalMatrix
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.uProjectionMatrix,
      false,
      projectionMatrix
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.uModelViewMatrix,
      false,
      modelViewMatrix
    );
    const lightingDirection = [-1, -1, -1];
    const adjustedLightingDirection = vec3.create();
    vec3.normalize(adjustedLightingDirection, lightingDirection);
    vec3.scale(adjustedLightingDirection, adjustedLightingDirection, -1);
    gl.uniform3fv(programInfo.uniformLocations.uLightingDirection, adjustedLightingDirection);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.moonVertexIndexBuffer);

    //5581
    gl.drawElements(gl.TRIANGLES, buffers.moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }
  var numItems = 1;

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  var pitch = 0;
  var pitchRate = 0;

  var yaw = 0;
  var yawRate = 0;
  var touchYaw = 0;

  var xPos = 0;
  var yPos = 0.4;
  var zPos =  10;

  var speed = 0;
  var touchSpeed = 0;
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
        touchSpeed = (currentTouch.y - previousTouch.y) / 100;
        touchYaw = (currentTouch.x - previousTouch.x) / 100;

        // Only set one of these at a time
        if (Math.abs(touchSpeed) > Math.abs(touchYaw)) {
          touchYaw = 0;
        } else {
          touchSpeed = 0;
        }
      }

      previousTouch = currentTouch;
    });

    document.addEventListener('touchend', function (e) {
      e.preventDefault();
      touchSpeed = 0;
      touchYaw = 0;
    });

  })()

  function handleInput() {
    if (currentlyPressedKeys['ArrowLeft']) {
      yawRate = 0.1;
    } else if (currentlyPressedKeys['ArrowRight']) {
      yawRate = -0.1;
    } else if (touchYaw) {
      yawRate = (touchYaw > 0) ? 0.1 : -0.1;
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
    } else if (touchSpeed) {
      speed = (touchSpeed > 0) ? 0.003 : -0.003;
    } else {
      speed = 0;
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

  function createProgramInfo(gl, vsSource, fsSource, attribs, uniforms) {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    function objectFromArray(arr, func) {
      return arr.reduce((obj, name) => {
        obj[name] = func(name);
        return obj;
      }, {});
    }

    function getAttribLocation(name) {
      const loc = gl.getAttribLocation(shaderProgram, name);
      if (loc === -1) {
        throw new Error("Invalid attrib location: " + name);
      }
      return loc;
    }

    function getUniformLocation(name) {
      const loc = gl.getUniformLocation(shaderProgram, name);
      if (loc === null) {
        throw new Error("Invalid uniform location: " + name);
      }
      return loc;
    }

    return {
      program: shaderProgram,
      attribLocations: objectFromArray(attribs, getAttribLocation),
      uniformLocations: objectFromArray(uniforms, getUniformLocation),
    };
  }

  function setup() {
    const programInfo = createProgramInfo(
      gl,
      vsSource,
      fsSource,
      ['aVertexPosition', 'aTextureCoord', 'aVertexNormal'],
      ['uProjectionMatrix', 'uModelViewMatrix', 'uNormalMatrix', 'uLightingDirection', 'uSampler']
    );

    const buffers = initBuffers(gl);

    const texture = loadTexture(
      gl,
      "moon.gif"
      //"https://s3-us-west-2.amazonaws.com/skilldrick-webgl/moon.gif"
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


    //TODO: set up lighting and mouse movement

    setupVertexAttrib(gl, buffers.moonVertexTextureCoordBuffer, programInfo.attribLocations.aTextureCoord);
    setupVertexAttrib(gl, buffers.moonVertexNormalBuffer, programInfo.attribLocations.aVertexNormal);
    setupVertexAttrib(gl, buffers.moonVertexPositionBuffer, programInfo.attribLocations.aVertexPosition);



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
