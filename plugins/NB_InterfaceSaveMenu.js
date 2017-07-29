//=============================================================================
// NB_InterfaceSaveMenu.js
//=============================================================================

/*:
 * @plugindesc The in game save menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_SaveMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_SaveMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_SaveMenu.prototype.constructor = NB_Interface_SaveMenu;
    
    NB_Interface.classes['SaveMenu'] = NB_Interface_SaveMenu;
    
    NB_Interface_SaveMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
    };
    
})();
