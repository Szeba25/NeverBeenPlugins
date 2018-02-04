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
            _updatedSkillId
            
            # sprites and bitmaps
            _skillInfo
            _characterInfo
            _characterFace
            
            # data
            _party
            
            # interface elements
            _actorButtons
            _subCategoryButtons
            _equipmentList
            _equipmentNames
            _skillGrid
        */
    };
    
    NB_Interface_CharMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(0, '11', '12');
        this._loadBars();
        this._loadIcons();
        this._setupActors();
        
        this._masterOpacity = 0;
        this._exit = false;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_CharMenu.prototype._prepareSkills = function(actor) {
        for (var i = 0; i < 9; i++) {
            this._skillGrid.get(i).getLowerCanvasBitmap().clear();
        }
        
        var skills = actor.skills();
        
        for (var i = 0; i < skills.length; i++) {
            var iconIndex = skills[i].iconIndex + 1;
            var sx = iconIndex % 16 * 32;
            var sy = Math.floor(iconIndex / 16) * 32;
            this._skillGrid.get(i).getLowerCanvasBitmap().blt(this._iconSet, sx, sy, 64, 64, 8, 8);
        }
    };
    
    NB_Interface_CharMenu.prototype._printEquipment = function(actor) {
        for (var i = 0; i < 5; i++) {
            
        }
    };
    
    NB_Interface_CharMenu.prototype._updateCharacterInfo = function() {
        if (this._currentCharUpdated !== this._currentChar) {
            this._currentCharUpdated = this._currentChar;
            // Gather data
            var actor = this._party[this._currentChar];
            var actorData = $dataActors[actor.actorId()];
            var bio = this._splitToLines(actorData.note);
            var bmp = this._characterInfo.bitmap;
            // Set face
            this._characterFace.bitmap = ImageManager.loadInterfaceElement('menu_1/chars/', 'face'+actor.actorId());
            this._characterFace.opacity = 0;
            this._characterFace.x = 315;
            this._characterFaceFadeOpacity = 0;
            // Draw!
            bmp.clear();
            // Draw status bars
            var start_y = 5;
            bmp.drawText('Health:', 0, start_y, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Magic skill:', 0, start_y + 25, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Power:', 0, start_y + 50, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Defense:', 0, start_y + 75, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Initiative:', 0, start_y + 100, null, NB_Interface.lineHeight, 'left');
            this._drawAllStatusBars(actor, bmp, 100, start_y+10);
            this._drawStatusEffects(actor, bmp, 0, start_y+135);
            
            // Draw biography
            bmp.fontSize = NB_Interface.fontSize-3;
            for (var i = 0; i < bio.length; i++) {
                bmp.drawText(bio[i], 0, start_y + 175 + (i*22), null, NB_Interface.lineHeight, 'left');
            }
            bmp.fontSize = NB_Interface.fontSize;
        }
    };
    
    NB_Interface_CharMenu.prototype._updateSkillsInfo = function() {
        if (this._updatedSkillId !== this._skillGrid.getActiveId()) {
            this._updatedSkillId = this._skillGrid.getActiveId();
            var bmp = this._skillInfo.bitmap;
            var actor = this._party[this._currentChar];
            var skills = actor.skills();
            bmp.clear();
            if (this._updatedSkillId < skills.length) {
                var skill = skills[this._updatedSkillId];
                var desc = this._splitToLines($dataSkills[skill.id].note);
                // Draw description
                bmp.drawText('Name: ' + skill.name, 0, 0, null, NB_Interface.lineHeight, 'left');
                bmp.drawText('Cost: ' + skill.mpCost, 220, 0, null, NB_Interface.lineHeight, 'left');
                for (var i = 0; i < desc.length; i++) {
                    bmp.drawText(desc[i], 0, 35 + (i*22), null, NB_Interface.lineHeight, 'left');
                }
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
        this._updatedSkillId = -1;
        this._party = this.getParty();
        
        // Buttons and other data
        this._actorButtons = new NB_ButtonGroup(true);
        for (var i = 0; i < this._party.length; i++) {
            this._actorButtons.add(new NB_Button('menu_1/chars/', 'name'+this._party[i].actorId(), 
                                                 'menu_1/chars/', 'name'+this._party[i].actorId()+'sh',
                                                 null, null, 210, 140+(i*46)));
        }
        this._actorButtons.addToContainer(this);
        
        this._subCategoryButtons = new NB_ButtonGroup(false);
        
        this._subCategoryButtons.add(new NB_Button('menu_1/', 'char_1', 'menu_1/', 'char_1_light', null, null, 650, 30));
        this._subCategoryButtons.add(new NB_Button('menu_1/', 'char_2', 'menu_1/', 'char_2_light', null, null, 644, 30));
        this._subCategoryButtons.addToContainer(this);
        
        this._equipmentList = new NB_List(560, 125, 5);
        this._equipmentList.addListElement("Weapon:");
        this._equipmentList.addListElement("Shield:");
        this._equipmentList.addListElement("Helmet:");
        this._equipmentList.addListElement("Armor:");
        this._equipmentList.addListElement("Accessory:");
        this._equipmentList.addToContainer(this);
        
        this._equipmentNames = new NB_List(50, 50, 5);
        this._equipmentNames.addToContainer(this);
        
        this._skillGrid = new NB_ButtonGrid(true, 3, 3);
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                this._skillGrid.add(new NB_CanvasButton('menu_1/chars/', 'spell_icon_bkg', 'menu_1/chars/', 'spell_icon_select', 
                                                  78, 75, 600 + x*70, 80 + y*70));
            }
        }
        this._skillGrid.addToContainer(this);
        
        this._skillInfo = new Sprite();
        this._skillInfo.x = 580;
        this._skillInfo.y = 300;
        this._skillInfo.bitmap = new Bitmap(300, 220);
        this.setBitmapFontStyle(this._skillInfo.bitmap);
        this.addChild(this._skillInfo);
        
        this._characterFace = new Sprite();
        this._characterFace.y = 100;
        this.addChild(this._characterFace);
        
        this._characterInfo = new Sprite();
        this._characterInfo.x = 560;
        this._characterInfo.y = 125;
        this._characterInfo.bitmap = new Bitmap(350, 370);
        this.setBitmapFontStyle(this._characterInfo.bitmap);
        this.addChild(this._characterInfo);
    };
    
    NB_Interface_CharMenu.prototype._prepareSubCategoryButtonsLerp = function(resetSelection) {
        this._subCategoryButtons.unFade();
        if (resetSelection) this._subCategoryButtons.setActive(0);
        this._subCategoryButtons.get(1).setLerpAlpha(0.3);
        this._subCategoryButtons.get(1).setPosition(644, 42);
        this._subCategoryButtons.get(1).setTarget(644, 68);
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
        this._updatedSkillId = -1;
        this._prepareSkills(this._party[this._currentChar]);
        this._skillGrid.setActive(0);
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
        if (this.okKeyTrigger(this._skillGrid)) {
            this._useSkill(this._party[this._currentChar], this._skillGrid.getActiveId());
        }
        this._skillGrid.updateInput(this.isMouseActive());
        if (this.backKeyTrigger()) {
            this._leaveSkillsTrigger();
        }
    };
    
    NB_Interface_CharMenu.prototype._useSkill = function(actor, activeId) {
        var skills = actor.skills();
        if (activeId < skills.length) {
            SoundManager.playOk();
            if (this._triggerCommonEventAction(skills[activeId])) {
                this._characterEntered = 4;
                this._exit = true;
            }
        } else {
            SoundManager.playBuzzer();
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
            case 4:
                // No input here, exit the menu!
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
            case 0: // The outer menu
                this._characterInfoOpacity = this._increaseOpacity(this._characterInfoOpacity,
                                                                   this._skillsSubOpacity, this._equipmentSubOpacity);
                this._subCategoryFadeOpacity = this._decreaseOpacity(this._subCategoryFadeOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                break;
            case 1: // Subcategory menu
                this._characterInfoOpacity = this._increaseOpacity(this._characterInfoOpacity, 
                                                                   this._skillsSubOpacity, this._equipmentSubOpacity);
                this._subCategoryFadeOpacity = this._increaseOpacity(this._subCategoryFadeOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                break;
            case 2: // Skills menu
                this._characterInfoOpacity = this._decreaseOpacity(this._characterInfoOpacity);
                this._equipmentSubOpacity = this._decreaseOpacity(this._equipmentSubOpacity);
                this._skillsSubOpacity = this._increaseOpacity(this._skillsSubOpacity, this._characterInfoOpacity);
                break;
            case 3: // Equipment menu
                this._characterInfoOpacity = this._decreaseOpacity(this._characterInfoOpacity);
                this._skillsSubOpacity = this._decreaseOpacity(this._skillsSubOpacity);
                this._equipmentSubOpacity = this._increaseOpacity(this._equipmentSubOpacity, this._characterInfoOpacity);
                break;
            case 4: // Skill exit
                // Exit the menu, and apply the master opacity to the pergamen, and background opacity
                this._pergamen.opacity = this._masterOpacity;
                this._backgroundTint.opacity = (this._masterOpacity / 255) * 130;
                break;
        }
        
        this._characterInfo.opacity = this._characterInfoOpacity * (this._masterOpacity / 255);
        this._subCategoryButtons.setMasterOpacity(this._subCategoryFadeOpacity * (this._masterOpacity / 255));
        this._equipmentList.setMasterOpacity(this._equipmentSubOpacity * (this._masterOpacity / 255));
        this._equipmentNames.setMasterOpacity(this._equipmentSubOpacity * (this._masterOpacity / 255));
        this._skillGrid.setMasterOpacity(this._skillsSubOpacity * (this._masterOpacity / 255));
        this._skillInfo.opacity = this._skillsSubOpacity * (this._masterOpacity / 255);
        
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFaceFadeOpacity += 15;
        }
        
        this._characterFace.opacity = this._characterFaceFadeOpacity * (this._masterOpacity / 255);
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity === 0) {
            if (this._characterEntered === 4) {
                SceneManager.goto(Scene_Map);
            } else {
                NB_Interface.instantMainMenuFlag = true;
                NB_Interface.returnFrom = 0;
                SceneManager.goto(NB_Interface.classes['MainMenu']);
            }
        }
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateElements = function() {
        this._actorButtons.update();
        this._subCategoryButtons.update();
        this._updateCharacterInfo();
        this._equipmentList.update();
        this._equipmentNames.update();
        this._skillGrid.update();
        if (this._characterEntered === 2) {
            this._updateSkillsInfo();
        }
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFace.x += (255-this._characterFaceFadeOpacity)/90;
        }
    };
    
})();
