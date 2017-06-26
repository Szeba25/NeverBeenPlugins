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
        this._exit = false;
    };
    
    NB_MiniGameMatchThree.prototype.create = function() {
        this.createBackground();
        this.removeChild(this._pergamen);
        this._backgroundTint.opacity = 0;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_MiniGameMatchThree.prototype.updateInput = function() {
        if (Input.isTriggered('cancel')) {
            this._exit = true;
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
    };
    
    NB_MiniGameMatchThree.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            SceneManager.goto(Scene_Map);
        }
    };
    
    NB_MiniGameMatchThree.prototype.updateElements = function() {
        
    };
    
    aliases.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliases.Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'minigame_matchthree') {
            SceneManager.goto(NB_MiniGameMatchThree);
        }
    };
    
})();
