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
            _updatedItemId
            _itemData
            _useFlag
            _useOpacity
            _party
            _updatedUseActorId
            _currentUsedItemData
            _currentUsedItemSchema
            
            # sprites and bitmaps
            _itemInfo
            _useInfo
            
            # interface
            _categories
            _itemLists
            _actorButtons
        */
    };
    
    NB_Interface_ItemMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '9', '10');
        this._title1.x = 190;
        this._title2.x = 190;
        this._loadBars();
        this._exit = false;
        this._masterOpacity = 0;
        
        this._selectedCategory = 0;
        this._updatedItemId = -1;
        this._itemData = [[],[],[]];
        this._useFlag = 0;
        this._useOpacity = 0;
        this._party = this.getParty();
        this._updatedUseActorId = -1;
        
        this._createCategories();
        this._createLists();
        this._createItemInfo();
        this._createUseInfo();
        this._createActorButtons();
        
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
        
        var regularList = new NB_List(185, 125, 12);
        var equipmentList = new NB_List(185, 125, 12);
        var keyList = new NB_List(185, 125, 12);
        var dist = 172;
        
        // Create regular or key items...
        var items = $gameParty.items();
        for (var i = 0; i < items.length; i++) {
            var itemd = {};
            itemd['id'] = items[i].id;
            itemd['count'] = $gameParty.numItems(items[i]);
            if (items[i].itypeId === 1) {
                regularList.addCountedListElement(items[i].name, itemd['count'], dist);
                this._itemData[0].push(itemd);
            } else if (items[i].itypeId === 2) {
                keyList.addCountedListElement(items[i].name, itemd['count'], dist);
                this._itemData[2].push(itemd);
            }
        }
        
        // Create equipment items...
        var equips = $gameParty.equipItems();
        for (var i = 0; i < equips.length; i++) {
            var equd = {};
            equd['id'] = equips[i].id;
            equd['count'] = $gameParty.numItems(equips[i]);
            equipmentList.addCountedListElement(equips[i].name, equd['count'], dist);
            this._itemData[1].push(itemd);
        }
        
        regularList.addToContainer(this);
        equipmentList.addToContainer(this);
        keyList.addToContainer(this);
        
        this._itemLists.push(regularList);
        this._itemLists.push(equipmentList);
        this._itemLists.push(keyList);
    };
    
    NB_Interface_ItemMenu.prototype._createItemInfo = function() {
        this._itemInfo = new Sprite(new Bitmap(450, 200));
        this._itemInfo.x = 420;
        this._itemInfo.y = 120;
        this.setBitmapFontStyle(this._itemInfo.bitmap);
        this.addChild(this._itemInfo);
    };
    
    NB_Interface_ItemMenu.prototype._createUseInfo = function() {
        this._useInfo = new Sprite(new Bitmap(470, 200));
        this._useInfo.x = 400;
        this._useInfo.y = 310;
        this.setBitmapFontStyle(this._useInfo.bitmap);
        this.addChild(this._useInfo);
    };
    
    NB_Interface_ItemMenu.prototype._createActorButtons = function() {
        this._actorButtons = new NB_ButtonGroup(true);
        for (var i = 0; i < this._party.length; i++) {
            this._actorButtons.add(new NB_Button('menu_1/chars/', 'name'+this._party[i].actorId(), 
                                                 'menu_1/chars/', 'name'+this._party[i].actorId()+'sh',
                                                 null, null, 405, 360+(i*40)));
        }
        this._actorButtons.addToContainer(this);  
    };
    
    NB_Interface_ItemMenu.prototype._updateItemInfo = function() {
        if (this._updatedItemId !== this._itemLists[this._selectedCategory].getActiveId()) {
            this._updatedItemId = this._itemLists[this._selectedCategory].getActiveId();
            var bmp = this._itemInfo.bitmap;
            
            bmp.clear();
            if (this._updatedItemId >= 0 && !this._itemLists[this._selectedCategory].isEmpty()) {
                var elem = this._itemData[this._selectedCategory][this._updatedItemId];
                if (this._selectedCategory !== 1) {
                    // Regular and key items!
                    var item = $dataItems[elem.id];
                    bmp.drawText('Name: ' + item.name, 0, 0, null, NB_Interface.lineHeight, 'left');
                    bmp.drawText('Price: ' + item.price, 0, 25, null, NB_Interface.lineHeight, 'left');
                    var desc = item.note.split(/\r?\n/);
                    bmp.fontSize = NB_Interface.fontSize-3;
                    for (var i = 0; i < desc.length; i++) {
                        bmp.drawText(desc[i], 15, 70 + i*22, null, NB_Interface.lineHeight, 'left');
                    }
                    bmp.fontSize = NB_Interface.fontSize;
                } else {
                    // Equipment!
                }
            }
        }
    };
    
    NB_Interface_ItemMenu.prototype._updateUseInfo = function() {
        if (this._useFlag !== 0 && this._updatedUseActorId !== this._actorButtons.getActiveId()) {
            this._updatedUseActorId = this._actorButtons.getActiveId();
            var bmp = this._useInfo.bitmap;
            var actor = this._party[this._updatedUseActorId];
            bmp.clear();
            
            bmp.fontSize = NB_Interface.fontSize + 5;
            bmp.drawText('Use item on:', 0, 0, null, NB_Interface.lineHeight, 'left');
            bmp.fontSize = NB_Interface.fontSize;
            
            bmp.drawText('Health:', 160, 40, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Spellpower:', 160, 65, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Attack:', 160, 90, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Defense:', 160, 115, null, NB_Interface.lineHeight, 'left');
            
            this._drawStatusBars(actor, bmp, 260, 50);
        }
    };
    
    NB_Interface_ItemMenu.prototype._useCurrentItem = function(target) {
        // Target is the target actor!
        var data = this._currentUsedItemData;
        var schema = this._currentUsedItemSchema;
        console.log(data);
        console.log(schema);
        $gameParty.consumeItem(schema);
    };
    
    NB_Interface_ItemMenu.prototype._updateMainInput = function() {
        this._categories.updateInput(this.isMouseActive(), 'left', 'right');
        
        if (this._selectedCategory != this._categories.getActiveId()) {
            this._selectedCategory = this._categories.getActiveId();
            this._updatedItemId = -1;
        }
        
        if (!this._exit) {
            if (this.backKeyTrigger() && !this._exit) {
                SoundManager.playCancel();
                this._exit = true;
            }
        }
        
        if (this._selectedCategory !== 1 &&
            !this._itemLists[this._selectedCategory].isEmpty() && 
            this.okKeyTrigger(this._itemLists[this._selectedCategory])) {
            
            // Use the item!
            SoundManager.playOk();
            this._useFlag = 1;
            this._updatedUseActorId = -1;
            this._actorButtons.setActive(0);
            this._itemLists[this._selectedCategory].invalidateAllButActive();
            this._currentUsedItemData = this._itemData[this._selectedCategory][this._itemLists[this._selectedCategory].getActiveId()];
            this._currentUsedItemSchema = $dataItems[this._currentUsedItemData.id];
        }
        
        this._itemLists[this._selectedCategory].updateInput(this.isMouseActive());
    };
    
    NB_Interface_ItemMenu.prototype._updateUseInput = function() {
        if (this.okKeyTrigger(this._actorButtons)) {
            SoundManager.playOk();
            this._useCurrentItem(this._party[this._actorButtons.getActiveId()]);
            this._useFlag = 0;
            this._itemLists[this._selectedCategory].validateAll();
        }
        if (this.backKeyTrigger()) {
            SoundManager.playCancel();
            this._useFlag = 0;
            this._itemLists[this._selectedCategory].validateAll();
        }
        this._actorButtons.updateInput(this.isMouseActive());
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateInput = function() {
        if (this._useFlag === 0) {
            this._updateMainInput();
        } else {
            this._updateUseInput();
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
        
        if (this._useFlag !== 0) {
            if (this._useOpacity < 255) this._useOpacity += 15;
        } else {
            if (this._useOpacity > 0) this._useOpacity -= 15;
        }
        
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
        this._categories.setMasterOpacity(this._masterOpacity);
        this._itemInfo.opacity = this._masterOpacity;
        this._actorButtons.setMasterOpacity(this._useOpacity * (this._masterOpacity/255));
        this._useInfo.opacity = this._useOpacity * (this._masterOpacity/255);
        
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
        this._updateItemInfo();
        this._updateUseInfo();
        this._actorButtons.update();
    };
    
})();
