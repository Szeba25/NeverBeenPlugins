//=============================================================================
// NB_OverlayImages.js
//=============================================================================

/*:
 * @plugindesc Custom image overlay plugin.
 * @author Scalytank
 *
 * @help This plugin's structure is based on Sasuke Kannazuki's foreground plugin.
 * DEPENDENCY:
 * > NB_SmoothCamera.js
 */

(function() {
    
    var aliases = {};
    
    /*
     * New ImageManager functions.
     */
    
    ImageManager.loadParallaxMapTop = function(filename, hue) {
        return this.loadBitmap('img/parallax maps/', filename, hue, true);
    };
    
    ImageManager.loadFog = function(filename, hue) {
        return this.loadBitmap('img/fogs/', filename, hue, true);  
    };
    
    /*
     * Initialize and setup!
     */
    
    aliases.Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        aliases.Game_Map_initialize.call(this);
        this.initParallaxMapTop();
        this.initFog();
    };
    
    aliases.Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        aliases.Game_Map_setup.call(this, mapId);
        this.setupParallaxMapTop();
        this.setupFog();
    };
    
    Game_Map.prototype.initParallaxMapTop = function() {
        this._parallaxMapTopName = '';
    };
    
    Game_Map.prototype.initFog = function() {
        this._fogName = '';
    };
    
    Game_Map.prototype.setupParallaxMapTop = function() {
        this._parallaxMapTopName = $dataMap.meta.parTop || '';
    };
    
    Game_Map.prototype.setupFog = function() {
        this._fogName = $dataMap.meta.fog || '';
    };
    
    /*
     * Add them to spriteset map!
     */
    
    aliases.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        aliases.Spriteset_Map_createLowerLayer.call(this);
        
        this._parallaxMapTop = new Sprite();
        this._baseSprite.removeChild(this._weather);
        this._baseSprite.addChild(this._parallaxMapTop);
        this._baseSprite.addChild(this._weather);
    };
    
    Spriteset_Map.prototype.createUpperLayer = function() {
        Spriteset_Base.prototype.createUpperLayer.call(this);
        
        this._fog = new TilingSprite();
        this._fog.move(0, 0, Graphics.width, Graphics.height);
        this._pictureContainer.addChildAt(this._fog, 30);
    };
    
    aliases.Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        aliases.Spriteset_Map_update.call(this);
        
        if ($gameMap._parallaxMapTopName != '' && !this._parallaxMapTop.bitmap) {
            this._parallaxMapTop.bitmap = ImageManager.loadParallaxMapTop($gameMap._parallaxMapTopName, 0);
            this._parallaxMapTop.x = 0;
            this._parallaxMapTop.y = 0;
            console.log('Top set: ' + $gameMap._parallaxMapTopName);
        }
        
        if ($gameMap._fogName != '' && !this._fog.bitmap) {
            this._fog.bitmap = ImageManager.loadFog($gameMap._fogName, 0);
            console.log('Fog set: ' + $gameMap._fogName);
        }
        
        if (this._parallaxMapTop.bitmap) {
            this._parallaxMapTop.x = -1 * $gameMap.getPixelScrollX();
            this._parallaxMapTop.y = -1 * $gameMap.getPixelScrollY();
        }
        
        if (this._fog.bitmap) {
            this._fog.origin.x = $gameMap.getPixelScrollX();
            this._fog.origin.y = $gameMap.getPixelScrollY();
        }
    };
    
    /*
     * Fixed images
     */
    
    aliases.Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
    Sprite_Picture.prototype.updatePosition = function() {
        aliases.Sprite_Picture_updatePosition.call(this);
        
        // Fix the picture to the map if it's name starts with the dollar sign
        if (this.picture().name().charAt(0) == '$') {
            this.x -= $gameMap.getPixelScrollX();
            this.y -= $gameMap.getPixelScrollY();
        }
    };
    
})();
