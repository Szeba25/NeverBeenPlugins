//=============================================================================
// NB_OverlayImages.js
//=============================================================================

/*:
 * @plugindesc Custom image overlay plugin.
 * @author Scalytank
 *
 * This plugin's structure is based on Sasuke Kannazuki's foreground plugin.
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
        this._fogX = 0;
        this._fogY = 0;
    };
    
    Game_Map.prototype.setupParallaxMapTop = function() {
        this._parallaxMapTopName = $dataMap.meta.parTop || '';
    };
    
    Game_Map.prototype.setupFog = function() {
        this._fogName = $dataMap.meta.fog || '';
        this._fogX = 0;
        this._fogY = 0;
    };
    
    /*
     * Displaying the fog.
     */
    
    aliases.Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        aliases.Game_Map_setDisplayPos.call(this, x, y);
        this._fogX = this._displayX;
        this._fogY = this._displayY;
    };
    
    Game_Map.prototype.fogOx = function() {
        return Math.ceil(this._fogX * this.tileWidth());
    };
    
    Game_Map.prototype.fogOy = function() {
        return Math.ceil(this._fogY * this.tileHeight());
    };
    
    /*
     * Scrolling the fog.
     */
    
    aliases.Game_Map_scrollUp = Game_Map.prototype.scrollUp;
    Game_Map.prototype.scrollUp = function(distance) {
        var lastY = this._displayY;
        aliases.Game_Map_scrollUp.call(this, distance);
        
        if (this.height() >= this.screenTileY()) {
            var displayY = Math.max(lastY - distance, 0);
            this._fogY += displayY - lastY;
        }
    };
    
    aliases.Game_Map_scrollDown = Game_Map.prototype.scrollDown;
    Game_Map.prototype.scrollDown = function(distance) {
        var lastY = this._displayY;
        aliases.Game_Map_scrollDown.call(this, distance);
        
        if (this.height() >= this.screenTileY()) {
            var displayY = Math.min(lastY + distance, this.height() - this.screenTileY());
            this._fogY += displayY - lastY;
        }
    };
    
    aliases.Game_Map_scrollLeft = Game_Map.prototype.scrollLeft;
    Game_Map.prototype.scrollLeft = function(distance) {
        var lastX = this._displayX;
        aliases.Game_Map_scrollLeft.call(this, distance);
        
        if (this.width() >= this.screenTileX()) {
            var displayX = Math.max(lastX - distance, 0);
            this._fogX += displayX - lastX;
        }
    };
    
    aliases.Game_Map_scrollRight = Game_Map.prototype.scrollRight;
    Game_Map.prototype.scrollRight = function(distance) {
        var lastX = this._displayX;
        aliases.Game_Map_scrollRight.call(this, distance);
        
        if (this.width() >= this.screenTileX()) {
            var displayX = Math.min(lastX + distance, this.width() - this.screenTileX());
            this._fogX += displayX - lastX;
        }
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
            this._parallaxMapTop.x = Math.ceil(-1*$gameMap.displayX()*$gameMap.tileWidth());
            this._parallaxMapTop.y = Math.ceil(-1*$gameMap.displayY()*$gameMap.tileHeight());
        }
        
        if (this._fog.bitmap) {
            this._fog.origin.x = $gameMap.fogOx();
            this._fog.origin.y = $gameMap.fogOy();
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
            this.x -= Math.ceil($gameMap.displayX()*$gameMap.tileWidth());
            this.y -= Math.ceil($gameMap.displayY()*$gameMap.tileHeight());
        }
    };
    
})();
