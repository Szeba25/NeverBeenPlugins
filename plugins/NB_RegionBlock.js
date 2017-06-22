//=============================================================================
// NB_RegionBlock.js
//=============================================================================

/*:
 * @plugindesc Block movement for the player and events at region id 1.
 * @author Yanfly / Scalytank
 *
 * Based on Yanfly's region restrictions plugin.
 * All credits go to Yanlfy, as I just stripped down this plugin to perform
 * exactly what I need, and only that.
 */

(function() {
    
    var aliases = {};
    
    aliases.Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
    Game_CharacterBase.prototype.isMapPassable = function(x, y, d) {
        if (this.isRegionForbid(x, y, d)) {
            return false;
        } else {
            return aliases.Game_CharacterBase_isMapPassable.call(this, x, y, d);
        }
    };
    
    Game_CharacterBase.prototype.isRegionForbid = function(x, y, d) {
        if (this.isThrough()) return false;
        var regionId = this.getRegionId(x, y, d);
        return (regionId === 1);
    };
    
    Game_CharacterBase.prototype.getRegionId = function(x, y, d) {
        switch (d) {
        case 1:
            return $gameMap.regionId(x - 1, y + 1);
            break;
        case 2:
            return $gameMap.regionId(x + 0, y + 1);
            break;
        case 3:
            return $gameMap.regionId(x + 1, y + 1);
            break;
        case 4:
            return $gameMap.regionId(x - 1, y + 0);
            break;
        case 5:
            return $gameMap.regionId(x + 0, y + 0);
            break;
        case 6:
            return $gameMap.regionId(x + 1, y + 0);
            break;
        case 7:
            return $gameMap.regionId(x - 1, y - 1);
            break;
        case 8:
            return $gameMap.regionId(x + 0, y - 1);
            break;
        case 9:
            return $gameMap.regionId(x + 1, y - 1);
            break;
        default:
            return $gameMap.regionId(x, y);
            break;
        }
    };
    
})();
