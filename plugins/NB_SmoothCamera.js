//=============================================================================
// NB_SmoothCamera.js
//=============================================================================

/*:
 * @plugindesc Adds interpolation to the camera.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    var cameraLocked = true;
    var cameraTargetX = 0;
    var cameraTargetY = 0;
    var cameraAlpha = 0.12;
    var cameraDistLimit = 999;
    
    Game_Map.prototype.setDisplayTarget = function(x, y) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > this.width() - 27) x = this.width() - 27;
        if (y > this.height() - 15) y = this.height() - 15;
        this._displayTargetX = x;
        this._displayTargetY = y;
    };
    
    aliases.Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        aliases.Game_Map_initialize.call(this);
        this._displayTargetX = 0;
        this._displayTargetY = 0;
        this._cameraAlpha = 0.1;
    };
    
    aliases.Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        aliases.Game_Map_setup.call(this, mapId);
        this._displayTargetX = 0;
        this._displayTargetY = 0;
    };
    
    aliases.Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        aliases.Game_Map_setDisplayPos.call(this, x, y);
    };
    
    aliases.Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        aliases.Game_Map_update.call(this, sceneActive);
        
        if (!cameraLocked) {
            this.setDisplayTarget(cameraTargetX, cameraTargetY);
        }
        
        var newX = this._displayX;
        var newY = this._displayY;
        
        if (this._displayTargetX < this._displayX) {
            var distance = Math.abs(this._displayTargetX - this._displayX) * cameraAlpha;
            newX -= Math.min(distance, cameraDistLimit);
        }
        
        if (this._displayTargetX > this._displayX) {
            var distance = Math.abs(this._displayTargetX - this._displayX) * cameraAlpha;
            newX += Math.min(distance, cameraDistLimit);
        }
        
        if (this._displayTargetY < this._displayY) {
            var distance = Math.abs(this._displayTargetY - this._displayY) * cameraAlpha;
            newY -= Math.min(distance, cameraDistLimit);
        }
        
        if (this._displayTargetY > this._displayY) {
            var distance = Math.abs(this._displayTargetY - this._displayY) * cameraAlpha;
            newY += Math.min(distance, cameraDistLimit);
        }
        
        this.setDisplayPos(newX, newY);
        
        this._fogX = this._displayX;
        this._fogY = this._displayY;
    };
    
    // Override!
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        if (cameraLocked) {
            $gameMap.setDisplayTarget(this._realX - 13, this._realY - 7);
        }
    };
    
    // Override!
    Game_CharacterBase.prototype.screenX = function() {
        var tw = $gameMap.tileWidth();
        return Math.floor(this.scrolledX() * tw + tw / 2);
    };
    
    // Override!
    Game_CharacterBase.prototype.screenY = function() {
        var th = $gameMap.tileHeight();
        return Math.floor(this.scrolledY() * th + th -
                          this.shiftY() - this.jumpHeight());
    };
    
    // Override!
    Game_CharacterBase.prototype.scrolledX = function() {
        return this._realX - $gameMap.displayX();
    };

    // Override!
    Game_CharacterBase.prototype.scrolledY = function() {
        return this._realY - $gameMap.displayY();
    };
    
    // Override!
    Spriteset_Base.prototype.updatePosition = function() {
        var screen = $gameScreen;
        var scale = screen.zoomScale();
        this.scale.x = scale;
        this.scale.y = scale;
        this.x = Math.floor(-screen.zoomX() * (scale - 1));
        this.y = Math.floor(-screen.zoomY() * (scale - 1));
        this.x += Math.floor(screen.shake());
    };
    
    // Override!
    Sprite_Damage.prototype.updateChild = function(sprite) {
        sprite.dy += 0.5;
        sprite.ry += sprite.dy;
        if (sprite.ry >= 0) {
            sprite.ry = 0;
            sprite.dy *= -0.6;
        }
        sprite.y = Math.floor(sprite.ry);
        sprite.setBlendColor(this._flashColor);
    };
    
    // Override!
    TilingSprite.prototype.updateTransform = function() {
        this.tilePosition.x = Math.ceil(-this.origin.x);
        this.tilePosition.y = Math.ceil(-this.origin.y);
        this.updateTransformTS();
    };
    
    // Override!
    Spriteset_Map.prototype.updateTilemap = function() {
        this._tilemap.origin.x = Math.ceil($gameMap.displayX() * $gameMap.tileWidth());
        this._tilemap.origin.y = Math.ceil($gameMap.displayY() * $gameMap.tileHeight());
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'camera_lookat') {
            cameraLocked = false;
            cameraTargetX = parseInt(args[0]);
            cameraTargetY = parseInt(args[1]);
        } else if (command == 'camera_lock') {
            cameraLocked = true;
        } else if (command == 'camera_alpha') {
            cameraAlpha = parseFloat(args[0]);
        } else if (command == 'camera_distlimit') {
            cameraDistLimit = parseFloat(args[0]);
        } else if (command == 'camera_alpha_reset') {
            cameraAlpha = 0.12;
        } else if (command == 'camera_distlimit_reset') {
            cameraDistLimit = 999;
        }
    };
    
})();
