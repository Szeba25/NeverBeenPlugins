//=============================================================================
// NB_MiniGameCombine.js
//=============================================================================

/*:
 * @plugindesc Minigame to combine puzzle pieces.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    function NB_MiniGameCombine() {
        this.initialize.apply(this, arguments);
    }
    
    NB_MiniGameCombine.prototype = Object.create(NB_Interface.prototype);
    NB_MiniGameCombine.prototype.constructor = NB_MiniGameCombine;
    
    NB_MiniGameCombine.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        this._graphics = null;
    };
    
    NB_MiniGameCombine.prototype._setTo = function(piece, x, y) {
        piece.x = x;
        piece.y = y;
        piece.sprite.x = 140 + x * 160;
        piece.sprite.y = 20 + y * 190;
        piece.realX = piece.sprite.x;
        piece.realY = piece.sprite.y;
        piece.destX = piece.sprite.x;
        piece.destY = piece.sprite.y;
    };
    
    NB_MiniGameCombine.prototype._sendTo = function(piece, x, y) {
        piece.x = x;
        piece.y = y;
        piece.destX = 140 + x * 160;
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
    
    NB_MiniGameCombine.prototype.create = function() {
        this._pieces = [];
        for (var i = 1; i <= 14; i++) {
            var sprite = new Sprite(ImageManager.loadInterfaceElement('minigames/combine/stone/', ''+i, 0));
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
        this._setTo(this._pieces[0], 0, 0);
        this._setTo(this._pieces[1], 1, 0);
        this._setTo(this._pieces[2], 2, 0);
        this._setTo(this._pieces[3], 3, 0);
        this._setTo(this._pieces[4], 4, 0);
        this._setTo(this._pieces[5], 0, 1);
        this._setTo(this._pieces[6], 1, 1);
        this._setTo(this._pieces[7], 2, 1);
        this._setTo(this._pieces[8], 3, 1);
        this._setTo(this._pieces[9], 4, 1);
        this._setTo(this._pieces[10], 0, 2);
        this._setTo(this._pieces[11], 1, 2);
        this._setTo(this._pieces[12], 2, 2);
        this._setTo(this._pieces[13], 3, 2);
        NB_Interface.prototype.create.call(this);
    };
    
    NB_MiniGameCombine.prototype.updateInput = function() {
        if (Input.isTriggered('cancel')) {
            SceneManager.goto(Scene_Map);
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
    };
    
    NB_MiniGameCombine.prototype._movePieces = function(dx, dy) {
        var arr = [];
        console.log(this._pieces.length);
        for (var i = 0; i < this._pieces.length; i++) {
            if (!this._checkPieceCollision(this._pieces[i].x+dx, this._pieces[i].y+dy)) {
                arr.push(this._pieces[i]);
            }
        }
        for (var j = 0; j < arr.length; j++) {
            this._sendTo(arr[j], arr[j].x+dx, arr[j].y+dy);
        }
    };
    
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
            SceneManager.goto(NB_MiniGameCombine);
        }
    };
    
})();
