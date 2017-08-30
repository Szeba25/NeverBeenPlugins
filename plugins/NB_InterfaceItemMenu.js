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
            _selectedCategory
            
            # sprites and bitmaps
            
            # interface
            _categories
            _itemLists
        */
    };
    
    NB_Interface_ItemMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '9', '10');
        this._title1.x = 190;
        this._title2.x = 190;
        this._exit = false;
        this._masterOpacity = 0;
        this._selectedCategory = 0;
        
        this._createCategories();
        this._createLists();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_ItemMenu.prototype._createCategories = function() {
        this._categories = new NB_ButtonGroup(true);
        this._categories.add(new NB_Button('menu_1/', 'item_1', 'menu_1/', 'item_1_light', null, null, 380, 60, 255), true);
        this._categories.add(new NB_Button('menu_1/', 'item_2', 'menu_1/', 'item_2_light', null, null, 525, 60, 255), false);
        this._categories.add(new NB_Button('menu_1/', 'item_3', 'menu_1/', 'item_3_light', null, null, 700, 60, 255), false);
        this._categories.addToContainer(this);
    };
    
    NB_Interface_ItemMenu.prototype._createLists = function() {
        this._itemLists = [];
        
        var regularList = new NB_List(200, 125, 10);
        var equipmentList = new NB_List(200, 125, 10);
        var keyList = new NB_List(200, 125, 10);
        
        var items = $gameParty.items();
        for (var i = 0; i < items.length; i++) {
            if (items[i].itypeId === 1) {
                regularList.addListElement(items[i].name);
            } else if (items[i].itypeId === 2) {
                keyList.addListElement(items[i].name);
            }
            console.log(items[i]);
        }
        
        var equips = $gameParty.equipItems();
        for (var i = 0; i < equips.length; i++) {
            equipmentList.addListElement(equips[i].name);
        }
        
        regularList.addToContainer(this);
        equipmentList.addToContainer(this);
        keyList.addToContainer(this);
        
        this._itemLists.push(regularList);
        this._itemLists.push(equipmentList);
        this._itemLists.push(keyList);
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateInput = function() {
        this._categories.updateInput(this.isMouseActive(), 'left', 'right');
        this._selectedCategory = this._categories.getActiveId();
        this._itemLists[this._selectedCategory].updateInput(this.isMouseActive());
        if (!this._exit) {
            if (this.backKeyTrigger() && !this._exit) {
                SoundManager.playCancel();
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
        this._categories.setMasterOpacity(this._masterOpacity);
        for (var i = 0; i < 3; i++) {
            if (i === this._selectedCategory) {
                this._itemLists[i].setMasterOpacity(this._masterOpacity);
            } else {
                this._itemLists[i].setMasterOpacity(0);
            }
        }
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
        this._categories.update();
        for (var i = 0; i < 3; i++) {
            this._itemLists[i].update();
        }
    };
    
})();
