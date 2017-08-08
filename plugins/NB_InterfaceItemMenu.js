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
        /** MEMBER VARIABLES
            # flow control
            _exit
            _masterOpacity
            
            # sprites and bitmaps
            # interface
            _itemList
        */
    };
    
    NB_Interface_ItemMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '9', '10');
        this._exit = false;
        this._masterOpacity = 0;
        
        this._createList();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_ItemMenu.prototype._createList = function() {
        this._itemList = new NB_List(200, 125, 10);
        var items = $gameParty.allItems();
        for (var i = 0; i < items.length; i++) {
            this._itemList.addListElement(items[i].name);
        }
        this._itemList.addToContainer(this);
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateInput = function() {
        this._itemList.updateInput(this.isMouseActive());
        if (!this._exit) {
            if (Input.isTriggered('menu') && !this._exit) {
                this._exit = true;
            }
        }
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateOpacity = function() {
        if (this._exit) {
            if (this._masterOpacity > 0) {
                this._masterOpacity -= 15;
            }
        } else {
            if (this._masterOpacity < 255) {
                this._masterOpacity += 15;
            } else if (!this.isEnterComplete()) {
                this.makeEnterComplete();
            }
        }
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
        this._itemList.setMasterOpacity(this._masterOpacity);
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            NB_Interface.instantMainMenuFlag = true;
            NB_Interface.returnFrom = 1;
            SceneManager.goto(NB_Interface.classes['MainMenu']);
        }
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateElements = function() {
        this._itemList.update();
    };
    
})();
