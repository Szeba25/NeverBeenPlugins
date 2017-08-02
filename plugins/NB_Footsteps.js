//=============================================================================
// NB_Footsteps.js
//=============================================================================

/*:
 * @plugindesc Adds footstep sounds for the player, based on terrain tags.
 * This plugin builds upon NB_OverlayImages.js!
 * @author Scalytank
 *
 * @param volume
 * @desc Footsteps volume
 * @default 50
 *
 */

(function() {
    
    var parameters = PluginManager.parameters('NB_Footsteps');
    var aliases = {};
    
    var footsteps = [];
    var footstepsCount = 25;
    var generateFootstep = false;
    var generateFootstepGraphics = [];
    
    for (var i = 1; i <= 7; i++) {
        var fts = {};
        fts['name'] = 'FootstepA' + i;
        fts['volume'] = parseInt(parameters['volume']);
        fts['pitch'] = 100;
        fts['pan'] = 0;
        AudioManager.loadStaticSe(fts);
        footsteps.push(fts);
    }
    
    ImageManager.loadFootstep = function(lettertag, filename, hue) {
        return this.loadBitmap('img/footsteps/' + lettertag + '/', filename, hue, true);
    };
    
    aliases.Game_CharacterBase_updatePattern = Game_CharacterBase.prototype.updatePattern;
    Game_CharacterBase.prototype.updatePattern = function() {
        aliases.Game_CharacterBase_updatePattern.call(this);
        if ($gamePlayer === this) {
            var tag = $gameMap.terrainTag(this._x, this._y);
            if (tag > 0 && this._pattern % 2 == 0) {
                AudioManager.playStaticSe(footsteps[tag-1]);
            }
            if (tag > 0) {
                generateFootstep = true;
            }
        }
    };
    
    aliases.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        aliases.Spriteset_Map_createLowerLayer.call(this);
        
        this._footstepsData = [];
        this._footsteps = [];
        for (var i = 0; i < footstepsCount; i++) {
            this._footstepsData[i] = {};
            this._footstepsData[i]['x'] = 0;
            this._footstepsData[i]['y'] = 0;
            this._footstepsData[i]['opacity'] = 0;
            this._footsteps[i] = new Sprite();
            this._footsteps[i].z = 1;
            this._footsteps[i].x = 0;
            this._footsteps[i].y = 0;
            this._footsteps[i].opacity = 0;
            this._footsteps[i].bitmap = null;
            this._tilemap.addChild(this._footsteps[i]);
        }
    };
    
    aliases.Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        
        aliases.Spriteset_Map_update.call(this);
        
        // Generate footsteps
        if (generateFootstep) {
            for (var i = 0; i < footstepsCount; i++) {
                if (this._footstepsData[i].opacity == 0) {
                    this._footstepsData[i].x = Math.floor($gamePlayer._realX * $gameMap.tileWidth());
                    this._footstepsData[i].y = Math.floor($gamePlayer._realY * $gameMap.tileHeight());
                    this._footstepsData[i].opacity = 254;
                    var tag = $gameMap.terrainTag($gamePlayer._x, $gamePlayer._y);
                    
                    if ($gamePlayer.direction() == 6 || $gamePlayer.direction() == 4) {
                        if ($gamePlayer._pattern == 0 || $gamePlayer._pattern == 2) {
                            this._footsteps[i].bitmap = ImageManager.loadFootstep('A/'+tag, 'lr1', 0);
                        } else {
                            this._footsteps[i].bitmap = ImageManager.loadFootstep('A/'+tag, 'lr2', 0);
                        }
                    } else {
                        if ($gamePlayer._pattern == 0 || $gamePlayer._pattern == 2) {
                            this._footsteps[i].bitmap = ImageManager.loadFootstep('A/'+tag, 'ud1', 0);
                        } else {
                            this._footsteps[i].bitmap = ImageManager.loadFootstep('A/'+tag, 'ud2', 0);
                        }
                    }
                    break;
                }
            }
            generateFootstep = false;
        }
        
        // Scroll footsteps
        for (var i = 0; i < footstepsCount; i++) {
            this._footsteps[i].x = this._footstepsData[i].x - $gameMap.getPixelScrollX();
            this._footsteps[i].y = this._footstepsData[i].y - $gameMap.getPixelScrollY();
            if (this._footstepsData[i].opacity > 0) {
                this._footstepsData[i].opacity -= 2;
                this._footsteps[i].opacity = this._footstepsData[i].opacity;
            }
        }
    };
    
})();
