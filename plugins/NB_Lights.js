//=============================================================================
// NB_Lights.js
//=============================================================================

/*:
 * @plugindesc Adds a fast lighting layer.
 * @author Khas / Scalytank
 * @help All credit goes to Khas, this plugin is based on his Advanced Lighting.
 */

(function() {
    
    var aliases = {};
    
    ImageManager.loadLight = function(filename) {
        return this.loadBitmap('img/lights/', filename, 0, true);  
    };
    
    /*********************************************
     * Graphics renderer
     *********************************************/
    
    aliases.Graphics_static__createRenderer = Graphics._createRenderer;
    Graphics._createRenderer = function() {
        aliases.Graphics_static__createRenderer.call(this);
        var gl = this._renderer.gl;
        PIXI.BLEND_MODES.NB_LIGHT = 77;
        PIXI.BLEND_MODES.NB_LIGHTING = 78;
        this._renderer.state.blendModes[PIXI.BLEND_MODES.NB_LIGHT] = [gl.SRC_ALPHA, gl.ONE];
        this._renderer.state.blendModes[PIXI.BLEND_MODES.NB_LIGHTING] = [gl.ZERO, gl.SRC_COLOR];
    };
    
    /*********************************************
     * Filters
     *********************************************/
    
    var filtersSource = {};
    filtersSource.VERTEX_GENERAL = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n  \n  varying vec2 vTextureCoord;\n  \n  uniform mat3 projectionMatrix;\n  \n  void main(void) {\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
    filtersSource.VERTEX_FLIP_Y = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n\n  varying vec2 vTextureCoord;\n  varying float flipY;\n\n  uniform mat3 projectionMatrix;\n\n  void main(void) {\n    flipY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
    filtersSource.FRAGMENT_LIGHTING = "\n  varying vec2 vTextureCoord;\n\n  uniform vec2 screenResolution;\n  uniform sampler2D uSampler;\n  uniform float ambientLight;\n\n  void main(void) {\n    vec4 light = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = light + vec4(ambientLight);\n  }\n";
    
    function NB_Filter() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Filter.prototype = Object.create(PIXI.Filter.prototype);
    NB_Filter.prototype.constructor = NB_Filter
    
    NB_Filter.prototype.initialize = function(vertexSource, fragmentSource) {
        PIXI.Filter.call(this, vertexSource, fragmentSource);
    };
    
    NB_Filter.prototype.copyUniforms = function(filter) {
        for (var uniform in filter.uniforms) {
            if (filter.uniforms.hasOwnProperty(uniform) && this.uniforms.hasOwnProperty(uniform)) {
                this.uniforms[uniform] = filter.uniforms[uniform];
            }
        }
    };
    
    function NB_LightingFilter() {
        this.initialize.apply(this, arguments);
    }
    
    NB_LightingFilter.prototype = Object.create(NB_Filter.prototype);
    NB_LightingFilter.prototype.constructor = NB_LightingFilter;
    
    NB_LightingFilter.prototype.initialize = function() {
        NB_Filter.prototype.initialize.call(this, filtersSource.VERTEX_GENERAL, filtersSource.FRAGMENT_LIGHTING);
    };
    
    NB_LightingFilter.prototype.setResolution = function(width, height) {
        this.uniforms.screenResolution.x = width;
        this.uniforms.screenResolution.y = height;
    };
    
    NB_LightingFilter.prototype.setLightMap = function(lightMap) {
        this.uniforms.lightMap = lightMap;
    };
    
    NB_LightingFilter.prototype.setAmbientLight = function(intensity) {
        this.uniforms.ambientLight = intensity * 0.01;
    };
    
    /*********************************************
     * Custom sprite
     *********************************************/
     
    function NB_Sprite() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Sprite.prototype = Object.create(PIXI.Sprite.prototype);
    NB_Sprite.prototype.constructor = NB_Sprite;
    
    NB_Sprite.prototype.initialize = function(texture) {
        PIXI.Sprite.call(this, texture);
    };
    
    NB_Sprite.prototype.setFilter = function(filter) {
        this.filters = [filter];
    };
    
    NB_Sprite.prototype.resetFilter = function() {
        this.filters = null;
    };
    
    /*********************************************
     * The main lighting layer
     *********************************************/
    
    function NB_Lighting() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Lighting.prototype.initialize = function() {
        this._lights = [];
        this._layer = new PIXI.Container();
        this._lightMap = new PIXI.RenderTexture.create(Graphics.width, Graphics.height);
        this._filter = new NB_LightingFilter();
        this._filter.setResolution(Graphics.width, Graphics.height);
        this._filter.blendMode = PIXI.BLEND_MODES.NB_LIGHTING;
        this._layerSprite = new NB_Sprite(this._lightMap);
        this._layerSprite.setFilter(this._filter);
    };
    
    NB_Lighting.prototype.addLight = function(spriteLight) {
        this._lights.push(spriteLight);
        this._layer.addChild(spriteLight);
    };
    
    NB_Lighting.prototype.update = function() {
        this._filter.setAmbientLight(40);
        Graphics._renderer.render(this._layer, this._lightMap);
    };
    
    /*********************************************
     * Map extensions
     *********************************************/
    
    aliases.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        aliases.Spriteset_Map_createLowerLayer.call(this);
        
        this._lighting = new NB_Lighting();
        
        this.sprite1 = new Sprite(ImageManager.loadLight('light_nb'));
        this.sprite1.blendMode = PIXI.BLEND_MODES.NB_LIGHT;
        this.sprite2 = new Sprite(ImageManager.loadLight('light_nb'));
        this.sprite2.blendMode = PIXI.BLEND_MODES.NB_LIGHT;
        this.sprite3 = new Sprite(ImageManager.loadLight('red'));
        this.sprite3.blendMode = PIXI.BLEND_MODES.NB_LIGHT;
        this.sprite2.x = 100;
        this.sprite2.y = 95;
        this.sprite3.x = 120;
        this.sprite3.y = 300;
        this._lighting.addLight(this.sprite1);
        this._lighting.addLight(this.sprite2);
        this._lighting.addLight(this.sprite3);
        
        this._baseSprite.addChild(this._lighting._layerSprite);
    };
    
    aliases.Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        aliases.Spriteset_Map_update.call(this);
        this.sprite1.x = $gamePlayer.screenX()-300;
        this.sprite1.y = $gamePlayer.screenY()-300;
        this._lighting.update();
    };
    
})();
