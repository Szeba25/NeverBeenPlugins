//=============================================================================
// NB_SmoothCamera.js
//=============================================================================

/*:
 * @plugindesc Adds interpolation to the camera.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
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
        this._displayTargetX = this._displayX;
        this._displayTargetY = this._displayY;
    };
    
    aliases.Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        aliases.Game_Map_update.call(this, sceneActive);
        
        var newX = this._displayX;
        var newY = this._displayY;
        
        if (this._displayTargetX < this._displayX) {
            newX -= Math.abs(this._displayTargetX - this._displayX) * this._cameraAlpha;
        }
        
        if (this._displayTargetX > this._displayX) {
            newX += Math.abs(this._displayTargetX - this._displayX) * this._cameraAlpha;
        }
        
        if (this._displayTargetY < this._displayY) {
            newY -= Math.abs(this._displayTargetY - this._displayY) * this._cameraAlpha;
        }
        
        if (this._displayTargetY > this._displayY) {
            newY += Math.abs(this._displayTargetY - this._displayY) * this._cameraAlpha;
        }
        
        this.setDisplayPos(newX, newY);
        
        this._fogX = this._displayX;
        this._fogY = this._displayY;
    };
    
    // Override!
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        $gameMap.setDisplayTarget(this._realX - 13.5, this._realY - 7.5);
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
    
})();
