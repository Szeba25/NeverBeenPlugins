//=============================================================================
// NB_InterfaceItemMenu.js
//=============================================================================

/*:
 * @plugindesc The in game item menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_ItemMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_ItemMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_ItemMenu.prototype.constructor = NB_Interface_ItemMenu;
    
    NB_Interface.classes['ItemMenu'] = NB_Interface_ItemMenu;
    
    NB_Interface_ItemMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
    };
    
})();
