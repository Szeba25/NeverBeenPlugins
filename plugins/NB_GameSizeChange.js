//=============================================================================
// NB_GameSizeChange.js
//=============================================================================

/*:
 * @plugindesc Resolution and tile size changer.
 * @author Yanfly / Shaz / Scalytank
 *
 * Based on Yanfly's core engine, and Shaz's ChangeTileSize plugin.
 *
 * - Resolution change to 1080*600
 * - Tile size change to 40*40
 */
 
(function() {
    
    var aliases = {};
    
    /*
     * Resolution change
     */
    
    customWidth = 1080;
    customHeight = 600;
    
    SceneManager._screenWidth  = customWidth;
    SceneManager._screenHeight = customHeight;
    SceneManager._boxWidth     = customWidth;
    SceneManager._boxHeight    = customHeight;
    
    aliases.SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        aliases.SceneManager_run.call(this, sceneClass);
        updateResolution();
    };
    
    function updateResolution() {
        var resizeWidth = customWidth - window.innerWidth;
        var resizeHeight = customHeight - window.innerHeight;
        window.moveBy(-1 * resizeWidth / 2, -1 * resizeHeight / 2);
        window.resizeBy(resizeWidth, resizeHeight);
    };
    
    /*
     * Tile size change
     */
    
    tileSize = 40;
    tilesetFolder = 'img/tilesets 40x/';
    parallaxFolder = 'img/parallaxes 40x/';
    
    ImageManager.loadTileset = function(filename, hue) {
        return this.loadBitmap(tilesetFolder, filename, hue, false);
    };
    
    ImageManager.loadParallax = function(filename, hue) {
        return this.loadBitmap(parallaxFolder, filename, hue, true);
    };
    
    Game_Map.prototype.tileWidth = function() {
        return tileSize;
    };

    Game_Map.prototype.tileHeight = function() {
        return tileSize;
    };

    Game_Vehicle.prototype.maxAltitude = function() {
        return tileSize;
    };
    
})();
