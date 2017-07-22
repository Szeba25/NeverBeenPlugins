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
    
    Game_Map.prototype.setDisplayTarget = function(x, y) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > this.width() - 27) x = this.width() - 27;
        if (y > this.height() - 15) y = this.height() - 15;
        this._displayTargetX = x;
        this._displayTargetY = y;
    };
    
    Game_Map.prototype.getPixelScrollX = function() {
        return Math.floor(this.displayX() * this.tileWidth());
    };
    
    Game_Map.prototype.getPixelScrollY = function() {
        return Math.floor(this.displayY() * this.tileHeight());
    };
    
    aliases.Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        aliases.Game_Map_initialize.call(this);
        this._displayTargetX = 0;
        this._displayTargetY = 0;
    };
    
    aliases.Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        aliases.Game_Map_setup.call(this, mapId);
        this._displayTargetX = 0;
        this._displayTargetY = 0;
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
            newX -= distance;
        }
        
        if (this._displayTargetX > this._displayX) {
            var distance = Math.abs(this._displayTargetX - this._displayX) * cameraAlpha;
            newX += distance;
        }
        
        if (this._displayTargetY < this._displayY) {
            var distance = Math.abs(this._displayTargetY - this._displayY) * cameraAlpha;
            newY -= distance;
        }
        
        if (this._displayTargetY > this._displayY) {
            var distance = Math.abs(this._displayTargetY - this._displayY) * cameraAlpha;
            newY += distance;
        }
        
        this.setDisplayPos(newX, newY);
        //console.log('display: ' + this._displayX + '/' + this._displayY);
        
        this._fogX = this._displayX;
        this._fogY = this._displayY;
    };
    
    // Override!
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        if (cameraLocked) {
            $gameMap.setDisplayTarget(this._realX - 13, this._realY - 7);
            //console.log('player: ' + this.screenX() + '/' + this.screenY());
        }
    };
    
    // Override!
    Game_CharacterBase.prototype.screenX = function() {
        var tw = $gameMap.tileWidth();
        var px = this._realX * tw - $gameMap.getPixelScrollX();
        return Math.floor(px + tw/2);
    };
    
    // Override!
    Game_CharacterBase.prototype.screenY = function() {
        var th = $gameMap.tileHeight();
        var py = this._realY * th - $gameMap.getPixelScrollY();
        return Math.floor(py + th - this.shiftY() - this.jumpHeight());
    };
    
    // Override!
    TilingSprite.prototype.updateTransform = function() {
        this.tilePosition.x = Math.ceil(-this.origin.x);
        this.tilePosition.y = Math.ceil(-this.origin.y);
        this.updateTransformTS();
    };
    
    // Override!
    Spriteset_Map.prototype.updateTilemap = function() {
        this._tilemap.origin.x = $gameMap.getPixelScrollX();
        this._tilemap.origin.y = $gameMap.getPixelScrollY();
        //console.log('tilemap: ' + this._tilemap.origin.x + '/' + this._tilemap.origin.y);
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
        } else if (command == 'camera_alpha_reset') {
            cameraAlpha = 0.12;
        }
    };
    
})();
