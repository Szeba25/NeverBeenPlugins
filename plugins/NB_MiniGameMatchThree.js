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
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    var parameters = PluginManager.parameters('NB_MiniGameMatchThree');
    var switchID = parseInt(parameters['switch']);
    var aliases = {};
    
    var graphicsFolder = '';
    
    var definedScoresMax = [];
    definedScoresMax.push(0);
    definedScoresMax.push(0);
    definedScoresMax.push(0);
    definedScoresMax.push(0);
    var definedTime = 0;
    
    function NB_MiniGameMatchThree() {
        this.initialize.apply(this, arguments);
    }
    
    NB_MiniGameMatchThree.prototype = Object.create(NB_Interface.prototype);
    NB_MiniGameMatchThree.prototype.constructor = NB_MiniGameMatchThree;
    
    NB_MiniGameMatchThree.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            # flow control
            _exit
            _masterOpacity
            _selX
            _selY
            _selGrab
            _selShrink
            _swapHappened
            _lastSwap1
            _lastSwap2
            _oneValidMove
            _hintTime
            _hintTimeReset
            _scores
            _scoresMax
            _timeRedrawNeeded
            _time
            _path
            _scoreRedrawNeeded
            _win
            _lose
            _winFade
            _winWait
            
            # sprites and bitmaps
            _objectBitmaps
            _progressBarBitmap
            _progressBarBitmapGray
            _progressBarBorderBitmap
            _board
            _selectionSprite
            _scoreSprite
            _timeSprite
            _winSprite
            
            # game logic
            _objects
            _boardLogic
            _checkLogic
            
            # sound data
            _soundMove
            _soundSelect
            _soundCursor
            _soundMatch
            _soundWin
            _soundLose
        */
    };
    
    NB_MiniGameMatchThree.prototype.create = function() {
        
        this._path = 'minigames/matchthree/' + graphicsFolder + '/';
        
        this._exit = false;
        this._masterOpacity = 0;
        
        this.createBackground();
        this.removeChild(this._pergamen);
        this._backgroundTint.opacity = 0;
        
        this._createSounds();
        this._loadBitmaps();
        this._board = new Sprite(ImageManager.loadInterfaceElement(this._path, 'board', 0));
        this._board.x = 90;
        this._board.y = 90;
        this._selectionSprite = new Sprite(ImageManager.loadInterfaceElement(this._path, 'selection', 0));
        this._selectionSprite.anchor.x = 0.5;
        this._selectionSprite.anchor.y = 0.5;
        
        this.addChild(this._board);
        
        this._objects = [];
        for (var i = 0; i < 25; i++) {
            var obj = {};
            obj['id'] = 0;
            obj['logicalX'] = 0;
            obj['logicalY'] = 0;
            obj['realX'] = 0;
            obj['realY'] = 0;
            obj['sprite'] = new Sprite(this._objectBitmaps[obj.id]);
            obj.sprite.opacity = 0;
            obj.sprite.anchor.x = 0.5;
            obj.sprite.anchor.y = 0.5;
            obj['destX'] = 0;
            obj['destY'] = 0;
            obj['speed'] = 6;
            obj['destroyed'] = false;
            obj['destroyOpacity'] = 255;
            obj['destroyScale'] = 1.0;
            obj['hintScale'] = 1.0;
            obj['hintShrink'] = false;
            this._objects.push(obj);
            this.addChild(obj.sprite);
        }
        
        this._prepareBoard();
        this._randomizeBoard();
        
        this.addChild(this._selectionSprite);
        this._setSelectionPos(0, 0);
        this._selX = 0;
        this._selY = 0;
        this._selGrab = false;
        this._selShrink = false;
        this._swapHappened = false;
        this._lastSwap1 = null;
        this._lastSwap2 = null;
        
        this._oneValidMove = {};
        this._oneValidMove['x'] = -1;
        this._oneValidMove['y'] = -1;
        this._oneValidMove['wx'] = -1;
        this._oneValidMove['wy'] = -1;
        
        this._hintTimeReset = 720;
        this._hintTime = this._hintTimeReset;
        
        this._scoreSprite = new Sprite(new Bitmap(400, 540));
        this._scoreSprite.x = 600;
        this._scoreSprite.y = 30;
        this._scoreRedrawNeeded = true;
        
        this._scores = [];
        this._scoresMax = [];
        for (var i = 0; i < 5; i++) {
            this._scores.push(0);
            this._scoresMax.push(definedScoresMax[i]);
        }
        
        this._timeSprite = new Sprite(new Bitmap(200, 60));
        this._timeSprite.bitmap.fontSize = 50;
        this._timeSprite.x = 20;
        this._timeSprite.y = 0;
        this._timeRedrawNeeded = true;
        this._time = definedTime*60 + 1;
        
        this._winSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._winSprite.bitmap.fillAll('#ffffff');
        this._winSprite.opacity = 0;
        this._win = false;
        this._lose = false;
        this._winFade = false;
        this._winWait = 60;
        
        this.addChild(this._scoreSprite);
        this.addChild(this._timeSprite);
        this.addChild(this._winSprite);
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_MiniGameMatchThree.prototype._createSounds = function() {
        this._soundMove = {};
        this._soundMove['name'] = 'tm2_slash001r';
        this._soundMove['volume'] = 100;
        this._soundMove['pitch'] = 100;
        this._soundMove['pan'] = 0;
        this._soundSelect = {};
        this._soundSelect['name'] = 'tm2_counter000';
        this._soundSelect['volume'] = 100;
        this._soundSelect['pitch'] = 100;
        this._soundSelect['pan'] = 0;
        this._soundCursor = {};
        this._soundCursor['name'] = 'tm2_switch000';
        this._soundCursor['volume'] = 100;
        this._soundCursor['pitch'] = 100;
        this._soundCursor['pan'] = 0;
        this._soundMatch = {};
        this._soundMatch['name'] = 'Ice4';
        this._soundMatch['volume'] = 100;
        this._soundMatch['pitch'] = 100;
        this._soundMatch['pan'] = 0;
        this._soundWin = {};
        this._soundWin['name'] = 'Item3';
        this._soundWin['volume'] = 100;
        this._soundWin['pitch'] = 100;
        this._soundWin['pan'] = 0;
        this._soundLose = {};
        this._soundLose['name'] = 'Buzzer1';
        this._soundLose['volume'] = 100;
        this._soundLose['pitch'] = 100;
        this._soundLose['pan'] = 0;
    };
    
    NB_MiniGameMatchThree.prototype._loadBitmaps = function() {
        // Bitmaps
        this._objectBitmaps = [];
        for (var i = 0; i < 4; i++) {
            this._objectBitmaps.push(ImageManager.loadInterfaceElement(this._path, 'shell'+i, 0));
        }
        this._objectBitmaps.push(ImageManager.loadInterfaceElement(this._path, 'stone', 0));
        this._progressBarBitmap = ImageManager.loadInterfaceElement(this._path, 'progress_bar', 0);
        this._progressBarBitmapGray = ImageManager.loadInterfaceElement(this._path, 'progress_bar_gray', 0);
        this._progressBarBorderBitmap = ImageManager.loadInterfaceElement(this._path, 'progress_bar_border', 0);
    };
    
    NB_MiniGameMatchThree.prototype._redrawScores = function() {
        if (this._scoreRedrawNeeded) {
            var bmp = this._scoreSprite.bitmap;
            bmp.clear();
            for (var i = 0; i < 4; i++) {
                bmp.blt(this._objectBitmaps[i], 0, 0, this._objectBitmaps[i].width, this._objectBitmaps[i].height,
                        15 + i*100, 0, this._objectBitmaps[i].width, this._objectBitmaps[i].height);
                
                var percent = 0;
                if (this._scoresMax[i] == 0) {
                    bmp.blt(this._progressBarBitmapGray, 0, 0, 
                        this._progressBarBitmapGray.width, this._progressBarBitmapGray.height,
                        34 + i*100, 114,
                        this._progressBarBitmapGray.width, this._progressBarBitmapGray.height);
                    
                } else {
                    bmp.blt(this._progressBarBitmap, 0, 0, 
                        this._progressBarBitmap.width, this._progressBarBitmap.height,
                        34 + i*100, 114,
                        this._progressBarBitmap.width, this._progressBarBitmap.height);
                    
                    percent = (this._scoresMax[i] - this._scores[i]) / this._scoresMax[i];
                    bmp.clearRect(34 + i*100, 114, this._progressBarBitmap.width,
                        this._progressBarBitmap.height * percent);
                }
                
                bmp.drawText(this._scores[i] + '/' + this._scoresMax[i], 10 + i*100, 475, 100, 30, 'center');
                
                bmp.blt(this._progressBarBorderBitmap, 0, 0, 
                    this._progressBarBorderBitmap.width, this._progressBarBorderBitmap.height,
                    30 + i*100, 110,
                    this._progressBarBorderBitmap.width, this._progressBarBorderBitmap.height);
            }
            this._scoreRedrawNeeded = false;
        }
    };
    
    NB_MiniGameMatchThree.prototype._refreshTime = function() {
        if (this._time == 0 && !this._win && !this._lose) {
            // LOSE TRIGGER!
            this._time--;
            this._selGrab = false;
            this._lose = true;
            this._exit = true;
            $gameSwitches.setValue(switchID, false);
            AudioManager.playSe(this._soundLose);
        } else {
            if (this._time > 0 && !this._win && !this._lose) {
                this._time--;
                if (this._time % 60 == 0) {
                    this._timeRedrawNeeded = true;
                }
            }
            if (this._timeRedrawNeeded) {
                var bmp = this._timeSprite.bitmap;
                bmp.clear();
                bmp.drawText('idő: ' + this._time/60, 0, 0, 200, 60, 'left');
                this._timeRedrawNeeded = false;
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._setObjectToLocation = function(obj, x, y, removeFromOld) {
        if (removeFromOld) {
            this._boardLogic[obj.logicalX][obj.logicalY] = null;
        }
        obj.logicalX = x;
        obj.logicalY = y;
        obj.realX = 140 + x*90;
        obj.realY = 140 + y*90;
        obj.destX = obj.realX;
        obj.destY = obj.realY;
        this._boardLogic[x][y] = obj;
    };
    
    NB_MiniGameMatchThree.prototype._setObjectDestination = function(obj, dx, dy, removeFromOld) {
        if (removeFromOld) {
            this._boardLogic[obj.logicalX][obj.logicalY] = null;
        }
        obj.logicalX = dx;
        obj.logicalY = dy;
        obj.destX = 140 + dx*90;
        obj.destY = 140 + dy*90;
        this._boardLogic[dx][dy] = obj;
    };
    
    NB_MiniGameMatchThree.prototype._swapObjects = function(obj1, obj2) {
        
        var oldObjX = obj1.logicalX;
        var oldObjY = obj1.logicalY;
        obj1.logicalX = obj2.logicalX;
        obj1.logicalY = obj2.logicalY;
        obj2.logicalX = oldObjX;
        obj2.logicalY = oldObjY;
        
        this._setObjectDestination(obj1, obj1.logicalX, obj1.logicalY, false);
        this._setObjectDestination(obj2, obj2.logicalX, obj2.logicalY, false);
        
        this._lastSwap1 = obj1;
        this._lastSwap2 = obj2;
    };
    
    NB_MiniGameMatchThree.prototype._setAllObjectsOpacity = function(value) {
        var boardReady = this._isBoardReady();
        
        for (var i = 0; i < 25; i++) {
            if (this._objects[i].destroyed && this._objects[i].destroyOpacity > 0) {
                this._objects[i].destroyOpacity -= 15;
            } else if (!this._objects[i].destroyed && this._objects[i].destroyOpacity < 255) {
                this._objects[i].destroyOpacity += 15;
                this._objects[i].destroyScale += 1/17;
            }
            
            if ( boardReady && this._hintTime < 120 &&
                 ((this._objects[i].logicalX == this._oneValidMove.x && 
                  this._objects[i].logicalY == this._oneValidMove.y) ||
                 (this._objects[i].logicalX == this._oneValidMove.wx && 
                  this._objects[i].logicalY == this._oneValidMove.wy)) ) {
                
                if (this._objects[i].hintShrink) {
                    if (this._objects[i].hintScale > 0.8) {
                        this._objects[i].hintScale -= 0.01;
                    } else {
                        this._objects[i].hintShrink = false;
                    }
                } else {
                    if (this._objects[i].hintScale < 1.0) {
                        this._objects[i].hintScale += 0.01;
                    } else {
                        this._objects[i].hintShrink = true;
                    }
                }
            } else {
                if (this._objects[i].hintScale < 1.0) {
                    this._objects[i].hintScale += 0.01;
                }
            }
            
            this._objects[i].sprite.opacity = Math.round(this._objects[i].destroyOpacity * (value/255));
            this._objects[i].sprite.scale.x = this._objects[i].destroyScale * this._objects[i].hintScale;
            this._objects[i].sprite.scale.y = this._objects[i].destroyScale * this._objects[i].hintScale;
        }
    };
    
    NB_MiniGameMatchThree.prototype._checkForMatch = function(board, destroy) {
        var anyMatch = false;
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                // Check horizontal
                var horizontal = 1;
                for (var i = x-1; i >= 0; i--) {
                    if (board[i][y].id == board[x][y].id) {
                        horizontal++;
                    } else {
                        break;
                    }
                }
                for (var i = x+1; i < 5; i++) {
                    if (board[i][y].id == board[x][y].id) {
                        horizontal++;
                    } else {
                        break;
                    }
                }
                var vertical = 1;
                for (var i = y-1; i >= 0; i--) {
                    if (board[x][i].id == board[x][y].id) {
                        vertical++;
                    } else {
                        break;
                    }
                }
                for (var i = y+1; i < 5; i++) {
                    if (board[x][i].id == board[x][y].id) {
                        vertical++;
                    } else {
                        break;
                    }
                }
                if (horizontal > 2 || vertical > 2) {
                    if (destroy) {
                        board[x][y].destroyed = true;
                        var id = board[x][y].id;
                        this._appendScore(horizontal, vertical, id);
                    }
                    anyMatch = true;
                }
            }
        }
        return anyMatch;
    };
    
    NB_MiniGameMatchThree.prototype._appendScore = function(horizontal, vertical, id) {
        
        if (horizontal == 5 || vertical == 5) {
            this._scores[id] += 3;
        } else if (horizontal == 4 || vertical == 4) {
            this._scores[id] += 2;
        } else {
            this._scores[id] += 1;
        }
        
        if (this._scores[id] > this._scoresMax[id]) {
            this._scores[id] = this._scoresMax[id];
        }
        
        var willWin = true;
        for (var i = 0; i < 4; i++) {
            if (this._scores[i] < this._scoresMax[i]) {
                willWin = false;
                break;
            }
        }
        if (!this._win && willWin) {
            // WIN TRIGGER!
            this._selGrab = false;
            $gameSwitches.setValue(switchID, true);
            AudioManager.playSe(this._soundWin);
        }
        this._win = willWin;
    };
    
    NB_MiniGameMatchThree.prototype._matchPassively = function() {
        if (this._isBoardReady() && !this._isAnyObjectDestroyed()) {
            if (this._checkForMatch(this._boardLogic, true)) {
                AudioManager.playSe(this._soundMatch);
                this._scoreRedrawNeeded = true;
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._prepareBoard = function() {
        this._boardLogic = [];
        this._checkLogic = [];
        for (var x = 0; x < 5; x++) {
            this._boardLogic.push([]);
            this._checkLogic.push([]);
            for (var y = 0; y < 5; y++) {
                this._boardLogic[x].push(null);
                var chkobj = {};
                chkobj['id'] = 0;
                this._checkLogic[x].push(chkobj);
            }
        }
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                this._setObjectToLocation(this._objects[x*5 + y], x, y, false);
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._randomizeBoard = function() {
        var doneIn = 0;
        do {
            for (var i = 0; i < 25; i++) {
                this._objects[i].id = Math.floor(Math.random() * 5);
                this._objects[i].sprite.bitmap = this._objectBitmaps[this._objects[i].id];
            }
            doneIn++;
        } while(this._checkForMatch(this._boardLogic, false) && doneIn < 1000);
        if (doneIn == 1000) {
            //console.log('no comment... 1000 matching boards...');
        } else {
            //console.log('randomized in ' + doneIn + ' steps');
        }
    };
    
    NB_MiniGameMatchThree.prototype._removeTotallyDestroyedObjects = function() {
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                obj = this._boardLogic[x][y];
                if (obj != null && obj.destroyed && obj.destroyOpacity == 0) {
                    obj.destroyScale = 0;
                    this._boardLogic[x][y] = null;
                    //console.log(x + '/' + y + ' removed from board');
                }
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._isObjectMoving = function(obj) {
        return (obj.realX != obj.destX || obj.realY != obj.destY);
    };
    
    NB_MiniGameMatchThree.prototype._isAnyObjectDestroyed = function() {
        for (var i = 0; i < 25; i++) {
            if (this._objects[i].destroyed) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._isAnyObjectMoving = function() {
        for (var i = 0; i < 25; i++) {
            if (this._isObjectMoving(this._objects[i])) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._isBoardReady = function() {
        if (this._masterOpacity < 255) {
            return false;
        }
        for (var i = 0; i < 25; i++) {
            if (this._isObjectMoving(this._objects[i])) {
                return false;
            }
            if (this._objects[i].destroyed) {
                return false;
            }
            if (this._objects[i].destroyOpacity < 255) {
                return false;
            }
        }
        return true;
    };
    
    NB_MiniGameMatchThree.prototype._isNewObjectNeeded = function() {
        if (this._win || this._lose) {
            return false;
        }
        for (var i = 0; i < 25; i++) {
            if (this._objects[i].destroyed) {
                return true;
            }
        }
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._checkLogicSwap = function(x, y, dx, dy) {
        var temp = this._checkLogic[x][y];
        this._checkLogic[x][y] = this._checkLogic[x+dx][y+dy];
        this._checkLogic[x+dx][y+dy] = temp;
    };
    
    NB_MiniGameMatchThree.prototype._setOneValidMove = function(x, y, wx, wy) {
        this._oneValidMove.x = x;
        this._oneValidMove.y = y;
        this._oneValidMove.wx = wx;
        this._oneValidMove.wy = wy;
    };
    
    NB_MiniGameMatchThree.prototype._anyMoves = function() {
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                this._checkLogic[x][y].id = this._boardLogic[x][y].id;
            }
        }
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                
                if (x > 0) {
                    this._checkLogicSwap(x, y, -1, 0);
                    if (this._checkForMatch(this._checkLogic, false)) {
                        this._setOneValidMove(x, y, x-1, y);
                        return true;
                    }
                    this._checkLogicSwap(x, y, -1, 0);
                }
                
                if (x < 4) {
                    this._checkLogicSwap(x, y, 1, 0);
                    if (this._checkForMatch(this._checkLogic, false)) {
                        this._setOneValidMove(x, y, x+1, y);
                        return true;
                    }
                    this._checkLogicSwap(x, y, 1, 0);
                }
                
                if (y > 0) {
                    this._checkLogicSwap(x, y, 0, -1);
                    if (this._checkForMatch(this._checkLogic, false)) {
                        this._setOneValidMove(x, y, x, y-1);
                        return true;
                    }
                    this._checkLogicSwap(x, y, 0, -1);
                }
                
                if (y < 4) {
                    this._checkLogicSwap(x, y, 0, 1);
                    if (this._checkForMatch(this._checkLogic, false)) {
                        this._setOneValidMove(x, y, x, y+1);
                        return true;
                    }
                    this._checkLogicSwap(x, y, 0, 1);
                }
                
            }
        }
        this._setOneValidMove(-1, -1, -1, -1);
        return false;
    };
    
    NB_MiniGameMatchThree.prototype._rebuildIfNoMoves = function() {
        if (this._isBoardReady()) {
            if (!this._anyMoves()) {
                for (i = 0; i < 25; i++) {
                    this._objects[i].destroyed = true;
                }
            }
        }
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
            for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 5; y++) {
                    if (this._boardLogic[x][y] == null) {
                        for (var i = 0; i < 25; i++) {
                            if (this._objects[i].destroyed) {
                                this._setObjectToLocation(this._objects[i], x, y, false);
                                this._objects[i].destroyed = false;
                                this._objects[i].id = Math.floor(Math.random() * 5);
                                this._objects[i].sprite.bitmap = this._objectBitmaps[this._objects[i].id];
                                //console.log('spawn at: ' + x + '/' + y);
                                break;
                            }
                        }
                    }
                }
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._animateGrab = function() {
        if (this._selGrab) {
            if (this._selShrink) {
                if (this._selectionSprite.scale.x > 0.8) {
                    this._selectionSprite.scale.x -= 0.01;
                    this._selectionSprite.scale.y -= 0.01;
                } else {
                    this._selShrink = false;
                }
            } else {
                if (this._selectionSprite.scale.x < 1.0) {
                    this._selectionSprite.scale.x += 0.01;
                    this._selectionSprite.scale.y += 0.01;
                } else {
                    this._selShrink = true;
                }
            }
        } else {
            if (this._selectionSprite.scale.x < 1.0) {
                this._selectionSprite.scale.x += 0.01;
                this._selectionSprite.scale.y += 0.01;
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._objectsGravity = function() {
        
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
        
        for (var i = 0; i < 25; i++) {
            var obj = this._objects[i];
            if (!obj.destroyed) {
                if (!this._isObjectMoving(obj) && obj.logicalY+1 < 5 && this._boardLogic[obj.logicalX][obj.logicalY+1] == null) {
                    this._setObjectDestination(obj, obj.logicalX, obj.logicalY+1, true);
                    //console.log(obj.logicalX + '/' + obj.logicalY + ' object moved down by one');
                    i = 0;
                }
            }
        }
    };
    
    NB_MiniGameMatchThree.prototype._setSelectionPos = function(x, y) {
        // limit positions
        if (x < 0) x = 4;
        if (x > 4) x = 0;
        if (y < 0) y = 4;
        if (y > 4) y = 0;
        
        this._selX = x;
        this._selY = y;
        this._selectionSprite.x = 142 + this._selX * 90;
        this._selectionSprite.y = 140 + this._selY * 90;
    };
    
    NB_MiniGameMatchThree.prototype._swapSelectionByDelta = function(dx, dy) {
        if (this._selX + dx >= 0 && this._selX + dx <= 4 &&
            this._selY + dy >= 0 && this._selY + dy <= 4) {
            
            var obj1 = this._boardLogic[this._selX][this._selY];
            var obj2 = this._boardLogic[this._selX + dx][this._selY + dy];
            this._swapObjects(obj1, obj2);
            AudioManager.playSe(this._soundMove);
            return true;
        } else {
            return false;
        }
    };
    
    NB_MiniGameMatchThree.prototype._controlHintTime = function() {
        if (this._hintTime > 0) {
            this._hintTime--;
        } else {
            this._hintTime = this._hintTimeReset/3;
        }
    };
    
    // Override!
    NB_MiniGameMatchThree.prototype.updateInput = function() {
        if (this._exit || this._win || this._lose) {
            return;
        }
        
        var boardReady = this._isBoardReady();
        
        if (TouchInput.isTriggered()) {
            var px = parseInt((TouchInput.ncx-100) / 90);
            var py = parseInt((TouchInput.ncy-100) / 90);
            if (px >= 0 && px < 5 && py >= 0 && py < 5) {
                this._setSelectionPos(px, py);
                if (boardReady) {
                    AudioManager.playSe(this._soundSelect);
                    this._selGrab = true;
                    this._selShrink = true;
                    this._swapHappened = false;
                }
            }
        }
        
        if (!this._selGrab) {
            if (Input.isTriggered('up')) {
                this._setSelectionPos(this._selX, this._selY-1);
                AudioManager.playSe(this._soundCursor);
            } else if (Input.isTriggered('down')) {
                this._setSelectionPos(this._selX, this._selY+1);
                AudioManager.playSe(this._soundCursor);
            } else if (Input.isTriggered('left')) {
                this._setSelectionPos(this._selX-1, this._selY);
                AudioManager.playSe(this._soundCursor);
            } else if (Input.isTriggered('right')) {
                this._setSelectionPos(this._selX+1, this._selY);
                AudioManager.playSe(this._soundCursor);
            } else if (boardReady && Input.isTriggered('ok')) {
                AudioManager.playSe(this._soundSelect);
                this._selGrab = true;
                this._selShrink = true;
                this._swapHappened = false;
            }
        } else {
            if (this._swapHappened && !this._isAnyObjectMoving()) {
                if (!this._checkForMatch(this._boardLogic, false)) {
                    this._swapObjects(this._lastSwap1, this._lastSwap2);
                    this._selGrab = false;
                } else {
                    this._hintTime = this._hintTimeReset;
                    this._selGrab = false;
                }
            } else if (!this._swapHappened) {
                if (Input.isTriggered('ok')) {
                    this._selGrab = false;
                } else if (Input.isTriggered('up')) {
                    this._swapHappened = this._swapSelectionByDelta(0, -1);
                } else if (Input.isTriggered('down')) {
                    this._swapHappened = this._swapSelectionByDelta(0, 1);
                } else if (Input.isTriggered('left')) {
                    this._swapHappened = this._swapSelectionByDelta(-1, 0);
                } else if (Input.isTriggered('right')) {
                    this._swapHappened = this._swapSelectionByDelta(1, 0);
                } else if (TouchInput.isReleased()) {
                    var px = parseInt((TouchInput.ncx-100) / 90);
                    var py = parseInt((TouchInput.ncy-100) / 90);
                    if (px < this._selX) {
                        this._swapHappened = this._swapSelectionByDelta(-1, 0);
                    } else if (px > this._selX) {
                        this._swapHappened = this._swapSelectionByDelta(1, 0);
                    } else if (py < this._selY) {
                        this._swapHappened = this._swapSelectionByDelta(0, -1);
                    } else if (py > this._selY) {
                        this._swapHappened = this._swapSelectionByDelta(0, 1);
                    }
                }
            }
        }
        
        if (Input.isTriggered('cancel')) {
            $gameSwitches.setValue(switchID, false);
            this._exit = true;
        }
    };
    
    // Override!
    NB_MiniGameMatchThree.prototype.updateOpacity = function() {
        if (this._exit) {
            var masterDecrease = 15;
            var backgroundDecrease = 10;
            if (this._lose) {
                masterDecrease = 5;
                backgroundDecrease = 3;
            }
            if (this._masterOpacity > 0) {
                this._masterOpacity -= masterDecrease;
            }
            if (this._backgroundTint.opacity > 0) {
                this._backgroundTint.opacity -= backgroundDecrease;
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
        
        if (this._win) {
            if (this._winWait > 0) {
                this._winWait--;
            } else {
                if (!this._winFade && this._winSprite.opacity < 255) {
                    this._winSprite.opacity += 15;
                    if (this._winSprite.opacity > 100) {
                        this._exit = true;
                    }
                    if (this._winSprite.opacity == 255) {
                        this._winFade = true;
                    }
                } else if (this._winFade && this._winSprite.opacity > 0) {
                    this._winSprite.opacity -= 15;
                    if (this._winSprite.opacity < 0) {
                        this._winSprite.opacity = 0;
                    }
                }
            }
        }
        
        this._board.opacity = this._masterOpacity;
        this._selectionSprite.opacity = this._masterOpacity;
        this._setAllObjectsOpacity(this._masterOpacity);
        this._scoreSprite.opacity = this._masterOpacity;
    };
    
    // Override!
    NB_MiniGameMatchThree.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0 && this._winSprite.opacity == 0) {
            SceneManager.goto(Scene_Map);
        }
    };
    
    // Override!
    NB_MiniGameMatchThree.prototype.updateElements = function() {
        this._rebuildIfNoMoves();
        this._syncObjects();
        this._removeTotallyDestroyedObjects();
        this._objectsGravity();
        this._spawnNewObjects();
        this._animateGrab();
        this._matchPassively();
        this._controlHintTime();
        this._redrawScores();
        this._refreshTime();
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'minigame_matchthree') {
            graphicsFolder = args[0];
            definedScoresMax[0] = parseInt(args[1]);
            definedScoresMax[1] = parseInt(args[2]);
            definedScoresMax[2] = parseInt(args[3]);
            definedScoresMax[3] = parseInt(args[4]);
            definedTime = parseInt(args[5]);
            SceneManager.goto(NB_MiniGameMatchThree);
        }
    };
    
})();
