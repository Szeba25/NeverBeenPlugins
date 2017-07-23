//=============================================================================
// NB_MiniGameCombine.js
//=============================================================================

/*:
 * @plugindesc Minigame to combine puzzle pieces.
 * @author Scalytank
 *
 * @param switch
 * @desc The switch ID for switching to true if completed!
 * @default 1
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    var parameters = PluginManager.parameters('NB_MiniGameCombine');
    var switchID = parseInt(parameters['switch']);
    var aliases = {};
    
    var graphicsFolder = '';
    
    function NB_MiniGameCombine() {
        this.initialize.apply(this, arguments);
    }
    
    NB_MiniGameCombine.prototype = Object.create(NB_Interface.prototype);
    NB_MiniGameCombine.prototype.constructor = NB_MiniGameCombine;
    
    NB_MiniGameCombine.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            _exit
            _finished
            _pieces
            _finishedSprite
            _solveWait
            _finishedWaitCount
            _sound
        */
    };
    
    NB_MiniGameCombine.prototype.create = function() {
        this.createBackground();
        this.removeChild(this._pergamen);
        this._backgroundTint.opacity = 0;
        this._exit = false;
        this._finished = false;
        this._pieces = [];
        for (var i = 1; i <= 14; i++) {
            var sprite = new Sprite(ImageManager.loadInterfaceElement('minigames/combine/' + graphicsFolder + '/', ''+i, 0));
            sprite.opacity = 0;
            obj = {};
            obj['id'] = i;
            obj['sprite'] = sprite;
            obj['x'] = 0;
            obj['y'] = 0;
            obj['realX'] = 0;
            obj['realY'] = 0;
            obj['destX'] = 0;
            obj['destY'] = 0;
            this._pieces.push(obj);
            this.addChild(sprite);
        }
        this._setTo(this._pieces[0], 1, 1);
        this._setTo(this._pieces[1], 0, 0);
        this._setTo(this._pieces[2], 2, 0);
        this._setTo(this._pieces[3], 0, 1);
        this._setTo(this._pieces[4], 2, 2);
        this._setTo(this._pieces[5], 1, 0);
        this._setTo(this._pieces[6], 1, 2);
        this._setTo(this._pieces[7], 3, 1);
        this._setTo(this._pieces[8], 4, 0);
        this._setTo(this._pieces[9], 3, 2);
        this._setTo(this._pieces[10], 4, 1);
        this._setTo(this._pieces[11], 0, 2);
        this._setTo(this._pieces[12], 3, 0);
        this._setTo(this._pieces[13], 2, 1);
        this._finishedSprite = new Sprite(ImageManager.loadInterfaceElement('minigames/combine/' + graphicsFolder + '/', 'finished', 0));
        this._finishedSprite.opacity = 0;
        this._solveWait = 80;
        this._finishedWaitCount = 240;
        this.addChild(this._finishedSprite);
        this._sound = {};
        this._sound['name'] = 'Stone';
        this._sound['volume'] = 100;
        this._sound['pitch'] = 100;
        this._sound['pan'] = 0;
        NB_Interface.prototype.create.call(this);
    };
    
    NB_MiniGameCombine.prototype._setTo = function(piece, x, y) {
        piece.x = x;
        piece.y = y;
        piece.sprite.x = 120 + x * 168;
        piece.sprite.y = 20 + y * 190;
        piece.realX = piece.sprite.x;
        piece.realY = piece.sprite.y;
        piece.destX = piece.sprite.x;
        piece.destY = piece.sprite.y;
    };
    
    NB_MiniGameCombine.prototype._sendTo = function(piece, x, y) {
        piece.x = x;
        piece.y = y;
        piece.destX = 120 + x * 168;
        piece.destY = 20 + y * 190;
    };
    
    NB_MiniGameCombine.prototype._checkPieceCollision = function(x, y) {
        if (x < 0 || x > 4 || y < 0 || y > 2) {
            return true;
        }
        for (var i = 0; i < this._pieces.length; i++) {
            if (x == this._pieces[i].x && y == this._pieces[i].y) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameCombine.prototype._checkFinished = function() {
        if (this._pieces[0].x == 0 && this._pieces[0].y == 0 &&
            this._pieces[1].x == 1 && this._pieces[1].y == 0 &&
            this._pieces[2].x == 2 && this._pieces[2].y == 0 &&
            this._pieces[3].x == 3 && this._pieces[3].y == 0 &&
            this._pieces[4].x == 4 && this._pieces[4].y == 0 &&
            this._pieces[5].x == 0 && this._pieces[5].y == 1 &&
            this._pieces[6].x == 1 && this._pieces[6].y == 1 &&
            this._pieces[7].x == 2 && this._pieces[7].y == 1 &&
            this._pieces[8].x == 3 && this._pieces[8].y == 1 &&
            this._pieces[9].x == 4 && this._pieces[9].y == 1 &&
            this._pieces[10].x == 0 && this._pieces[10].y == 2 &&
            this._pieces[11].x == 1 && this._pieces[11].y == 2 &&
            this._pieces[12].x == 2 && this._pieces[12].y == 2 &&
            this._pieces[13].x == 3 && this._pieces[13].y == 2) {
            
            SoundManager.playOk();
            this._finished = true;
        }
    };
    
    NB_MiniGameCombine.prototype._movePieces = function(dx, dy) {
        var arr = [];
        for (var i = 0; i < this._pieces.length; i++) {
            if (!this._checkPieceCollision(this._pieces[i].x+dx, this._pieces[i].y+dy)) {
                arr.push(this._pieces[i]);
            }
        }
        if (arr.length > 0) AudioManager.playSe(this._sound);
        for (var j = 0; j < arr.length; j++) {
            this._sendTo(arr[j], arr[j].x+dx, arr[j].y+dy);
        }
        this._checkFinished();
    };
    
    // Override!
    NB_MiniGameCombine.prototype.updateInput = function() {
        if (!this._exit && !this._finished) {
            if (Input.isTriggered('cancel')) {
                $gameSwitches.setValue(switchID, false);
                this._exit = true;
            }
            if (Input.isTriggered('right')) {
                this._movePieces(1, 0);
            }
            if (Input.isTriggered('left')) {
                this._movePieces(-1, 0);
            }
            if (Input.isTriggered('up')) {
                this._movePieces(0, -1);
            }
            if (Input.isTriggered('down')) {
                this._movePieces(0, 1);
            }
        }
    };
    
    // Override!
    NB_MiniGameCombine.prototype.updateOpacity = function() {
        if (this._exit) {
            if (this._finishedSprite.opacity > 0) {
                this._finishedSprite.opacity -= 15;
            }
            if (this._backgroundTint.opacity > 0) {
                this._backgroundTint.opacity -= 10;
            }
            for (var i = 0; i < this._pieces.length; i++) {
                if (this._pieces[i].sprite.opacity > 0) {
                    this._pieces[i].sprite.opacity -= 15;
                }
            }
        } else {
            if (this._finished) {
                if (this._solveWait > 0) {
                    this._solveWait--;
                } else {
                    if (this._finishedSprite.opacity < 255) {
                        this._finishedSprite.opacity += 5
                    }
                    if (this._finishedSprite.opacity == 255) {
                        if (this._finishedWaitCount > 0) {
                            this._finishedWaitCount--;
                        } else {
                            this._exit = true;
                            $gameSwitches.setValue(switchID, true);
                        }
                    }
                    for (var i = 0; i < this._pieces.length; i++) {
                        if (this._pieces[i].sprite.opacity > 0) {
                            this._pieces[i].sprite.opacity -= 5;
                        }
                    }
                }
            } else {
                if (this._backgroundTint.opacity < 130) {
                    this._backgroundTint.opacity += 10;
                } else if (!this.isEnterComplete()) {
                    this.makeEnterComplete();
                }
                for (var i = 0; i < this._pieces.length; i++) {
                    if (this._pieces[i].sprite.opacity < 255) {
                        this._pieces[i].sprite.opacity += 15;
                    }
                }
            }
        }
    };
    
    // Override!
    NB_MiniGameCombine.prototype.updateTransitions = function() {
        if (this._exit && this._pieces[0].sprite.opacity == 0 && this._finishedSprite.opacity == 0) {
            SceneManager.goto(Scene_Map);
        }
    };
    
    // Override!
    NB_MiniGameCombine.prototype.updateElements = function() {
        for (var i = 0; i < this._pieces.length; i++) {
            if (this._pieces[i].realX < this._pieces[i].destX) {
                this._pieces[i].realX += 8;
                this._pieces[i].sprite.x = Math.round(this._pieces[i].realX);
            }
            if (this._pieces[i].realX > this._pieces[i].destX) {
                this._pieces[i].realX -= 8;
                this._pieces[i].sprite.x = Math.round(this._pieces[i].realX);
            }
            if (this._pieces[i].realY < this._pieces[i].destY) {
                this._pieces[i].realY += 10;
                this._pieces[i].sprite.y = Math.round(this._pieces[i].realY);
            }
            if (this._pieces[i].realY > this._pieces[i].destY) {
                this._pieces[i].realY -= 10;
                this._pieces[i].sprite.y = Math.round(this._pieces[i].realY);
            }
        }
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'minigame_combine') {
            graphicsFolder = args[0];
            SceneManager.goto(NB_MiniGameCombine);
        }
    };
    
})();
