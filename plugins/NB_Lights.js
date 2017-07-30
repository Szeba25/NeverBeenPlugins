//=============================================================================
// NB_Lights.js
//=============================================================================

/*:
 * @plugindesc Adds a fast lighting layer.
 * @author Khas / Scalytank
 * @help All credit goes to Khas, this plugin is based on his Advanced Lighting.
 * The shader code, and rendering logic, which is the most important part
 * of this plugin comes from Khas. The lighting management system is redesigned
 * totally, to match the needs for this project.
 * 
 * Social Media:
 * Blog: arcthunder.blogspot.com
 * Patreon: patreon.com/khas
 * Facebook: facebook.com/khasarc
 * Twitter: twitter.com/arcthunder
 * Youtube: youtube.com/c/khasarc
 *
 * Script Source:
 * forums.rpgmakerweb.com/index.php?/forum/132-khas-scripts
 *
 * DEPENDENCY:
 * > NB_SmoothCamera.js
 *
 * Plugin commands:
 *
 * - lights_enable
 *   must call this on every map to start the lighting system
 *
 * - lights_change_ambient [ambient%] [duration]
 *   the ambient value is how bright the map is:
 *   0 = total darkness
 *   100 = no ambient
 *
 * - lights_add_to_map [id] [x] [y] [name] [intensity%] [shadeName] [shadeIntensity%]
 *   > Optional: [baseSize%] [intensityTarget%] [intensityChangeDuration]
 *   if shadeName is 'none' there wont be any shade added.
 *   if shadeName is 'same' the shade image will be the same as the light image, but with different blend mode.
 *
 * - lights_add_to_event [id] [eventId] [name] [intensity%] [shadeName] [shadeIntensity%]
 *   > Optional: [baseSize%] [intensityTarget%] [intensityChangeDuration]
 *   if shadeName is 'none' there wont be any shade added.
 *   if shadeName is 'same' the shade image will be the same as the light image, but with different blend mode.
 *
 * - lights_add_to_player [id] [name] [intensity%] [shadeName] [shadeIntensity%]
 *   > Optional: [baseSize%] [intensityTarget%] [intensityChangeDuration]
 *   if shadeName is 'none' there wont be any shade added.
 *   if shadeName is 'same' the shade image will be the same as the light image, but with different blend mode.
 *
 * - lights_change_intensity [id] [intensityTarget%] [intensityChangeDuration]
 *   id can be set to 'all' to affect all lights
 *
 * - lights_change_base_size [id] [baseSizeTarget%] [baseSizeChangeDuration]
 *   id can be set to 'all' to affect all lights
 *
 * - lights_set_flaring [id] [flaringMin%] [flaringChangeDuration] [affectsIntensity|]
 *   id can be set to 'all' to affect all lights
 *   affectsIntensity is a boolean variable, true/false values are accepted!
 *
 * - lights_stop_flaring [id] [stopDuration]
 *   id can be set to 'all' to affect all lights
 *
 * - lights_set_rotation [id] [rotation]
 *   rotation is in degrees
 *   id can be set to 'all' to affect all lights
 *
 * - lights_set_rotation_delta [id] [rotationDelta]
 *   rotationDelta is in degrees
 *   id can be set to 'all' to affect all lights
 *
 * - lights_change_shade_intensity [id] [shadeIntensityTarget%] [shadeIntensityChangeDuration]
 *   id can be set to 'all' to affect all lights
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
     * Custom lightmap sprite
     *********************************************/
    
    var SHAKE_CORRECTION = 50;
     
    function NB_LightMapSprite() {
        this.initialize.apply(this, arguments);
    }

    NB_LightMapSprite.prototype = Object.create(PIXI.Sprite.prototype);
    NB_LightMapSprite.prototype.constructor = NB_LightMapSprite;

    NB_LightMapSprite.prototype.initialize = function(texture) {
        PIXI.Sprite.call(this, texture);
        this.x = -1 * SHAKE_CORRECTION;
    };

    NB_LightMapSprite.prototype.setFilter = function(filter) {
        this.filters = [filter];
    };

    NB_LightMapSprite.prototype.resetFilter = function() {
        this.filters = null;
    };
    
    /*********************************************
     * Load the shared lightingData on startup
     *********************************************/
    
    var lightingData = {};
    lightingData.lightMapTexture = null;
    lightingData.filter = null;
    
    SceneManager._loadLightingData = function() {
        lightingData.lightMapTexture = new PIXI.RenderTexture.create(Graphics.width + (SHAKE_CORRECTION * 2), Graphics.height);
        lightingData.filter = new NB_LightingFilter();
        lightingData.filter.setResolution(Graphics.width, Graphics.height);
        lightingData.filter.blendMode = PIXI.BLEND_MODES.NB_LIGHTING;
    }
    
    aliases.SceneManager_static_initialize = SceneManager.initialize;
    SceneManager.initialize = function() {
        aliases.SceneManager_static_initialize.call(this);
        this._loadLightingData();
    };
    
    /*********************************************
     * Sprite for lights
     *********************************************/
     
    function NB_LightSprite() {
        this.initialize.apply(this, arguments);
    }
    
    NB_LightSprite.prototype = Object.create(Sprite.prototype);
    NB_LightSprite.prototype.constructor = NB_LightSprite;
    
    NB_LightSprite.prototype.initialize = function(lightData) {
        Sprite.prototype.initialize.call(this, ImageManager.loadLight(lightData.name));
        this.blendMode = PIXI.BLEND_MODES.NB_LIGHT;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._lightData = lightData;
    };
    
    NB_LightSprite.prototype.sync = function() {
        this.x = this._lightData.x + SHAKE_CORRECTION;
        this.y = this._lightData.y;
        this.opacity = this._lightData.opacity;
        this.scale.x = this._lightData.scale;
        this.scale.y = this._lightData.scale;
        this.rotation = this._lightData.rotationInRadian;
        if (this.opacity === 0 && this.visible) this.visible = false;
        if (this.opacity > 0 && !this.visible) this.visible = true;
    };
    
    /*********************************************
     * Sprite for light shades
     *********************************************/
    
    function NB_LightShadeSprite() {
        this.initialize.apply(this, arguments);
    }
    
    NB_LightShadeSprite.prototype = Object.create(Sprite.prototype);
    NB_LightShadeSprite.prototype.constructor = NB_LightShadeSprite;
    
    NB_LightShadeSprite.prototype.initialize = function(lightData) {
        var finalShadeName = null;
        if (lightData.shadeName === 'same') {
            finalShadeName = lightData.name;
        } else {
            finalShadeName = lightData.shadeName;
        }
        Sprite.prototype.initialize.call(this, ImageManager.loadLight(finalShadeName));
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._lightData = lightData;
    };
    
    NB_LightShadeSprite.prototype.sync = function() {
        this.x = this._lightData.x;
        this.y = this._lightData.y;
        this.opacity = this._lightData.shadeOpacity;
        this.scale.x = this._lightData.scale;
        this.scale.y = this._lightData.scale;
        this.rotation = this._lightData.rotationInRadian;
        if (this.opacity === 0 && this.visible) this.visible = false;
        if (this.opacity > 0 && !this.visible) this.visible = true;
    };
    
    /*********************************************
     * The main light map
     *********************************************/
    
    function NB_LightMap() {
        this.initialize.apply(this, arguments);
    }
    
    NB_LightMap.prototype.initialize = function(manager) {
        this._manager = manager;
        this._layer = new PIXI.Container();
        this._layerSprite = new NB_LightMapSprite(lightingData.lightMapTexture);
        this._layerSprite.setFilter(lightingData.filter);
        this._layerSprite.visible = false;
        this._shadeLayer = new PIXI.Container();
        this._shadeLayer.visible = false;
        lightingData.filter.setAmbientLight(100);
    };
    
    NB_LightMap.prototype._addNewLights = function() {
        var currentLights = this._manager.lights;
        for (var i = 0; i < currentLights.length; i++) {
            var light = currentLights[i];
            if (!light.addedToLightMap) {
                var sprite = new NB_LightSprite(light);
                this._layer.addChild(sprite);
                if (light.shadeName !== 'none') {
                    var shadeSprite = new NB_LightShadeSprite(light);
                    this._shadeLayer.addChild(shadeSprite);
                }
                light.addedToLightMap = true;
            }
        }
    };
    
    NB_LightMap.prototype._updateLights = function() {
        var layerSprites = this._layer.children;
        for (var i = 0; i < layerSprites.length; i++) {
            layerSprites[i].sync();
        }
        var shadeLayerSprites = this._shadeLayer.children;
        for (var i = 0; i < shadeLayerSprites.length; i++) {
            shadeLayerSprites[i].sync();
        }
    };
    
    NB_LightMap.prototype.update = function() {
        if (this._manager.enabled) {
            if (!this._layerSprite.visible) this._layerSprite.visible = true;
            if (!this._shadeLayer.visible) this._shadeLayer.visible = true;    
            lightingData.filter.setAmbientLight(this._manager.ambient);
            this._addNewLights();
            this._updateLights();
            Graphics._renderer.render(this._layer, lightingData.lightMapTexture);
        }
    };
    
    NB_LightMap.prototype.getShadeLayer = function() {
        return this._shadeLayer;
    };
    
    NB_LightMap.prototype.getLayerSprite = function() {
        return this._layerSprite;
    };
    
    /*********************************************
     * Map extensions
     *********************************************/
    
    aliases.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        aliases.Spriteset_Map_createLowerLayer.call(this);
        
        $gameMap.prepareLightMapRefresh();
        this._lighting = new NB_LightMap($gameMap.getLightingManager());
        console.log($gameMap.getLightingManager());
        this._baseSprite.addChild(this._lighting.getShadeLayer());
        this._baseSprite.addChild(this._lighting.getLayerSprite());
        
        //console.log('Spriteset_Map created');
    };
    
    aliases.Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        aliases.Spriteset_Map_update.call(this);
        // We update lights in the spriteset to avoid delay!
        $gameMap.getLightingManager().update();
        this._lighting.update();
    };
    
    aliases.Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        aliases.Game_Map_setup.call(this, mapId);
        this._lightingManager = new NB_LightingManager();
        //console.log('Game_Map setup: ' + mapId);
    };
    
    Game_Map.prototype.getLightingManager = function() {
        return this._lightingManager;
    };
    
    Game_Map.prototype.prepareLightMapRefresh = function() {
        this._lightingManager.setAllLightsToNotAdded();
    };
    
    /*********************************************
     * Fix for snapshots
     *********************************************/
    
    aliases.SceneManager_static_snap = SceneManager.snap;
    SceneManager.snap = function() {
        if (this._scene instanceof Scene_Map) {
            this._scene._spriteset._lighting.getLayerSprite().visible = false;
            //console.log('Escaped from Scene_Map!');
        }
        return aliases.SceneManager_static_snap.call(this);
    };
    
    // Override!
    SceneManager.snapForBackground = function() {
        this._backgroundBitmap = this.snap();
    };
    
    SceneManager.getLightAsSprite = function() {
        var sprite = new NB_LightMapSprite(lightingData.lightMapTexture);
        sprite.setFilter(lightingData.filter);
        return sprite;
    };
    
    /*********************************************
     * Plugin commands
     *********************************************/
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        switch (command) {
            case 'lights_enable':
                $gameMap.getLightingManager().enable();
                break;
            case 'lights_change_ambient':
                var ambient = parseInt(args[0]);
                $gameMap.getLightingManager().changeAmbient(ambient, parseInt(args[1]));
                break;
            case 'lights_add_to_map':
                var id = parseInt(args[0]);
                var x = parseInt(args[1]);
                var y = parseInt(args[2]);
                var name = args[3];
                var intensity = parseInt(args[4]);
                var shadeName = args[5];
                var shadeIntensity = parseInt(args[6]);
                var light = new NB_Light(id, null, x, y, name, intensity, shadeName, shadeIntensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length >= 8) {
                    var baseSize = parseInt(args[7]);
                    light.setBaseSize(baseSize);
                }
                if (args.length == 10) {
                    var intensityTarget = parseInt(args[8]);
                    var intensityChangeDuration = parseInt(args[9]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_add_to_event':
                var id = parseInt(args[0]);
                var event = $gameMap.event(parseInt(args[1]));
                var name = args[2];
                var intensity = parseInt(args[3]);
                var shadeName = args[4];
                var shadeIntensity = parseInt(args[5]);
                var light = new NB_Light(id, event, 0, 0, name, intensity, shadeName, shadeIntensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length >= 7) {
                    var baseSize = parseInt(args[6]);
                    light.setBaseSize(baseSize);
                }
                if (args.length == 9) {
                    var intensityTarget = parseInt(args[7]);
                    var intensityChangeDuration = parseInt(args[8]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_add_to_player':
                var id = parseInt(args[0]);
                var name = args[1];
                var intensity = parseInt(args[2]);
                var shadeName = args[3];
                var shadeIntensity = parseInt(args[4]);
                var light = new NB_Light(id, $gamePlayer, 0, 0, name, intensity, shadeName, shadeIntensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length >= 6) {
                    var baseSize = parseInt(args[5]);
                    light.setBaseSize(baseSize);
                }
                if (args.length == 8) {
                    var intensityTarget = parseInt(args[6]);
                    var intensityChangeDuration = parseInt(args[7]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_change_intensity':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var intensityTarget = parseInt(args[1]);
                var intensityChangeDuration = parseInt(args[2]);
                $gameMap.getLightingManager().changeLightsIntensity(id, intensityTarget, intensityChangeDuration);
                break;
            case 'lights_change_base_size':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var baseSizeTarget = parseInt(args[1]);
                var baseSizeChangeDuration = parseInt(args[2]);
                $gameMap.getLightingManager().changeLightsBaseSize(id, baseSizeTarget, baseSizeChangeDuration);
                break;
            case 'lights_set_flaring':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var flaringMin = parseInt(args[1]);
                var flaringChangeDuration = parseInt(args[2]);
                var affectsIntensity = (args[3] == 'true');
                $gameMap.getLightingManager().setLightsFlaring(id, flaringMin, flaringChangeDuration, affectsIntensity);
                break;
            case 'lights_stop_flaring':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var stopDuration = parseInt(args[1]);
                $gameMap.getLightingManager().stopLightsFlaring(id, stopDuration);
                break;
            case 'lights_set_rotation':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var rotation = parseInt(args[1]);
                $gameMap.getLightingManager().setLightsRotation(id, rotation);
                break;
            case 'lights_set_rotation_delta':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var rotationDelta = parseInt(args[1]);
                $gameMap.getLightingManager().setLightsRotationDelta(id, rotationDelta);
                break;
            case 'lights_change_shade_intensity':
                var id = null;
                if (args[0] !== 'all') id = parseInt(args[0]);
                var shadeIntensityTarget = parseInt(args[1]);
                var shadeIntensityChangeDuration = parseInt(args[2]);
                $gameMap.getLightingManager().changeLightsShadeIntensity(id, shadeIntensityTarget, shadeIntensityChangeDuration);
                break;
        }
    };
    
})();

/*********************************************
 * Lighting object
 * This will be saved with $gameMap!
 * GLOBAL ACCESS NEEDED
 *********************************************/

function NB_Light() {
    this.initialize.apply(this, arguments);
}
 
Object.defineProperty(NB_Light.prototype, 'id', {
    get: function() {
        return this._id;
    },
    configurable: false
});
 
Object.defineProperty(NB_Light.prototype, 'x', {
    get: function() {
        return this._x;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'y', {
    get: function() {
        return this._y;
    },
    configurable: false
});
 
Object.defineProperty(NB_Light.prototype, 'name', {
    get: function() {
        return this._name;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'shadeName', {
    get: function() {
        return this._shadeName;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'opacity', {
    get: function() {
        if (this._flaringAffectsIntensity) {
            return ((this._intensity * this._flaringState) / 10000) * 255;
        } else {
            return (this._intensity / 100) * 255;
        }
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'shadeOpacity', {
    get: function() {
        return (this._shadeIntensity / 100) * this.opacity;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'scale', {
    get: function() {
        return (this._baseSize * this._flaringState) / 10000;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'rotationInRadian', {
    get: function() {
        return (this._rotation * Math.PI) / 180;
    },
    configurable: false
});

Object.defineProperty(NB_Light.prototype, 'addedToLightMap', {
    get: function() {
        return this._addedToLightMap;
    },
    set: function(flag) {
        this._addedToLightMap = flag;
    },
    configurable: true
});
 
NB_Light.prototype.initialize = function(id, character, x, y, name, intensity, shadeName, shadeIntensity) {
    this._id = id;
    this._character = character;
    this._originX = x;
    this._originY = y;
    this._x = 0;
    this._y = 0;
    this._name = name;
    this._intensity = intensity;
    this._intensityTarget = intensity;
    this._intensityChangeDuration = 0;
    this._baseSize = 100;
    this._baseSizeTarget = 100;
    this._baseSizeChangeDuration = 0;
    this._flaring = false;
    this._flaringMin = 100;
    this._flaringChangeDurationOriginal = 0;
    this._flaringChangeDuration = 0;
    this._flaringShrink = true;
    this._flaringState = 100;
    this._flaringAffectsIntensity = false;
    this._rotation = 0;
    this._rotationDelta = 0;
    this._shadeName = shadeName;
    this._shadeIntensity = shadeIntensity;
    this._shadeIntensityTarget = shadeIntensity;
    this._shadeIntensityChangeDuration = 0;
    this._addedToLightMap = false;
};

NB_Light.prototype.setIntensityTarget = function(value, duration) {
    this._intensityTarget = value;
    this._intensityChangeDuration = duration;
};

NB_Light.prototype.setBaseSize = function(value) {
    this._baseSize = value;
    this._baseSizeTarget = value;
    this._baseSizeChangeDuration = 0;
};

NB_Light.prototype.setBaseSizeTarget = function(value, duration) {
    this._baseSizeTarget = value;
    this._baseSizeChangeDuration = duration;
};

NB_Light.prototype.setFlaring = function(min, duration, affects) {
    this._flaring = true;
    this._flaringMin = min;
    this._flaringChangeDurationOriginal = duration;
    this._flaringChangeDuration = duration;
    this._flaringShrink = true;
    this._flaringAffectsIntensity = affects;
};

NB_Light.prototype.stopFlaring = function(duration) {
    if (this._flaring) {
        this._flaring = false;
        this._flaringMin = 100;
        this._flaringChangeDurationOriginal = 0;
        this._flaringChangeDuration = duration;
        this._flaringShrink = false;
    }
};

NB_Light.prototype.setRotation = function(value) {
    this._rotation = value;
};

NB_Light.prototype.setRotationDelta = function(value) {
    this._rotationDelta = value;
};

NB_Light.prototype.setShadeIntensityTarget = function(shadeIntensityTarget, shadeIntensityChangeDuration) {
    this._shadeIntensityTarget = shadeIntensityTarget;
    this._shadeIntensityChangeDuration = shadeIntensityChangeDuration;
};

NB_Light.prototype._updatePosition = function() {
    if (this._character) {
        this._x = this._character.screenX();
        this._y = this._character.screenY();
    } else {
        this._x = this._originX - $gameMap.getPixelScrollX();
        this._y = this._originY - $gameMap.getPixelScrollY();
    }
};

NB_Light.prototype._updateIntensity = function() {
    if (this._intensityChangeDuration > 0) {
        var d = this._intensityChangeDuration;
        this._intensity = (this._intensity * (d - 1) + this._intensityTarget) / d;
        this._intensityChangeDuration--;
    }
};

NB_Light.prototype._updateBaseSize = function() {
    if (this._baseSizeChangeDuration > 0) {
        var d = this._baseSizeChangeDuration;
        this._baseSize = (this._baseSize * (d - 1) + this._baseSizeTarget) / d;
        this._baseSizeChangeDuration--;
    }
};

NB_Light.prototype._updateFlaring = function() {
    if (this._flaring) {
        if (this._flaringChangeDuration > 0) {
            var d = this._flaringChangeDuration;
            if (this._flaringShrink) {
                this._flaringState = (this._flaringState * (d - 1) + this._flaringMin) / d;
            } else {
                this._flaringState = (this._flaringState * (d - 1) + 100) / d;
            }
            this._flaringChangeDuration--;
        }
        if (this._flaringChangeDuration == 0) {
            this._flaringChangeDuration = this._flaringChangeDurationOriginal;
            this._flaringShrink = !this._flaringShrink;
        }
    } else {
        if (this._flaringChangeDuration > 0) {
            var d = this._flaringChangeDuration;
            this._flaringState = (this._flaringState * (d - 1) + 100) / d;
            this._flaringChangeDuration--;
        }
    }
};

NB_Light.prototype._updateRotation = function() {
    this._rotation += this._rotationDelta;
};

NB_Light.prototype._updateShadeIntensity = function() {
    if (this._shadeIntensityChangeDuration > 0) {
        var d = this._shadeIntensityChangeDuration;
        this._shadeIntensity = (this._shadeIntensity * (d - 1) + this._shadeIntensityTarget) / d;
        this._shadeIntensityChangeDuration--;
    }
};

NB_Light.prototype.update = function() {
    this._updatePosition();
    this._updateIntensity();
    this._updateBaseSize();
    this._updateFlaring();
    this._updateRotation();
    this._updateShadeIntensity();
};
 
/*********************************************
 * Lighting manager object
 * This will be saved with $gameMap!
 * GLOBAL ACCESS NEEDED
 *********************************************/
 
function NB_LightingManager() {
    this.initialize.apply(this, arguments);
}

Object.defineProperty(NB_LightingManager.prototype, 'enabled', {
    get: function() {
        return this._enabled;
    },
    configurable: false
});

Object.defineProperty(NB_LightingManager.prototype, 'lights', {
    get: function() {
        return this._lights;
    },
    configurable: false
});

Object.defineProperty(NB_LightingManager.prototype, 'ambient', {
    get: function() {
        return this._ambient;
    },
    configurable: true
});

NB_LightingManager.prototype.initialize = function() {
    this._enabled = false;
    this._lights = [];
    this._ambient = 100;
    this._ambientTarget = 100;
    this._ambientChangeDuration = 0;
};

NB_LightingManager.prototype.addLight = function(light) {
    this._lights.push(light);
};

NB_LightingManager.prototype.changeLightsIntensity = function(id, intensityTarget, intensityChangeDuration) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setIntensityTarget(intensityTarget, intensityChangeDuration);
        }
    }
};

NB_LightingManager.prototype.changeLightsBaseSize = function(id, baseSizeTarget, baseSizeChangeDuration) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setBaseSizeTarget(baseSizeTarget, baseSizeChangeDuration);
        }
    }
};

NB_LightingManager.prototype.setLightsFlaring = function(id, flaringMin, flaringChangeDuration, affectsIntensity) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setFlaring(flaringMin, flaringChangeDuration, affectsIntensity);
        }
    }
};

NB_LightingManager.prototype.stopLightsFlaring = function(id, stopDuration) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].stopFlaring(stopDuration);
        }
    }
};

NB_LightingManager.prototype.setLightsRotation = function(id, rotation) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setRotation(rotation);
        }
    }
};

