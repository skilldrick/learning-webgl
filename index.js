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

  const perFragmentVertexShaderSource = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vTransformedNormal;
    varying highp vec4 vPosition;

    void main() {
      vPosition = uModelViewMatrix * vec4(aVertexPosition, 1);
      gl_Position = uProjectionMatrix * vPosition;
      vTextureCoord = aTextureCoord;
      vTransformedNormal = uNormalMatrix * aVertexNormal;
    }
  `;

  const perFragmentFragmentShaderSource = `
    precision highp float;

    varying vec2 vTextureCoord;
    varying vec3 vTransformedNormal;
    varying vec4 vPosition;

    vec3 ambientColor = vec3(0.1, 0.1, 0.1);
    vec3 pointLightingLocation = vec3(-10, 2, -20);
    vec3 pointLightingSpecularColor = vec3(3, 3, 2);
    vec3 pointLightingDiffuseColor = vec3(0.8, 0.8, 0.7);

    uniform sampler2D uColorMapSampler;
    uniform sampler2D uSpecularMapSampler;

    void main() {
      vec3 lightDirection = normalize(pointLightingLocation - vPosition.xyz);
      vec3 normal = normalize(vTransformedNormal);

      float shininess = texture2D(uSpecularMapSampler, vTextureCoord).r * 255.0;

      float specularLightWeighting = 0.0;

      if (shininess < 255.0) {
        vec3 eyeDirection = normalize(-vPosition.xyz);
        vec3 reflectionDirection = reflect(-lightDirection, normal);

        specularLightWeighting = pow(
          max(
            dot(reflectionDirection, eyeDirection),
            0.0
          ),
          shininess
        );
      }

      float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);

      vec3 lightWeighting = ambientColor +
        pointLightingSpecularColor * specularLightWeighting +
        pointLightingDiffuseColor * diffuseLightWeighting;

      vec4 fragmentColor = texture2D(uColorMapSampler, vTextureCoord);

      gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
    }
  `;


  function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
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

    const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

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
    function createBufferFrom1DArray(array, numComponents) {
      // create a new buffer
      const buffer = gl.createBuffer();

      // tell webgl this is the "current" array_buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      // load current buffer with contents of array, flattened and converted to Float32Array
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);

      buffer.numComponents = numComponents;

      buffer.numItems = array.length;

      return buffer;
    }

    function createBufferFrom2DArray(array) {
      // by (my) convention the inner arrays each correspond to a vertex, so the length
      // is the number of components per vertex (this is used by setupVertexAttrib)
      const numComponents = array[0].length;
      return createBufferFrom1DArray([].concat(...array), numComponents);
    }

    function createIndexBufferFromArray(array) {
      // create a new buffer
      const buffer = gl.createBuffer();

      // tell webgl this is the "current" element_array_buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

      // load current buffer with contents of array, converted to Uint16Array
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);

      // the index buffer only contains one component per vertex
      buffer.numComponents = 1;

      buffer.numItems = array.length;

      return buffer;
    }

    const latitudeBands = 50;
    const longitudeBands = 50;
    const radius = 13;

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
      earthVertexPositionBuffer: createBufferFrom2DArray(vertexPositionData),
      earthVertexNormalBuffer: createBufferFrom2DArray(normalData),
      earthVertexTextureCoordBuffer: createBufferFrom2DArray(textureCoordData),
      earthVertexIndexBuffer: createIndexBufferFromArray(indexData),
    };
  }

  function loadTextures(gl) {
    return {
      earthColorMap: loadTexture(gl, "https://s3-us-west-2.amazonaws.com/skilldrick-webgl/earth.jpg"),
      earthSpecularMap: loadTexture(gl, "https://s3-us-west-2.amazonaws.com/skilldrick-webgl/earth-specular.gif"),
    };
  }

  function loadTexture(gl, url) {
    function isPowerOf2(value) {
      return (value & (value - 1)) == 0;
    }

    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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

      gl.bindTexture(gl.TEXTURE_2D, null);
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

  // Functional matrix push/pop
  function withCopyOfMatrix(mat, cb) {
    const copy = mat4.create();
    mat4.copy(copy, mat);
    cb(copy);
  }

  function setMatrixUniforms(gl, programInfo, modelViewMatrix) {
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
      programInfo.uniformLocations.uModelViewMatrix,
      false,
      modelViewMatrix
    );
  }

  function drawScene(gl, programInfo, textures, buffers) {
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

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

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.uProjectionMatrix,
      false,
      projectionMatrix
    );

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    let modelViewMatrix = mat4.create();

    // Translate back
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -40]       // translate z
    );

    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(angle), [0, 1, 0]);
    mat4.multiply(modelViewMatrix, modelViewMatrix, earthRotationMatrix);

    setMatrixUniforms(gl, programInfo, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.earthColorMap);
    gl.uniform1i(programInfo.uniformLocations.uColorMapSampler, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.earthSpecularMap);
    gl.uniform1i(programInfo.uniformLocations.uSpecularMapSampler, 1);

    setupVertexAttrib(gl, buffers.earthVertexTextureCoordBuffer, programInfo.attribLocations.aTextureCoord);
    setupVertexAttrib(gl, buffers.earthVertexNormalBuffer, programInfo.attribLocations.aVertexNormal);
    setupVertexAttrib(gl, buffers.earthVertexPositionBuffer, programInfo.attribLocations.aVertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.earthVertexIndexBuffer);
    gl.drawElements(
      gl.TRIANGLES,
      buffers.earthVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  const earthRotationMatrix = mat4.create();

  const currentlyPressedKeys = {};

  // add event listeners
  (function () {
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    document.addEventListener('keydown', function (e) {
      currentlyPressedKeys[e.key] = true;
    });

    document.addEventListener('keyup', function (e) {
      currentlyPressedKeys[e.key] = false;
    });

    canvas.addEventListener('mousedown', function (e) {
      e.preventDefault();

      mouseDown = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    });

    document.addEventListener('mouseup', function (e) {
      mouseDown = false;
    });

    document.addEventListener('mousemove', function (e) {
      if (!mouseDown) {
        return;
      }

      const newX = event.clientX;
      const newY = event.clientY;

      const deltaX = newX - lastMouseX;
      const deltaY = newY - lastMouseY;

      updateEarthRotation(deltaX, deltaY);

      lastMouseX = newX;
      lastMouseY = newY;
    });

    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();

      mouseDown = true;
      const touch = e.touches[0];
      lastMouseX = touch.clientX;
      lastMouseY = touch.clientY;
    });

    document.addEventListener('touchend', function (e) {
      e.preventDefault();

      mouseDown = false;
    });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();

      if (!mouseDown) {
        return;
      }

      const touch = e.touches[0];
      const newX = touch.clientX;
      const newY = touch.clientY;

      const deltaX = newX - lastMouseX;
      const deltaY = newY - lastMouseY;

      updateEarthRotation(deltaX, deltaY);

      lastMouseX = newX;
      lastMouseY = newY;

    });
  })()

  function updateEarthRotation(deltaX, deltaY) {
    const newRotationMatrix = mat4.create();

    mat4.rotate(
      newRotationMatrix,
      newRotationMatrix,
      degToRad(deltaX / 10),
      [0, 1, 0]
    );

    mat4.rotate(
      newRotationMatrix,
      newRotationMatrix,
      degToRad(deltaY / 10),
      [1, 0, 0]
    );

    mat4.multiply(earthRotationMatrix, newRotationMatrix, earthRotationMatrix);
  }

  function handleInput() {
    if (currentlyPressedKeys['ArrowLeft']) {
    } else if (currentlyPressedKeys['ArrowRight']) {
    } else {
    }

    if (currentlyPressedKeys['ArrowUp']) {
    } else if (currentlyPressedKeys['ArrowDown']) {
    } else {
    }

    if (currentlyPressedKeys['a']) {
    } else if (currentlyPressedKeys['d']) {
    } else {
    }

    if (currentlyPressedKeys['w']) {
    } else if (currentlyPressedKeys['s']) {
    } else {
    }
  }

  function createProgramInfo(gl, vertexShaderSource, fragmentShaderSource, attribs, uniforms) {
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

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

  let angle = 0;

  function animate(deltaTime) {
    angle += 0.05 * deltaTime;
  }

  function setup() {
    const programInfo = createProgramInfo(
      gl,
      perFragmentVertexShaderSource,
      perFragmentFragmentShaderSource,
      ['aVertexPosition', 'aTextureCoord', 'aVertexNormal'],
      ['uProjectionMatrix', 'uModelViewMatrix', 'uNormalMatrix', 'uColorMapSampler', 'uSpecularMapSampler']
    );

    const buffers = initBuffers(gl);
    const textures = loadTextures(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to 100% opaque black
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing


    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
      const deltaTime = now - then;
      then = now;
      handleInput();
      drawScene(gl, programInfo, textures, buffers);
      animate(deltaTime);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  setup();
}
