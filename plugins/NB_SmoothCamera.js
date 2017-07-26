//=============================================================================
// NB_SmoothCamera.js
//=============================================================================

/*:
 * @plugindesc Adds interpolation to the camera.
 * @author Scalytank
 * @help Plugin commands:
 *
 * - camera_lookat [x] [y] [limit%]
 *   look at the passed x and y tile coordinates
 *   limit the camera movement by total distance traveled every frame
 *   the origin is at the upper left corner
 *
 * - camera_lookat_event [id] [limit%]
 *   look at the event with the given id
 *   limit the camera movement by total distance traveled every frame
 *
 * - camera_eventlock [id]
 *   lock the camera at the event with the given id
 *
 * - camera_playerlock
 *   lock the camera at the player (default)
 *
 * - camera_alpha [alpha]
 *   set the following speed of the camera
 *   0-1 where 1 is the fastest!
 *
 * - camera_alpha_reset
 *   reset the following speed of the camera to the defaul value
 */

(function() {
    
    var aliases = {};
    
    var CAMERA_LIMIT = 99;
    
    function NB_Camera() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Camera.prototype.initialize = function() {
        this._playerLock = true;
        this._eventLock = null;
        this._x = 0;
        this._y = 0;
        this._targetX = 0;
        this._targetY = 0;
        this._limitX = CAMERA_LIMIT;
        this._limitY = CAMERA_LIMIT;
        this._alpha = 0.1;
    };
    
    NB_Camera.prototype.setPosition = function(x, y) {
        this.setTarget(x, y);
        this._x = this._targetX;
        this._y = this._targetY;
        $gameMap.setDisplayPos(this._x, this._y);
    };
    
    NB_Camera.prototype.setPositionToEvent = function(event) {
        this.setPosition(event._realX - 13, event._realY - 7);
    };
    
    NB_Camera.prototype.setTarget = function(x, y) {
        var maxX = $gameMap.width() - 27;
        var maxY = $gameMap.height() - 15;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;
        this._targetX = x;
        this._targetY = y;
    };
    
    NB_Camera.prototype.setTargetToEvent = function(event) {
        if (event != null) {
            this.setTarget(event._realX - 13, event._realY - 7);
        } else {
            this.setTarget(0, 0);
        }
    };
    
    NB_Camera.prototype.lockToEvent = function(event) {
        if (event != null) {
            this._playerLock = false;
            this._eventLock = event;
        } else {
            console.log('camera: lock to null event error!');
        }
        
    };
    
    NB_Camera.prototype.lockToPlayer = function() {
        this._playerLock = true;
        this._eventLock = null;
    };
    
    NB_Camera.prototype.prepareForLookAt = function(limit) {
        this._playerLock = false;
        this._eventLock = null;
        var distX = Math.abs(this._targetX - this._x);
        var distY = Math.abs(this._targetY - this._y);
        this._limitX = distX * limit;
        this._limitY = distY * limit;
    };
    
    NB_Camera.prototype.alpha = function() {
        return this._alpha;
    };
    
    NB_Camera.prototype.setAlpha = function(alpha) {
        this._alpha = alpha;
    };
    
    NB_Camera.prototype.resetAlpha = function() {
        this._alpha = 0.1;
    }
    
    NB_Camera.prototype.resetLimits = function() {
        this._limitX = CAMERA_LIMIT;
        this._limitY = CAMERA_LIMIT;
    };
    
    NB_Camera.prototype.decideTarget = function() {
        if (!this._playerLock) {
            if (this._eventLock != null) {
                this.setTargetToEvent(this._eventLock);
            }
        } else {
            this.setTargetToEvent($gamePlayer);
            this.resetLimits();
        }
    };
    
    NB_Camera.prototype.lerpToTarget = function(displayX, displayY) {
        
        var newX = displayX;
        var newY = displayY;
        
        if (this._targetX < displayX) {
            var distance = Math.abs(this._targetX - displayX) * this._alpha;
            newX = displayX - Math.min(distance, this._limitX);
        } else if (this._targetX > displayX) {
            var distance = Math.abs(this._targetX - displayX) * this._alpha;
            newX = displayX + Math.min(distance, this._limitX);
        }
        
        if (this._targetY < displayY) {
            var distance = Math.abs(this._targetY - displayY) * this._alpha;
            newY = displayY - Math.min(distance, this._limitY);
        } else if (this._targetY > displayY) {
            var distance = Math.abs(this._targetY - displayY) * this._alpha;
            newY = displayY + Math.min(distance, this._limitY);
        }
        
        this._x = newX;
        this._y = newY;
        
        $gameMap.setDisplayPos(this._x, this._y);
        
    };
    
    // Create the shared camera instance!!!
    var camera = new NB_Camera();
    
    Game_Map.prototype.getPixelScrollX = function() {
        return Math.floor(this.displayX() * this.tileWidth());
    };
    
    Game_Map.prototype.getPixelScrollY = function() {
        return Math.floor(this.displayY() * this.tileHeight());
    };
    
    aliases.Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        aliases.Game_Map_update.call(this, sceneActive);
        // Apply linear interpolation to the camera
        camera.decideTarget();
        camera.lerpToTarget(this._displayX, this._displayY);
    };
    
    // Override!
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        // This function is disabled!
    };
    
    // Override!
    Game_Player.prototype.center = function(x, y) {
        camera.setPosition(x - 13, y - 7);
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
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        switch (command) {
            case 'camera_lookat':
                camera.setTarget(parseInt(args[0]), parseInt(args[1]));
                camera.prepareForLookAt(parseFloat(args[2]) / 100);
                break;
            case 'camera_lookat_event':
                camera.setTargetToEvent($gameMap.event(parseInt(args[0])));
                camera.prepareForLookAt(parseFloat(args[1]) / 100);
                break;
            case 'camera_eventlock':
                camera.lockToEvent($gameMap.event(parseInt(args[0])));
                break;
            case 'camera_playerlock':
                camera.lockToPlayer();
                break;
            case 'camera_alpha':
                camera.setAlpha(parseFloat(args[0]));
                break;
            case 'camera_alpha_reset':
                camera.resetAlpha();
                break;
        }
    };
    
})();
