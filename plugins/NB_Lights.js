//=============================================================================
// NB_Lights.js
//=============================================================================

/*:
 * @plugindesc Adds a fast lighting layer.
 * @author Khas / Scalytank
 * @help All credit goes to Khas, this plugin is based on his Advanced Lighting.
 *
 * DEPENDENCY:
 * > NB_SmoothCamera.js
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
     * Load the shared lightingData on startup
     *********************************************/
    
    var lightingData = {};
    lightingData.lightMapTexture = null;
    lightingData.filter = null;
    
    SceneManager._loadLightingData = function() {
        lightingData.lightMapTexture = new PIXI.RenderTexture.create(Graphics.width, Graphics.height);
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
        this.x = this._lightData.x;
        this.y = this._lightData.y;
        this.opacity = this._lightData.intensity;
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
        this._layerSprite = new NB_Sprite(lightingData.lightMapTexture);
        this._layerSprite.setFilter(lightingData.filter);
    };
    
    NB_LightMap.prototype._addNewLights = function() {
        var currentLights = this._manager.lights;
        for (var i = 0; i < currentLights.length; i++) {
            var light = currentLights[i];
            if (!light.addedToLightMap) {
                var sprite = new NB_LightSprite(light);
                this._layer.addChild(sprite);
                light.addedToLightMap = true;
            }
        }
    };
    
    NB_LightMap.prototype._updateLights = function() {
        var allSprites = this._layer.children;
        for (var i = 0; i < allSprites.length; i++) {
            allSprites[i].sync();
        }
    };
    
    NB_LightMap.prototype.update = function() {
        lightingData.filter.setAmbientLight(this._manager.ambient);
        this._addNewLights();
        this._updateLights();
        Graphics._renderer.render(this._layer, lightingData.lightMapTexture);
    };
    
    NB_LightMap.prototype.layerSprite = function() {
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
        this._baseSprite.addChild(this._lighting.layerSprite());
        
        console.log('Spriteset_Map created');
    };
    
    aliases.Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        aliases.Spriteset_Map_update.call(this);
        this._lighting.update();
    };
    
    aliases.Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        aliases.Game_Map_setup.call(this, mapId);
        this._lightingManager = new NB_LightingManager();
        console.log('Game_Map setup: ' + mapId);
    };
    
    aliases.Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        aliases.Game_Map_update.call(this, sceneActive);
        this._lightingManager.update();
    }
    
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
            this._scene._spriteset._lighting._layerSprite.visible = false;
            console.log('Escaped from Scene_Map!');
        }
        return aliases.SceneManager_static_snap.call(this);
    };
    
    // Override!
    SceneManager.snapForBackground = function() {
        this._backgroundBitmap = this.snap();
    };
    
    SceneManager.getLightAsSprite = function() {
        var sprite = new NB_Sprite(lightingData.lightMapTexture);
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
            case 'lights_set_ambient':
                $gameMap.getLightingManager().changeAmbient(parseInt(args[0]), parseInt(args[1]));
                break;
            case 'lights_add_to_map':
                var id = parseInt(args[0]);
                var x = parseInt(args[1]);
                var y = parseInt(args[2]);
                var name = args[3];
                var intensity = parseInt(args[4]);
                var light = new NB_Light(id, null, x, y, name, intensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length == 7) {
                    var intensityTarget = parseInt(args[5]);
                    var intensityChangeDuration = parseInt(args[6]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_add_to_event':
                var id = parseInt(args[0]);
                var event = $gameMap.event(parseInt(args[1]));
                var name = args[2];
                var intensity = parseInt(args[3]);
                var light = new NB_Light(id, event, 0, 0, name, intensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length == 6) {
                    var intensityTarget = parseInt(args[4]);
                    var intensityChangeDuration = parseInt(args[5]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_add_to_player':
                var id = parseInt(args[0]);
                var name = args[1];
                var intensity = args[2];
                var light = new NB_Light(id, $gamePlayer, 0, 0, name, intensity);
                $gameMap.getLightingManager().addLight(light);
                if (args.length == 5) {
                    var intensityTarget = parseInt(args[3]);
                    var intensityChangeDuration = parseInt(args[4]);
                    light.setIntensityTarget(intensityTarget, intensityChangeDuration);
                }
                break;
            case 'lights_change':
                var id = parseInt(args[0]);
                var intensityTarget = parseInt(args[1]);
                var intensityChangeDuration = parseInt(args[2]);
                $gameMap.getLightingManager().changeLight(id, intensityTarget, intensityChangeDuration);
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

Object.defineProperty(NB_Light.prototype, 'intensity', {
    get: function() {
        return this._intensity;
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
 
NB_Light.prototype.initialize = function(id, character, x, y, name, intensity) {
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
    this._addedToLightMap = false;
};

NB_Light.prototype.setIntensityTarget = function(value, duration) {
    this._intensityTarget = value;
    this._intensityChangeDuration = duration;
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
    }
};

NB_Light.prototype.update = function() {
    this._updatePosition();
    this._updateIntensity();
};
 
/*********************************************
 * Lighting manager object
 * This will be saved with $gameMap!
 * GLOBAL ACCESS NEEDED
 *********************************************/
 
function NB_LightingManager() {
    this.initialize.apply(this, arguments);
}

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
    this._lights = [];
    this._ambient = 100;
    this._ambientTarget = 100;
    this._ambientChangeDuration = 0;
};

NB_LightingManager.prototype.addLight = function(light) {
    this._lights.push(light);
};

NB_LightingManager.prototype.changeLight = function(id, intensityTarget, intensityChangeDuration) {
    for (var i = 0; i < this._lights.length; i++) {
        if (this._lights[i].id === id) {
            this._lights[i].setIntensityTarget(intensityTarget, intensityChangeDuration);
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

NB_LightingManager.prototype.update = function() {
    if (this._ambientChangeDuration > 0) {
        var d = this._ambientChangeDuration;
        this._ambient = (this._ambient * (d - 1) + this._ambientTarget) / d;
    }
    for (var i = 0; i < this._lights.length; i++) {
        this._lights[i].update();
    }
};