NB_LightingManager.prototype.setLightsRotationDelta = function(id, rotationDelta) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setRotationDelta(rotationDelta);
        }
    }
};

NB_LightingManager.prototype.changeLightsShadeIntensity = function(id, shadeIntensityTarget, shadeIntensityChangeDuration) {
    for (var i = 0; i < this._lights.length; i++) {
        if (id === null || this._lights[i].id === id) {
            this._lights[i].setShadeIntensityTarget(shadeIntensityTarget, shadeIntensityChangeDuration);
        }
    }
};

NB_LightingManager.prototype.setAllLightsToNotAdded = function() {
    for (var i = 0; i < this._lights.length; i++) {
        this._lights[i].addedToLightMap = false;
    }
};

NB_LightingManager.prototype.changeAmbient = function(value, duration) {
    this._ambientTarget = value;
    this._ambientChangeDuration = duration;
};

NB_LightingManager.prototype.enable = function() {
    this._enabled = true;
};

NB_LightingManager.prototype.update = function() {
    if (this._enabled) {
        if (this._ambientChangeDuration > 0) {
            var d = this._ambientChangeDuration;
            this._ambient = (this._ambient * (d - 1) + this._ambientTarget) / d;
        }
        for (var i = 0; i < this._lights.length; i++) {
            this._lights[i].update();
        }
    }
};
