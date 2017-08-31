//=============================================================================
// NB_InterfaceCharMenu.js
//=============================================================================

/*:
 * @plugindesc The in game char menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_CharMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_CharMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_CharMenu.prototype.constructor = NB_Interface_CharMenu;
    
    NB_Interface.classes['CharMenu'] = NB_Interface_CharMenu;
    
    NB_Interface_CharMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            # flow control
            _exit
            _masterOpacity
            _characterFaceFadeOpacity
            _currentChar
            _currentCharUpdated
            _characterEntered
            _subCategoryFadeOpacity
            _characterInfoOpacity
            _skillsSubOpacity
            _equipmentSubOpacity
            
            # sprites and bitmaps
            _characterInfo
            _characterFace
            
            # data
            _party
            
            # interface elements
            _actorButtons
            _subCategoryButtons
            _equipmentList
            _equipmentNames
            
            # bar bitmaps
            bar
            bar_hp
            bar_mp
            bar_def
            bar_atk
        */
    };
    
    NB_Interface_CharMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '11', '12');
        this._loadBars();
        this._setupActors();
        
        this._masterOpacity = 0;
        this._exit = false;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_CharMenu.prototype._loadBars = function() {
        this.bar = ImageManager.loadInterfaceElement('menu_1/', 'bar');
        this.bar_hp = ImageManager.loadInterfaceElement('menu_1/', 'bar_hp');
        this.bar_mp = ImageManager.loadInterfaceElement('menu_1/', 'bar_mp');
        this.bar_def = ImageManager.loadInterfaceElement('menu_1/', 'bar_def');
        this.bar_atk = ImageManager.loadInterfaceElement('menu_1/', 'bar_atk');
    };
    
    NB_Interface_CharMenu.prototype._generateBar = function(current, max, width, height, original) {
        var ow = (current / max) * width;
        var bitmap = new Bitmap(width, height);
        bitmap.blt(original, 0, 0, width, height, 0, 0, width, height);
        bitmap.clearRect(ow, 0, width, height);
        return bitmap;
    };
    
    NB_Interface_CharMenu.prototype._drawStatusBars = function(actor, bmp, x, y) {
        // HP
        bmp.blt(this._generateBar(actor.hp, actor.mhp, 200, 15, this.bar_hp), 0, 0, 200, 15, x, y, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, x, y, 200, 15);
        // MP
        bmp.blt(this._generateBar(actor.mp, actor.mmp, 200, 15, this.bar_mp), 0, 0, 200, 15, x, y + 25, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, x, y + 25, 200, 15);
        // ATK
        bmp.blt(this._generateBar(actor.atk, 100, 200, 15, this.bar_atk), 0, 0, 200, 15, x, y + 50, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, x, y + 50, 200, 15);
        // DEF
        bmp.blt(this._generateBar(actor.def, 100, 200, 15, this.bar_def), 0, 0, 200, 15, x, y + 75, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, x, y + 75, 200, 15);
    };
    
    NB_Interface_CharMenu.prototype._printEquipment = function(actor) {
        for (var i = 0; i < 5; i++) {
            var equip = actor.equips()[i];
            if (equip != null) {
                
            }
        }
        console.log(actor.equips());
    };
    
    NB_Interface_CharMenu.prototype._updateCharacterInfo = function() {
        if (this._currentCharUpdated != this._currentChar) {
            this._currentCharUpdated = this._currentChar;
            // Gather data
            var actor = this._party[this._currentChar];
            var actorData = $dataActors[actor.actorId()];
            var bio = actorData.note.split(/\r?\n/);
            var bmp = this._characterInfo.bitmap;
            // Set face
            this._characterFace.bitmap = ImageManager.loadInterfaceElement('menu_1/chars/', 'face'+actor.actorId());
            this._characterFace.opacity = 0;
            this._characterFace.x = 315;
            this._characterFaceFadeOpacity = 0;
            // Draw!
            bmp.clear();
            
            // Draw status bars
            var start_y = 25;
            bmp.drawText('Életerő:', 0, start_y, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Energia:', 0, start_y + 25, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Támadás:', 0, start_y + 50, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Védekezés:', 0, start_y + 75, null, NB_Interface.lineHeight, 'left');
            this._drawStatusBars(actor, bmp, 100, start_y+10);
            
            // Draw biography
            for (var i = 0; i < bio.length; i++) {
                bmp.drawText(bio[i], 0, 150 + (i*20), null, NB_Interface.lineHeight, 'left');
            }
        }
    };
    
    NB_Interface_CharMenu.prototype._setupActors = function() {
        // Actor variables
        this._currentChar = 0;
        this._currentCharUpdated = -1;
        this._characterEntered = 0;
        this._characterFaceFadeOpacity = 0;
        this._subCategoryFadeOpacity = 0;
        this._characterInfoOpacity = 255;
        this._skillsSubOpacity = 0;
        this._equipmentSubOpacity = 0;
        this._party = $gameParty.allMembers();
        // Buttons and other data
        this._actorButtons = new NB_ButtonGroup(true);
        for (var i = 0; i < this._party.length; i++) {
            this._actorButtons.add(new NB_Button('menu_1/chars/', 'name'+this._party[i].actorId(), 
                                                 'menu_1/chars/', 'name'+this._party[i].actorId()+'sh',
                                                 null, null, 210, 140+(i*46)));
        }
        this._actorButtons.addToContainer(this);
        
        this._subCategoryButtons = new NB_ButtonGroup(false);
        
        this._subCategoryButtons.add(new NB_Button('menu_1/', 'char_1', 'menu_1/', 'char_1_light', null, null, 690, 42));
        this._subCategoryButtons.add(new NB_Button('menu_1/', 'char_2', 'menu_1/', 'char_2_light', null, null, 684, 42));
        this._subCategoryButtons.addToContainer(this);
        
        this._equipmentList = new NB_List(560, 125, 5);
        this._equipmentList.addListElement("Fegyver:");
        this._equipmentList.addListElement("Pajzs:");
        this._equipmentList.addListElement("Sisak:");
        this._equipmentList.addListElement("Vért:");
        this._equipmentList.addListElement("Kiegészítő:");
        this._equipmentList.addToContainer(this);
        
        this._equipmentNames = new NB_List(50, 50, 5);
        this._equipmentNames.addToContainer(this);
        
        this._characterFace = new Sprite();
        this._characterFace.y = 100;
        this.addChild(this._characterFace);
        
        this._characterInfo = new Sprite();
        this._characterInfo.x = 560;
        this._characterInfo.y = 125;
        this._characterInfo.bitmap = new Bitmap(400, 400);
        this.setBitmapFontStyle(this._characterInfo.bitmap);
        
        this.addChild(this._characterInfo);
    };
    
    NB_Interface_CharMenu.prototype._prepareSubCategoryButtonsLerp = function(resetSelection) {
        this._subCategoryButtons.unFade();
        if (resetSelection) this._subCategoryButtons.setActive(0);
        this._subCategoryButtons.get(1).setLerpAlpha(0.3);
        this._subCategoryButtons.get(1).setPosition(684, 42);
        this._subCategoryButtons.get(1).setTarget(684, 80);
    };
    
    NB_Interface_CharMenu.prototype._enterCharacterTrigger = function() {
        SoundManager.playOk();
        this._prepareSubCategoryButtonsLerp(true);
        this._actorButtons.invalidateAllButActive();
        this._characterEntered = 1;
    };
    
    NB_Interface_CharMenu.prototype._leaveCharacterTrigger = function() {
        SoundManager.playCancel();
        this._actorButtons.validateAll();
        this._characterEntered = 0;
    };
    
    NB_Interface_CharMenu.prototype._enterSkillsTrigger = function() {
        SoundManager.playOk();
        this._characterEntered = 2;
    };
    
    NB_Interface_CharMenu.prototype._leaveSkillsTrigger = function() {
        SoundManager.playCancel();
        this._prepareSubCategoryButtonsLerp(false);
        this._characterEntered = 1;
    };
    
    NB_Interface_CharMenu.prototype._enterEquipmentTrigger = function() {
        SoundManager.playOk();
        this._printEquipment(this._party[this._currentChar]);
        this._characterEntered = 3;
    };
    
    NB_Interface_CharMenu.prototype._leaveEquipmentTrigger = function() {
        SoundManager.playCancel();
        this._prepareSubCategoryButtonsLerp(false);
        this._characterEntered = 1;
    };
    
    NB_Interface_CharMenu.prototype._mainInput = function() {
        if (this.backKeyTrigger() && !this._exit) {
            SoundManager.playCancel();
            this._exit = true;
        }
        if (this.okKeyTrigger(this._actorButtons) && !this._exit) {
            this._enterCharacterTrigger();
        }
        this._actorButtons.updateInput(this.isMouseActive());
    };
    
    NB_Interface_CharMenu.prototype._subSelectionInput = function() {
        if (this.backKeyTrigger()) {
            this._leaveCharacterTrigger();
        }
        if (this.okKeyTrigger(this._subCategoryButtons)) {
            var id = this._subCategoryButtons.trigger(true);
            this._subCategoryButtons.fade();
            if (id == 0) {
                this._enterSkillsTrigger();
            } else {
                this._enterEquipmentTrigger();
            }
        }
        this._subCategoryButtons.updateInput(this.isMouseActive());
    };
    
    NB_Interface_CharMenu.prototype._skillsInput = function() {
        if (this.backKeyTrigger()) {
            this._leaveSkillsTrigger();
        }
    };
    
    NB_Interface_CharMenu.prototype._equipmentInput = function() {
        this._equipmentList.updateInput(this.isMouseActive());
        if (this.backKeyTrigger()) {
            this._leaveEquipmentTrigger();
        }
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateInput = function() {
        this._currentChar = this._actorButtons.getActiveId();
        // Branch by menu state
        switch (this._characterEntered) {
            case 0:
                this._mainInput();
                break;
            case 1:
                this._subSelectionInput();
                break;
            case 2:
                this._skillsInput();
                break;
            case 3:
                this._equipmentInput();
                break;
        }
    };
    
    NB_Interface_CharMenu.prototype._decreaseOpacity = function(variable) {
        if (variable > 0) {
            variable -= 15;
        }
        return variable;
    };
    
    NB_Interface_CharMenu.prototype._increaseOpacity = function(variable, wait1, wait2) {
        if (wait1 && wait1 > 0) return variable;
        if (wait2 && wait2 > 0) return variable;
        if (variable < 255) {
            variable += 15;
        }
        return variable;
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateOpacity = function() {
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
        this._actorButtons.setMasterOpacity(this._masterOpacity);
        this._subCategoryButtons.setMasterOpacity(this._masterOpacity);
        
        switch (this._characterEntered) {
            case 0:
                this._characterInfoOpacity = this._increaseOpacity(this._characterInfoOpacity,
                                                                   this._skillsSubOpacity, this._equipmentSubOpacity);
                this._subCategoryFadeOpacity = this._decreaseOpacity(this._subCategoryFadeOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                break;
            case 1:
                this._characterInfoOpacity = this._increaseOpacity(this._characterInfoOpacity, 
                                                                   this._skillsSubOpacity, this._equipmentSubOpacity);
                this._subCategoryFadeOpacity = this._increaseOpacity(this._subCategoryFadeOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                break;
            case 2:
                this._characterInfoOpacity = this._decreaseOpacity(this._characterInfoOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                this._skillsSubOpacity = this._increaseOpacity(this._skillsSubOpacity, this._characterInfoOpacity);
                break;
            case 3:
                this._characterInfoOpacity = this._decreaseOpacity(this._characterInfoOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._increaseOpacity(this._equipmentSubOpacity, this._characterInfoOpacity);
                break;
        }
        this._characterInfo.opacity = this._characterInfoOpacity * (this._masterOpacity / 255);
        this._subCategoryButtons.setMasterOpacity(this._subCategoryFadeOpacity * (this._masterOpacity / 255));
        this._equipmentList.setMasterOpacity(this._equipmentSubOpacity * (this._masterOpacity / 255));
        this._equipmentNames.setMasterOpacity(this._equipmentSubOpacity * (this._masterOpacity / 255));
        
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFaceFadeOpacity += 15;
        }
        this._characterFace.opacity = this._characterFaceFadeOpacity * (this._masterOpacity / 255);
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            NB_Interface.instantMainMenuFlag = true;
            NB_Interface.returnFrom = 0;
            SceneManager.goto(NB_Interface.classes['MainMenu']);
        }
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateElements = function() {
        this._actorButtons.update();
        this._subCategoryButtons.update();
        this._updateCharacterInfo();
        this._equipmentList.update();
        this._equipmentNames.update();
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFace.x += (255-this._characterFaceFadeOpacity)/60;
        }
    };
    
})();
