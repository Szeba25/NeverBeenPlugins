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
            
            # sprites and bitmaps
            _characterInfo
            _characterFace
            
            # data
            _party
            
            # interface elements
            _categories
            _actorButtons
            _equipmentList
            
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
        this._loadBars();
        this.createBaseTitleAndLines(0, '11', '12');
        this._setupActors();
        this._setupCategories();
        this._setupButtons();
        
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
    
    NB_Interface_CharMenu.prototype._setupButtons = function() {
        this._equipmentList = new NB_List(610, 405, 5, 25);
        this._equipmentList.addListElement('Fegyver:');
        this._equipmentList.addListElement('Pajzs:');
        this._equipmentList.addListElement('Sisak:');
        this._equipmentList.addListElement('Páncél:');
        this._equipmentList.addListElement('Egyéb:');
        this._equipmentList.addToContainer(this);
    };
    
    NB_Interface_CharMenu.prototype._generateBar = function(current, max, width, height, original) {
        var ow = (current / max) * width;
        var bitmap = new Bitmap(width, height);
        bitmap.blt(original, 0, 0, width, height, 0, 0, width, height);
        bitmap.clearRect(ow, 0, width, height);
        return bitmap;
    };
    
    NB_Interface_CharMenu.prototype._drawStatusBars = function(actor, bmp) {
        // HP
        bmp.blt(this._generateBar(actor.hp, actor.mhp, 200, 15, this.bar_hp), 0, 0, 200, 15, 278, 192, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, 278, 192, 200, 15);
        // MP
        bmp.blt(this._generateBar(actor.mp, actor.mmp, 200, 15, this.bar_mp), 0, 0, 200, 15, 278, 217, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, 278, 217, 200, 15);
        // ATK
        bmp.blt(this._generateBar(actor.atk, 100, 200, 15, this.bar_atk), 0, 0, 200, 15, 278, 242, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, 278, 242, 200, 15);
        // DEF
        bmp.blt(this._generateBar(actor.def, 100, 200, 15, this.bar_def), 0, 0, 200, 15, 278, 267, 200, 15);
        bmp.blt(this.bar, 0, 0, 200, 15, 278, 267, 200, 15);
    };
    
    NB_Interface_CharMenu.prototype._drawEquipment = function(actor, bmp) {
        for (var i = 0; i < 5; i++) {
            var equip = actor.equips()[i];
            if (equip != null) {
                bmp.drawText(equip.name, 290, 345 + i*20, null, NB_Interface.lineHeight, 'left');
            }
        }
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
            bmp.drawText('Név: ' + actor.name(), 0, 0, null, NB_Interface.lineHeight, 'left');
            for (var i = 0; i < bio.length; i++) {
                bmp.drawText(bio[i], 185, (i*20), null, NB_Interface.lineHeight, 'left');
            }
            bmp.drawText('Életerő:', 185, 180, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Energia:', 185, 205, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Támadás:', 185, 230, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Védekezés:', 185, 255, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Képesség:', 185, 285, null, NB_Interface.lineHeight, 'left');
            bmp.drawText('Felszerelés:', 185, 320, null, NB_Interface.lineHeight, 'left');
            this._drawStatusBars(actor, bmp);
            this._drawEquipment(actor, bmp);
        }
    };
    
    NB_Interface_CharMenu.prototype._setupActors = function() {
        // Actor variables
        this._currentChar = 0;
        this._currentCharUpdated = -1;
        this._characterFaceFadeOpacity = 0;
        this._party = $gameParty.allMembers();
        // Buttons and other data
        this._actorButtons = new NB_ButtonGroup(true);
        for (var i = 0; i < this._party.length; i++) {
            this._actorButtons.add(new NB_Button('menu_1/chars/', 'name'+this._party[i].actorId(), 
                                                 'menu_1/chars/', 'name'+this._party[i].actorId()+'sh',
                                                 null, null, 210, 140+(i*46)));
        }
        this._actorButtons.addToContainer(this);
        
        this._characterFace = new Sprite();
        this._characterFace.y = 100;
        this.addChild(this._characterFace);
        
        this._characterInfo = new Sprite();
        this._characterInfo.x = 400;
        this._characterInfo.y = 60;
        this._characterInfo.bitmap = new Bitmap(500, 500);
        this.setBitmapFontStyle(this._characterInfo.bitmap);
        
        this.addChild(this._characterInfo);
    };
    
    NB_Interface_CharMenu.prototype._setupCategories = function() {
        this._categories = new NB_ButtonGroup(true);
        this._categories.add(new NB_Button('menu_1/', 'char_1', 'menu_1/', 'char_1_light', null, null, 380, 60, 255), true);
        this._categories.add(new NB_Button('menu_1/', 'item_2', 'menu_1/', 'item_2_light', null, null, 525, 60, 255), false);
        this._categories.add(new NB_Button('menu_1/', 'char_2', 'menu_1/', 'char_2_light', null, null, 700, 60, 255), false);
        this._categories.addToContainer(this);
    };
    
    // Override!
    NB_Interface_CharMenu.prototype.updateInput = function() {
        this._categories.updateInput(this.isMouseActive(), 'left', 'right');
        this._actorButtons.updateInput(this.isMouseActive());
        this._equipmentList.updateInput(this.isMouseActive());
        this._currentChar = this._actorButtons.getActiveId();
        if (Input.isTriggered('menu') && !this._exit) {
            this._exit = true;
        }
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
        this._categories.setMasterOpacity(this._masterOpacity);
        this._equipmentList.setMasterOpacity(this._masterOpacity);
        this._characterInfo.opacity = this._masterOpacity;
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
        this._categories.update();
        this._updateCharacterInfo();
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFace.x += (255-this._characterFaceFadeOpacity)/60;
        }
        this._equipmentList.update();
    };
    
})();
