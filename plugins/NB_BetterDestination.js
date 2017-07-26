//=============================================================================
// NB_BetterDestination.js
//=============================================================================

/*:
 * @plugindesc Replaces the map destination sprite with a smoother one.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    // Override!
    Sprite_Destination.prototype.createBitmap = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        this.bitmap.drawCircle(tileWidth/2, tileHeight/2, 15,'white');
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };
    
    // Override!
    Sprite_Destination.prototype.updateAnimation = function() {
        this._frameCount++;
        this._frameCount %= 40;
        this.opacity = (40 - this._frameCount) * 2;
        this.scale.x = 1 + this._frameCount / 40;
        this.scale.y = this.scale.x;
    };
    
})();
