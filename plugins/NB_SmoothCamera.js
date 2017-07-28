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
    
    /**********************************************************************
     * Game_Map additions
     **********************************************************************/
    
    Game_Map.prototype.getPixelScrollX = function() {
        return Math.floor(this.displayX() * this.tileWidth());
    };
    
    Game_Map.prototype.getPixelScrollY = function() {
        return Math.floor(this.displayY() * this.tileHeight());
    };
    
    Game_Map.prototype.setDisplayPosAndScrollParallax = function(x, y) {
        // Save old parallax positions
        var px = this._parallaxX;
        var py = this._parallaxY;
        var oldDisplayX = this._displayX;
        var oldDisplayY = this._displayY;
        // Run the original command
        this.setDisplayPos(x, y);
        // Substract delta from old parallax positions
        var displayDeltaX = oldDisplayX - this._displayX;
        var displayDeltaY = oldDisplayY - this._displayY;
        if (this._parallaxLoopX) this._parallaxX = px - displayDeltaX;
        if (this._parallaxLoopY) this._parallaxY = py - displayDeltaY;
    };
    
    Game_Map.prototype.getSmoothCamera = function() {
        return this._smoothCamera;
    };
    
    aliases.Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        aliases.Game_Map_initialize.call(this);
        // Create the camera
        this._smoothCamera = new NB_Camera();
    };
    
    aliases.Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        aliases.Game_Map_update.call(this, sceneActive);
        // Apply linear interpolation to the camera
        this._smoothCamera.decideTarget();
        this._smoothCamera.lerpToTarget(this._displayX, this._displayY);
    };
    
    /**********************************************************************
     * Disabled functions:
     * We use our own scrolling methods, no need for the default ones
     **********************************************************************/
    
    // Override!
    Game_Map.prototype.scrollDown = function(distance) {
        // This function is disabled!
    };
    
    // Override!
    Game_Map.prototype.scrollLeft = function(distance) {
        // This function is disabled!
    };
    
    // Override!
    Game_Map.prototype.scrollRight = function(distance) {
        // This function is disabled!
    };
    
    // Override!
    Game_Map.prototype.scrollUp = function(distance) {
        // This function is disabled!
    };
    
    // Override!
    Game_Map.prototype.updateScroll = function() {
        // This function is disabled!
    };
    
    // Override!
    Game_Map.prototype.startScroll = function(direction, distance, speed) {
        // This function is disabled!
    };
    
    // Override!
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        // This function is disabled!
    };
    
    /**********************************************************************
     * Default overrides:
     * The following functions are overridden!
     * Mainly for camera positioning, and eliminating rounding errors
     **********************************************************************/
    
    // Override!
    Game_Player.prototype.center = function(x, y) {
        $gameMap.getSmoothCamera().setPosition(x - 13, y - 7);
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
    
    /**********************************************************************
     * Plugin commands
     **********************************************************************/
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        switch (command) {
            case 'camera_lookat':
                $gameMap.getSmoothCamera().setTarget(parseInt(args[0]), parseInt(args[1]));
                $gameMap.getSmoothCamera().prepareForLookAt(parseFloat(args[2]) / 100);
                break;
            case 'camera_lookat_event':
                $gameMap.getSmoothCamera().setTargetById(parseInt(args[0]));
                $gameMap.getSmoothCamera().prepareForLookAt(parseFloat(args[1]) / 100);
                break;
            case 'camera_eventlock':
                $gameMap.getSmoothCamera().lockToEvent(parseInt(args[0]));
                break;
            case 'camera_playerlock':
                $gameMap.getSmoothCamera().lockToPlayer();
                break;
            case 'camera_alpha':
                $gameMap.getSmoothCamera().setAlpha(parseFloat(args[0]));
                break;
            case 'camera_alpha_reset':
                $gameMap.getSmoothCamera().resetAlpha();
                break;
        }
    };
    
})();

/**********************************************************************
 * The camera class
 * > will be saved with $gameMap, so this needs global access!
 **********************************************************************/

function NB_Camera() {
    this.initialize.apply(this, arguments);
}

NB_Camera.prototype.initialize = function() {
    this.CAMERA_LIMIT = 99;
    this._playerLock = true;
    this._eventLockId = null;
    this._x = 0;
    this._y = 0;
    this._targetX = 0;
    this._targetY = 0;
    this._limitX = this.CAMERA_LIMIT;
    this._limitY = this.CAMERA_LIMIT;
    this._alpha = 0.1;
};

NB_Camera.prototype.setPosition = function(x, y) {
    this.setTarget(x, y);
    this._x = this._targetX;
    this._y = this._targetY;
    $gameMap.setDisplayPos(this._x, this._y);
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

NB_Camera.prototype.setTargetById = function(id) {
    var character = null;
    if (id === 'player') {
        character = $gamePlayer;
    } else {
        character = $gameMap.event(id);
    }
    if (character != null) {
        this.setTarget(character._realX - 13, character._realY - 7);
    } else {
        this.setTarget(0, 0);
    }
};

NB_Camera.prototype.lockToEvent = function(eventId) {
    var event = $gameMap.event(eventId);
    if (event != null) {
        this._playerLock = false;
        this._eventLockId = eventId;
    } else {
        console.log('camera: lock to null event error!');
    }
};

NB_Camera.prototype.lockToPlayer = function() {
    this._playerLock = true;
    this._eventLockId = null;
};

NB_Camera.prototype.prepareForLookAt = function(limit) {
    this._playerLock = false;
    this._eventLockId = null;
    var distX = Math.abs(this._targetX - this._x);
    var distY = Math.abs(this._targetY - this._y);
    this._limitX = distX * limit;
    this._limitY = distY * limit;
};

NB_Camera.prototype.setAlpha = function(alpha) {
    this._alpha = alpha;
};

NB_Camera.prototype.resetAlpha = function() {
    this._alpha = 0.1;
}

NB_Camera.prototype.resetLimits = function() {
    this._limitX = this.CAMERA_LIMIT;
    this._limitY = this.CAMERA_LIMIT;
};

NB_Camera.prototype.decideTarget = function() {
    if (!this._playerLock) {
        if (this._eventLockId != null) {
            this.setTargetById(this._eventLockId);
        }
    } else {
        this.setTargetById('player');
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
    
    $gameMap.setDisplayPosAndScrollParallax(this._x, this._y);
    
};
