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
            _useRunsOut
            _useOpacity
            _updatedUseActorId
            _currentUsedItemData
            _currentUsedItemSchema
            _updatePartyInfoFlag
            _party
            
            # sprites and bitmaps
            _itemInfo
            _useInfo
            _partyInfo
            
            # interface
            _categories
            _itemLists
            _actorButtons
        */
    };
    
    NB_Interface_ItemMenu.prototype.create = function() {
        this._party = this.getParty();
        this._createBaseGraphics();
        this._initializeFlowControl();
        this._createCategories();
        this._createLists();
        this._createItemInfo();
        this._createUseInfo();
        this._createPartyInfo();
        this._createActorButtons();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_ItemMenu.prototype._createBaseGraphics = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '9', '10');
        this._title1.x = 190;
        this._title2.x = 190;
        this._loadBars();
        this._loadIcons();
    };
    
    NB_Interface_ItemMenu.prototype._initializeFlowControl = function() {
        this._exit = false;
        this._masterOpacity = 0;
        this._selectedCategory = 0;
        this._updatedItemId = -1;
        this._itemData = [[],[],[]];
        this._useFlag = 0;
        this._useRunsOut = false;
        this._useOpacity = 0;
        this._updatedUseActorId = -1;
        this._currentUsedItemData = null;
        this._currentUsedItemSchema = null;
        this._updatePartyInfoFlag = true;
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
        this._populateRegularAndKeyItems(regularList, keyList, this._itemData[0], this._itemData[2], dist);
        
        // Create equipment items...
        this._populateEquipmentItems(equipmentList, this._itemData[1], dist);
        
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
        this._useInfo = new Sprite(new Bitmap(470, 220));
        this._useInfo.x = 400;
        this._useInfo.y = 310;
        this.setBitmapFontStyle(this._useInfo.bitmap);
        this.addChild(this._useInfo);
    };
    
    NB_Interface_ItemMenu.prototype._createPartyInfo = function() {
        this._partyInfo = new Sprite(new Bitmap(470, 220));
        this._partyInfo.x = 420;
        this._partyInfo.y = 320;
        this.setBitmapFontStyle(this._partyInfo.bitmap);
        this.addChild(this._partyInfo);
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
    
    NB_Interface_ItemMenu.prototype._updatePartyInfo = function() {
        if (this._updatePartyInfoFlag) {
            this._updatePartyInfoFlag = false;
            
            var bmp = this._partyInfo.bitmap;
            bmp.clear();
            
            // loop through all party members, and draw their status bars
            for (var i = 0; i < this._party.length; i++) {
                var x = 20;
                var iy = i;
                if (i >= 4) {
                    x = 270;
                    iy -= 4;
                } else if (i >= 2) {
                    x = 150;
                    iy -= 2;
                }
                bmp.drawText(this._party[i].name(), x, 0 + iy*100, null, NB_Interface.lineHeight, 'left');
                this._drawAllStatusBarsMini(this._party[i], bmp, x, 30 + iy*100);
                this._drawStatusEffects(this._party[i], bmp, x, 80 + iy*100, true);
            }
        }
    };
    
    NB_Interface_ItemMenu.prototype._updateItemInfo = function() {
        if (this._updatedItemId !== this._itemLists[this._selectedCategory].getActiveId()) {
            this._updatedItemId = this._itemLists[this._selectedCategory].getActiveId();
            
            var bmp = this._itemInfo.bitmap;
            bmp.clear();
            
            if (this._updatedItemId >= 0 && !this._itemLists[this._selectedCategory].isEmpty()) {
                var elem = this._itemData[this._selectedCategory][this._updatedItemId];
                var currentSchema = null;
                if (elem.type === 0) {
                    // This element is a regular item
                    currentSchema = this.getItemSchema(elem.id);
                } else if (elem.type === 1) {
                    // This element is a weapon
                    currentSchema = this.getWeaponSchema(elem.id);
                } else {
                    // This element is an armor
                    currentSchema = this.getArmorSchema(elem.id);
                }
                bmp.drawText('Name: ' + currentSchema.name, 0, 0, null, NB_Interface.lineHeight, 'left');
                bmp.drawText('Price: ' + currentSchema.price, 0, 25, null, NB_Interface.lineHeight, 'left');
                var desc = this._splitToLines(currentSchema.note);
                bmp.fontSize = NB_Interface.fontSize-3;
                for (var i = 0; i < desc.length; i++) {
                    bmp.drawText(desc[i], 15, 70 + i*22, null, NB_Interface.lineHeight, 'left');
                }
                if (elem.type === 0) {
                    if (this._isCommonEventTrigger(currentSchema)) {
                        bmp.fontSize = NB_Interface.fontSize+5;
                    } else if (currentSchema.scope === 8) {
                        bmp.fontSize = NB_Interface.fontSize+3;
                        bmp.drawText('Affects everyone in the party:', 0, 165, null, NB_Interface.lineHeight, 'left');
                    }
                }
                bmp.fontSize = NB_Interface.fontSize;
            }
        }
    };
    
    NB_Interface_ItemMenu.prototype._updateUseInfo = function() {
        if (this._useFlag !== 0 && this._updatedUseActorId !== this._actorButtons.getActiveId()) {
            this._updatedUseActorId = this._actorButtons.getActiveId();
            
            var bmp = this._useInfo.bitmap;
            bmp.clear();
            
            var actor = this._party[this._updatedUseActorId];
            
            bmp.fontSize = NB_Interface.fontSize + 5;
            bmp.drawText('Use item on:', 0, 0, null, NB_Interface.lineHeight, 'left');
            bmp.fontSize = NB_Interface.fontSize;
            
            bmp.drawText('Health:', 160, 40, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Magic skill:', 160, 65, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Power:', 160, 90, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Defense:', 160, 115, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Initiative:', 160, 140, null, NB_Interface.lineHeight, 'left');
            
            this._drawAllStatusBars(actor, bmp, 260, 50);
            this._drawStatusEffects(actor, bmp, 160, 175);
        }
    };
    
    NB_Interface_ItemMenu.prototype._useCurrentItem = function(target) {
        // Target is the target actor!
        var data = this._currentUsedItemData;
        var schema = this._currentUsedItemSchema;
        var itemEffect = new NB_ItemEffect(schema);
        
        // Consume item, and remove from the list...
        if (schema.consumable) {
            data.count -= 1;
            this._itemLists[this._selectedCategory].getActiveElement().decreaseCount();
            this.consumeItem(schema);
        }
        
        if (target) {
            // Only manipulate the interface if there was a target!
            itemEffect.apply(target.nbStats());
            if (data.count <= 0) {
                this._itemLists[this._selectedCategory].invalidateActive();
                this._useRunsOut = true;
            }
        } else {
            if (this._triggerCommonEventAction(schema)) {
                // All allies scope, first effect is common event
                this._useFlag = 2;
                this._exit = true;
            } else {
                // All allies scope, no common event
                for (var i = 0; i < this._party.length; i++) {
                    itemEffect.apply(this._party[i].nbStats());
                }
                if (data.count <= 0) {
                    this._updatedItemId = -2; // force item info clearing
                    this._useRunsOut = true;
                }
            }
            
        }
    };
    
    NB_Interface_ItemMenu.prototype._updateMainInput = function() {
        this._categories.updateInput(this.isMouseActive(), 'left', 'right');
        
        if (this._selectedCategory != this._categories.getActiveId()) {
            this._selectedCategory = this._categories.getActiveId();
            this._updatedItemId = -2; // force item info clearing
        }
        
        if (!this._exit) {
            if (this.backKeyTrigger() && !this._exit) {
                SoundManager.playCancel();
                this._exit = true;
            }
        }
        
        if (this.okKeyTrigger(this._itemLists[this._selectedCategory])) {
            if (this._selectedCategory !== 1 && !this._itemLists[this._selectedCategory].isEmpty()) {
                // Use the item!
                
                this._currentUsedItemData = this._getCurrentSelectedItemData();
                this._currentUsedItemSchema = this._getCurrentSelectedItemSchema();
                
                if (this._currentUsedItemSchema.scope === 7) {
                    // One ally! (scope == 7)
                    SoundManager.playOk();
                    this._useFlag = 1;
                    this._useRunsOut = false;
                    this._updatedUseActorId = -1;
                    this._actorButtons.setActive(0);
                    this._itemLists[this._selectedCategory].invalidateAllButActive();
                } else if (this._currentUsedItemSchema.scope === 8) {
                    // All allies! (scope == 8)
                    SoundManager.playOk();
                    this._updatePartyInfoFlag = true;
                    this._useRunsOut = false;
                    this._useCurrentItem();
                    this._removeIfNoMoreAvailable();
                } else {
                    // Other...
                    SoundManager.playBuzzer();
                }
            } else {
                // Other...
                SoundManager.playBuzzer();
            }
        }
        
        this._itemLists[this._selectedCategory].updateInput(this.isMouseActive());
    };
    
    NB_Interface_ItemMenu.prototype._getCurrentSelectedItemData = function() {
        return this._itemData[this._selectedCategory][this._itemLists[this._selectedCategory].getActiveId()];
    };
    
    NB_Interface_ItemMenu.prototype._getCurrentSelectedItemSchema = function() {
        return this.getItemSchema(this._getCurrentSelectedItemData().id);
    };
    
    NB_Interface_ItemMenu.prototype._updateUseInput = function() {
        if (this.okKeyTrigger(this._actorButtons) && !this._useRunsOut) {
            SoundManager.playOk();
            this._useCurrentItem(this._party[this._actorButtons.getActiveId()]);
            this._updatedUseActorId = -1;
            this._updatePartyInfoFlag = true;
        }
        if (this.backKeyTrigger()) {
            SoundManager.playCancel();
            this._useFlag = 0;
            this._removeIfNoMoreAvailable();
            this._itemLists[this._selectedCategory].validateAll();
        }
        this._actorButtons.updateInput(this.isMouseActive());
    };
    
    NB_Interface_ItemMenu.prototype._removeIfNoMoreAvailable = function() {
        if (this._useRunsOut) {
            var id = this._itemLists[this._selectedCategory].getActiveId();
            this._itemLists[this._selectedCategory].removeActiveElement();
            this._itemData[this._selectedCategory].splice(id, 1);
            this._updatedItemId = -2; // force item info clearing
        }
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateInput = function() {
        if (this._useFlag === 0) {
            this._updateMainInput();
        } else if (this._useFlag === 1) {
            this._updateUseInput();
        } else {
            // No input!
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
        
        if (this._useFlag === 0) {
            if (this._useOpacity > 0) this._useOpacity -= 15;
        } if (this._useFlag === 1) {
            if (this._useOpacity < 255) this._useOpacity += 15;
        } else if (this._useFlag === 2) {
            if (this._useOpacity > 0) this._useOpacity -= 15
            this._pergamen.opacity = this._masterOpacity;
            this._backgroundTint.opacity = (this._masterOpacity/255) * 130;
        }
        
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
        this._categories.setMasterOpacity(this._masterOpacity);
        this._itemInfo.opacity = this._masterOpacity;
        this._actorButtons.setMasterOpacity(this._useOpacity * (this._masterOpacity/255));
        this._useInfo.opacity = this._useOpacity * (this._masterOpacity/255);
        
        if (!this._itemLists[this._selectedCategory].isEmpty() &&
            !this._isCommonEventTrigger(this._getCurrentSelectedItemSchema()) && this._getCurrentSelectedItemSchema().scope === 8) {
            this._partyInfo.opacity = 255 * (this._masterOpacity/255);
        } else {
            this._partyInfo.opacity = 0;
        }
        
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
            if (this._useFlag !== 2) {
                NB_Interface.instantMainMenuFlag = true;
                NB_Interface.returnFrom = 1;
                SceneManager.goto(NB_Interface.classes['MainMenu']);
            } else {
                SceneManager.goto(Scene_Map);
            }
        }
    };
    
    // Override!
    NB_Interface_ItemMenu.prototype.updateElements = function() {
        this._categories.update();
        for (var i = 0; i < 3; i++) {
            this._itemLists[i].update();
        }
        this._updatePartyInfo();
        this._updateItemInfo();
        this._updateUseInfo();
        this._actorButtons.update();
    };
    
})();
