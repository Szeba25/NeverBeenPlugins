//=============================================================================
// NB_MiniGameMatchThree.js
//=============================================================================

/*:
 * @plugindesc Minigame for a simple match three puzzle.
 * @author Scalytank
 *
 * @param switch
 * @desc The switch ID for switching to true if completed!
 * @default 1
 */

(function() {
    
    var parameters = PluginManager.parameters('NB_MiniGameMatchThree');
    var switchID = parseInt(parameters['switch']);
    var aliases = {};
    
    function NB_MiniGameMatchThree() {
        this.initialize.apply(this, arguments);
    }
    
    NB_MiniGameMatchThree.prototype = Object.create(NB_Interface.prototype);
    NB_MiniGameMatchThree.prototype.constructor = NB_MiniGameMatchThree;
    
    NB_MiniGameMatchThree.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        this._masterOpacity = 0;
        this._objectBitmaps = null;
        this._progressBarBitmap = null;
        this._progressBarBorderBitmap = null;
        this._board = null;
        this._selectionSprite = null;
        this._objects = null;
        
        this._boardLogic = null;
        
        this._exit = false;
    };
    
    NB_MiniGameMatchThree.prototype.create = function() {
        
        this._masterOpacity = 0;
        
        this.createBackground();
        var path = 'minigames/matchthree/shells/';
        this.removeChild(this._pergamen);
        this._backgroundTint.opacity = 0;
        
        this._objectBitmaps = [];
        for (var i = 0; i < 4; i++) {
            this._objectBitmaps.push(ImageManager.loadInterfaceElement(path, 'shell'+i, 0));
        }
        this._objectBitmaps.push(ImageManager.loadInterfaceElement(path, 'stone', 0));
        this._progressBarBitmap = ImageManager.loadInterfaceElement(path, 'progress_bar', 0);
        this._progressBarBorderBitmap = ImageManager.loadInterfaceElement(path, 'progress_bar_border', 0);
        
        this._board = new Sprite(ImageManager.loadInterfaceElement(path, 'board', 0));
        this._board.x = 90;
        this._board.y = 90;
        this._selectionSprite = new Sprite(ImageManager.loadInterfaceElement(path, 'selection', 0));
        this._exit = false;
        
        this.addChild(this._board);
        this.addChild(this._selectionSprite);
        
        this._objects = [];
        for (var i = 0; i < 25; i++) {
            obj = {};
            obj['id'] = Math.floor(Math.random() * 5);
            obj['logicalX'] = 0;
            obj['logicalY'] = 0;
            obj['realX'] = 0;
            obj['realY'] = 0;
            obj['sprite'] = new Sprite(this._objectBitmaps[obj.id]);
            obj.sprite.opacity = 0;
            obj['destX'] = 0;
            obj['destY'] = 0;
            obj['speed'] = 6;
            obj['destroyed'] = false;
            obj['destroyOpacity'] = 255;
            this._objects.push(obj);
            this.addChild(obj.sprite);
        }
        
        this._prepareBoard();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_MiniGameMatchThree.prototype._setObjectToLocation = function(obj, x, y, removeFromOld) {
        if (removeFromOld) {
            this._boardLogic[obj.x][obj.y] = null;
        }
        obj.x = x;
        obj.y = y;
        obj.realX = 95 + x*90;
        obj.realY = 95 + y*90;
        obj.destX = obj.realX;
        obj.destY = obj.realY;
        this._boardLogic[x][y] = obj;
    };
    
    NB_MiniGameMatchThree.prototype._setObjectDestination = function(obj, dx, dy, removeFromOld) {
        if (removeFromOld) {
            this._boardLogic[obj.x][obj.y] = null;
        }
        obj.x = dx;
        obj.y = dy;
        obj.destX = 95 + dx*90;
        obj.destY = 95 + dy*90;
        this._boardLogic[dx][dy] = obj;
    }
    
    NB_MiniGameMatchThree.prototype._setAllObjectsOpacity = function(value) {
        for (var i = 0; i < 25; i++) {
            if (this._objects[i].destroyed && this._objects[i].destroyOpacity > 0) {
                this._objects[i].destroyOpacity -= 51;
            }
            this._objects[i].sprite.opacity = Math.round(this._objects[i].destroyOpacity * (value/255));
        }
    };
    
    NB_MiniGameMatchThree.prototype._checkForMatch = function() {
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                // Check horizontal
                var horizontal = 1;
                for (var i = x-1; i >= 0; i--) {
                    if (this._boardLogic[i][y].id == this._boardLogic[x][y].id) {
                        horizontal++;
                    } else {
                        break;
                    }
                }
                for (var i = x+1; i < 5; i++) {
                    if (this._boardLogic[i][y].id == this._boardLogic[x][y].id) {
                        horizontal++;
                    } else {
                        break;
                    }
                }
                var vertical = 1;
                for (var i = y-1; i >= 0; i--) {
                    if (this._boardLogic[x][i].id == this._boardLogic[x][y].id) {
                        vertical++;
                    } else {
                        break;
                    }
                }
                for (var i = y+1; i < 5; i++) {
                    if (this._boardLogic[x][i].id == this._boardLogic[x][y].id) {
                        vertical++;
                    } else {
                        break;
                    }
                }
                if (horizontal > 2 || vertical > 2) {
                    this._boardLogic[x][y].destroyed = true;
                }
                /*
                console.log(this._boardLogic[x][y].x + '/' + this._boardLogic[x][y].y +
                            ' object at ' + x + '/' + y + ' h value is: ' + horizontal);
                console.log(this._boardLogic[x][y].x + '/' + this._boardLogic[x][y].y +
                            ' object at ' + x + '/' + y + ' v value is: ' + vertical);
                */
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._prepareBoard = function() {
        this._boardLogic = [];
        for (var x = 0; x < 5; x++) {
            this._boardLogic.push([]);
            for (var y = 0; y < 5; y++) {
                this._boardLogic[x].push(null);
            }
        }
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                this._setObjectToLocation(this._objects[x*5 + y], x, y, false);
            }
        }
        console.log(this._boardLogic);
    };
    
    NB_MiniGameMatchThree.prototype._removeTotallyDestroyedObjects = function() {
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                obj = this._boardLogic[x][y];
                if (obj != null && obj.destroyed && obj.destroyOpacity == 0) {
                    this._boardLogic[x][y] = null;
                    console.log(x + '/' + y + ' removed from board');
                }
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._isObjectMoving = function(obj) {
        return (obj.realX != obj.destX || obj.realY != obj.destY);
    };
    
    NB_MiniGameMatchThree.prototype._isAnyObjectMoving = function() {
        for (var i = 0; i < 25; i++) {
            if (this._isObjectMoving(this._objects[i])) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._isNewObjectNeeded = function() {
        for (var i = 0; i < 25; i++) {
            if (this._objects[i].destroyed) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._syncObjects = function() {
        for (var i = 0; i < 25; i++) {
            var obj = this._objects[i];
            obj.sprite.x = obj.realX;
            obj.sprite.y = obj.realY;
        }
    };
    
    NB_MiniGameMatchThree.prototype._spawnNewObjects = function() {
        if (!this._isAnyObjectMoving() && this._isNewObjectNeeded()) {
            for (x = 0; x < 5; x++) {
                
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._objectsGravity = function() {
        for (var i = 0; i < 25; i++) {
            var obj = this._objects[i];
            if (!obj.destroyed) {
                if (!this._isObjectMoving(obj) && obj.y+1 < 5 && this._boardLogic[obj.x][obj.y+1] == null) {
                    this._setObjectDestination(obj, obj.x, obj.y+1, true);
                    console.log(obj.x + '/' + obj.y + ' object moved down by one');
                    i = 0;
                }
            }
        }
        
        for (var i = 0; i < 25; i++) {
            var obj = this._objects[i];
            if (!obj.destroyed) {
                if (obj.realX < obj.destX) {
                    obj.realX += obj.speed;
                }
                if (obj.realX > obj.destX) {
                    obj.realX -= obj.speed;
                }
                if (obj.realY < obj.destY) {
                    obj.realY += obj.speed;
                }
                if (obj.realY > obj.destY) {
                    obj.realY -= obj.speed;
                }
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype.updateInput = function() {
        if (Input.isTriggered('cancel')) {
            this._exit = true;
        }
        if (Input.isTriggered('ok') && !this._isAnyObjectMoving()) {
            this._checkForMatch();
        }
    };
    
    NB_MiniGameMatchThree.prototype.updateOpacity = function() {
        if (this._exit) {
            if (this._masterOpacity > 0) {
                this._masterOpacity -= 15;
            }
            if (this._backgroundTint.opacity > 0) {
                this._backgroundTint.opacity -= 10;
            }
        } else {
            if (this._masterOpacity < 255) {
                this._masterOpacity += 15;
            } else if (!this.isEnterComplete()) {
                this.makeEnterComplete();
            }
            if (this._backgroundTint.opacity < 130) {
                this._backgroundTint.opacity += 10;
            }
        }
        this._board.opacity = this._masterOpacity;
        this._selectionSprite.opacity = this._masterOpacity;
        this._setAllObjectsOpacity(this._masterOpacity);
    };
    
    NB_MiniGameMatchThree.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            SceneManager.goto(Scene_Map);
        }
    };
    
    NB_MiniGameMatchThree.prototype.updateElements = function() {
        this._syncObjects();
        this._removeTotallyDestroyedObjects();
        this._objectsGravity();
        this._spawnNewObjects();
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'minigame_matchthree') {
            SceneManager.goto(NB_MiniGameMatchThree);
        }
    };
    
})();
