//=============================================================================
// NB_StarPassability.js
//=============================================================================

/*:
 * @plugindesc Allows star tiles to use 4 dir settings.
 * @author Neon Black / Scalytank
 */

(function() {
    
    Game_Map.prototype.checkPassage = function(x, y, bit) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            if ((flag & 0x10) !== 0) {    // [*] No effect on passage
                if ((flag & bit) === 0)
                    continue;
                if ((flag & bit) === bit)
                    return false;
            } else {
                if ((flag & bit) === 0)   // [o] Passable
                    return true;
                if ((flag & bit) === bit) // [x] Impassable
                    return false;
            }
        }
        return false;
    };
    
})();
