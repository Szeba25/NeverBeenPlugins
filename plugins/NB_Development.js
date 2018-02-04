//=============================================================================
// NB_GameLoopFix.js
//=============================================================================

/*:
 * @plugindesc Plugin purely for development purposes
 * @author Scalytank
 *
 * @param showDevToolsOnStartup
 * @desc Show the javascript console on startup
 * @default false
 *
 * @param windowOffsetX
 * @desc Game window offset X
 * @default 0
 *
 * @param windowOffsetY
 * @desc Game window offset Y
 * @default 0
 *
 * @param devToolsOffsetX
 * @desc Development Tools offset X on startup
 * @default 0
 *
 * @param devToolsOffsetY
 * @desc Development Tools offset Y on startup
 * @default 0
 *
 * @param alwaysAllowCtrlPassing
 * @desc Allows passing through objects with control even if not playtesting!
 * @default false
 *
 */

(function() {
    
    var aliases = {};
    
    var parameters = PluginManager.parameters('NB_Development');
    var showDevToolsOnStartup = parameters['showDevToolsOnStartup'].toLowerCase() === 'true';
    var windowOffsetX = parseInt(parameters['windowOffsetX']);
    var windowOffsetY = parseInt(parameters['windowOffsetY']);
    var devToolsOffsetX = parseInt(parameters['devToolsOffsetX']);
    var devToolsOffsetY = parseInt(parameters['devToolsOffsetY']);
    var alwaysAllowCtrlPassing = parameters['alwaysAllowCtrlPassing'].toLowerCase() === 'true';
    
    aliases.SceneManager_initialize = SceneManager.initialize;
    SceneManager.initialize = function() {
        aliases.SceneManager_initialize.call(this);
        // Show development tools every time
        if (showDevToolsOnStartup) {
            if (Utils.isNwjs()) {
                var devWin = require('nw.gui').Window.get().showDevTools();
                // Reposition windows
                window.moveBy(windowOffsetX, windowOffsetY);
                devWin.moveBy(devToolsOffsetX, devToolsOffsetY);
                window.focus();
            }
        }
    }
    
    // Override!
    Game_Player.prototype.isDebugThrough = function() {
        return Input.isPressed('control') && ($gameTemp.isPlaytest() || alwaysAllowCtrlPassing);
    };
    
})();
