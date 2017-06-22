//=============================================================================
// NB_ShowChoices.js
//=============================================================================

/*:
 * @plugindesc Changes the show choices dialogue to have a simple cursor.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    // Override!
    Window_ChoiceList.prototype.updatePlacement = function() {
        var positionType = $gameMessage.choicePositionType();
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        if (positionType == 1) {
            this.x = 380;
            this.y = 235;
        } else {
            this.x = 430;
            this.y = 265;
        }
    };
    
    // Override!
    Window.prototype._refreshCursor = function() {
        var pad = this._padding;
        var x = this._cursorRect.x + pad - this.origin.x;
        var y = this._cursorRect.y + pad - this.origin.y;
        var x2 = Math.max(x, pad);
        var y2 = Math.max(y, pad);
        var bitmap = ImageManager.loadBitmap('img/system/', 'cursor', 0, false);
        
        this._windowCursorSprite.bitmap = bitmap;
        this._windowCursorSprite.setFrame(0, 0, 35, 25);
        this._windowCursorSprite.move(x2-30, y2+5);
    };
    
    // Override!
    Window.prototype._updateCursor = function() {
        // If we actually have a cursor, show it...
        if (this._cursorRect.width > 0 && this._cursorRect.height > 0) {
            this._windowCursorSprite.alpha = this.contentsOpacity / 255;
            this._windowCursorSprite.visible = this.isOpen() && this.active;
        } else {
            this._windowCursorSprite.visible = false;
        }
    };
    
})();
