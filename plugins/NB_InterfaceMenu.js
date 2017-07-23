//=============================================================================
// NB_InterfaceMenu.js
//=============================================================================

/*:
 * @plugindesc The in game menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    var instantMainMenuFlag = false;
    var returnFrom = null;
    
    /****************************************************************
     * Main Menu (the in game main menu)
     ****************************************************************/
    
    function NB_Interface_MainMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_MainMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_MainMenu.prototype.constructor = NB_Interface_MainMenu;
    
    // Expanded!
    NB_Interface_MainMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            # flow control
            _fadeOut
            _exit
            _exitToTitle
            _enterSubmenu
            
            # interface elements
            _buttonGroup
            
            # sprites
            _pergamenMark
        */
    };
    
    // Expanded!
    NB_Interface_MainMenu.prototype.create = function() {
        // Create variables
        this._fadeOut = null;
        this._exit = false;
        this._exitToTitle = false;
        this._enterSubmenu = null;
        // Create generic background
        this.createBackground();
        // Create additional graphics
        this._createGraphics();
        // Create instant background if necessary
        if (!instantMainMenuFlag) {
            this._backgroundTint.opacity = 0;
            this._pergamen.opacity = 0;
        } else {
            instantMainMenuFlag = false;
        }
        this._createButtons();
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_MainMenu.prototype._createGraphics = function() {
        this._pergamenMark = new Sprite();
        this._pergamenMark.bitmap = ImageManager.loadInterfaceElement('menu_1/', '0', 0);
        this._pergamenMark.opacity = 0;
        this.addChild(this._pergamenMark);
    };
    
    NB_Interface_MainMenu.prototype._createButtons = function() {
        this._buttonGroup = new NB_ButtonGroup(false);
        this._buttonGroup.add(new NB_Button('menu_1/', '11', 'menu_1/', '12', null, null, 440, 113, 255), true);
        this._buttonGroup.add(new NB_Button('menu_1/', '9', 'menu_1/', '10', null, null, 464, 113+55, 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '7', 'menu_1/', '8', null, null, 445, 113+(55*2), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '5', 'menu_1/', '6', null, null, 412, 113+(55*3), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '3', 'menu_1/', '4', null, null, 402, 113+(55*4), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '1', 'menu_1/', '2', null, null, 382, 113+(55*5), 255), false);
        this._buttonGroup.setActive(returnFrom || 0);
        returnFrom = null;
        this._buttonGroup.addToContainer(this);
    };
    
    NB_Interface_MainMenu.prototype._createFadeOut = function() {
        // Create the fade out sprite
        this._fadeOut = new Sprite();
        this._fadeOut.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._fadeOut.bitmap.fillAll('#000000');
        this._fadeOut.opacity = 0;
        this.addChild(this._fadeOut);
    };
    
    // Override!
    NB_Interface_MainMenu.prototype.updateOpacity = function() {
        if (!this._exit) {
            if (this.isEnterComplete() && this._enterSubmenu != null && this._enterSubmenu < 4) {
                this._pergamenMark.opacity -= 15;
            } else if (this._backgroundTint.opacity > 75 && this._pergamenMark.opacity < 255) {
                this._pergamenMark.opacity += 15;
            }
            
            if (!this.isEnterComplete()) {
                if (this._backgroundTint.opacity < 130) {
                    this._backgroundTint.opacity += 10;
                }
                if (this._backgroundTint.opacity > 75) {
                    if (this._pergamen.opacity < 255) {
                        this._pergamen.opacity += 15;
                    } else if (!this.isEnterComplete()) {
                        this.makeEnterComplete();
                    }
                }
            } else if (this.isEnterComplete() && this._exitToTitle) {
                this._fadeOut.opacity += 15;
            }
        } else {
            this._pergamen.opacity -= 15;
            this._pergamenMark.opacity -= 15;
            if (this._backgroundTint.opacity > 0) this._backgroundTint.opacity -= 10;
        }
        // This is the best looking option...
        this._buttonGroup.setMasterOpactiy(this._pergamenMark.opacity);
    };
    
    // Override!
    NB_Interface_MainMenu.prototype.updateInput = function() {
        if (!this._exit && !this._exitToTitle && this._enterSubmenu == null) {
            // Update buttons input
            this._buttonGroup.updateInput(this.isMouseActive());
            // Go into submenu
            if ((Input.isTriggered('ok') || this._buttonGroup.clickedOnActive()) && !this._exit) {
                this._enterSubmenu = this._buttonGroup.trigger(true);
                if (this._enterSubmenu == 4) {
                    SoundManager.playCancel();
                    this._exit = true;
                    this._enterSubmenu = null;
                } else if (this._enterSubmenu == 5) {
                    SoundManager.playOk();
                    this._createFadeOut();
                    this._exitToTitle = true;
                    this._enterSubmenu = null;
                    this._buttonGroup.fade(false);
                } else {
                    SoundManager.playOk();
                    this._buttonGroup.fade(false);
                }
            }
            // Exit menu
            if (Input.isTriggered('menu') && !this._exit) {
                SoundManager.playCancel();
                this._exit = true;
            }
        }
    };
    
    // Override!
    NB_Interface_MainMenu.prototype.updateElements = function() {
        this._buttonGroup.update();
    };
    
    // Override!
    NB_Interface_MainMenu.prototype.updateTransitions = function() {
        if (this._exit && this._pergamen.opacity == 0) {
            SceneManager.goto(Scene_Map);
        }
        if (this._exitToTitle && this._fadeOut != null && this._fadeOut.opacity == 255) {
            SceneManager.goto(Scene_Title);
        }
        if (this._enterSubmenu != null) {
            if (this._buttonGroup.completelyFaded()) {
                this.enterSubmenu();
            }
        }
    };
    
    NB_Interface_MainMenu.prototype.enterSubmenu = function() {
        switch(this._enterSubmenu) {
            case 0:
                SceneManager.goto(NB_Interface_CharMenu);
                break;
            default:
                SceneManager.goto(Scene_Map);
                break;
        }
    };
    
    /****************************************************************
     * Character Menu
     ****************************************************************/
    
    function NB_Interface_CharMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_CharMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_CharMenu.prototype.constructor = NB_Interface_CharMenu;
    
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
            _graphicsSet
            _title1
            _title2
            _line1
            _line2
            _characterInfo
            _characterFace
            
            # data
            _party
            
            # interface elements
            _actorButtons
            _equipmentButtons
            
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
        this._graphicsSet = [];
        this._createTitle();
        this._createLines();
        this._setupActors();
        this._setupButtons();
        
        this._masterOpacity = 0;
        this._exit = false;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_CharMenu.prototype._loadBars = function() {
        this.bar = ImageManager.loadInterfaceElement('menu_1/', 'bar', 0);
        this.bar_hp = ImageManager.loadInterfaceElement('menu_1/', 'bar_hp', 0);
        this.bar_mp = ImageManager.loadInterfaceElement('menu_1/', 'bar_mp', 0);
        this.bar_def = ImageManager.loadInterfaceElement('menu_1/', 'bar_def', 0);
        this.bar_atk = ImageManager.loadInterfaceElement('menu_1/', 'bar_atk', 0);
    };
    
    NB_Interface_CharMenu.prototype._setupButtons = function() {
        this._equipmentButtons = [];
        this._equipmentButtons.push(new NB_Button(null, null, null, null, 'Fegyver:', 
                                    NB_Interface.fontColor, 610, 405, 255));
        this._equipmentButtons.push(new NB_Button(null, null, null, null, 'Pajzs:', 
                                    NB_Interface.fontColor, 610, 425, 255));
        this._equipmentButtons.push(new NB_Button(null, null, null, null, 'Sisak:', 
                                    NB_Interface.fontColor, 610, 445, 255));
        this._equipmentButtons.push(new NB_Button(null, null, null, null, 'Páncél:', 
                                    NB_Interface.fontColor, 610, 465, 255));
        this._equipmentButtons.push(new NB_Button(null, null, null, null, 'Egyéb:', 
                                    NB_Interface.fontColor, 610, 485, 255));
        for (var i = 0; i < 5; i++) {
            this.addChild(this._equipmentButtons[i]._graphics);
            this.addChild(this._equipmentButtons[i]._light);
        }
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
            this._characterFace.bitmap = ImageManager.loadInterfaceElement('menu_1/chars/', 'face'+actor.actorId(), 0);
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
        this._characterInfo.bitmap.fontSize = 26;
        this._characterInfo.bitmap.textColor = 'rgba(20, 7, 0, 1)';
        this._characterInfo.bitmap.outlineColor = 'rgba(0, 0, 0, 0)';
        this._characterInfo.bitmap.outlineWidth = 0;
        this.addChild(this._characterInfo);
    };
    
    NB_Interface_CharMenu.prototype._createTitle = function() {
        this._title1 = new Sprite();
        this._title1.bitmap = ImageManager.loadInterfaceElement('menu_1/', '11', 0);
        this._title1.x = 165;
        this._title1.y = 40;
        this._title1.opacity = 0;
        this._title2 = new Sprite();
        this._title2.bitmap = ImageManager.loadInterfaceElement('menu_1/', '12', 0);
        this._title2.x = 165;
        this._title2.y = 40;
        this._title2.opacity = 0;
        this._graphicsSet.push(this._title1);
        this._graphicsSet.push(this._title2);
        this.addChild(this._title1);
        this.addChild(this._title2);
    };
    
    NB_Interface_CharMenu.prototype._createLines = function() {
        this._line1 = new Sprite();
        this._line1.bitmap = ImageManager.loadInterfaceElement('menu_1/', 'line1', 0);
        this._line1.x = 350;
        this._line1.opacity = 0;
        this._line2 = new Sprite();
        this._line2.bitmap = ImageManager.loadInterfaceElement('menu_1/', 'line2', 0);
        this._line2.x = 118;
        this._line2.y = 68;
        this._line2.opacity = 0;
        this._graphicsSet.push(this._line1);
        this._graphicsSet.push(this._line2);
        this.addChild(this._line1);
        this.addChild(this._line2);
    };
    
    NB_Interface_CharMenu.prototype.updateInput = function() {
        this._actorButtons.updateInput(this.isMouseActive());
        this._currentChar = this._actorButtons.getActiveID();
        if (Input.isTriggered('menu') && !this._exit) {
            this._exit = true;
        }
    };
    
    NB_Interface_CharMenu.prototype.updateOpacity = function() {
        if (this._exit) {
            if (this._masterOpacity > 0) {
                for (var i = 0; i < this._graphicsSet.length; i++) {
                    this._graphicsSet[i].opacity -= 15;
                }
                this._masterOpacity -= 15;
            }
        } else {
            if (this._masterOpacity < 255) {
                for (var i = 0; i < this._graphicsSet.length; i++) {
                    this._graphicsSet[i].opacity += 15;
                }
                this._masterOpacity += 15;
            } else if (!this.isEnterComplete()) {
                this.makeEnterComplete();
            }
        }
        this._actorButtons.setMasterOpactiy(this._masterOpacity);
        this._characterInfo.opacity = this._masterOpacity;
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFaceFadeOpacity += 15;
        }
        this._characterFace.opacity = this._characterFaceFadeOpacity * (this._masterOpacity / 255);
    };
    
    NB_Interface_CharMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            instantMainMenuFlag = true;
            SceneManager.goto(NB_Interface_MainMenu);
        }
    };
    
    NB_Interface_CharMenu.prototype.updateElements = function() {
        this._actorButtons.update();
        this._updateCharacterInfo();
        if (this._characterFaceFadeOpacity < 255) {
            this._characterFace.x += (255-this._characterFaceFadeOpacity)/60;
        }
        for (var i = 0; i < 5; i++) {
            this._equipmentButtons[i].update();
            if (this._equipmentButtons[i].mouseInside()) {
                this._equipmentButtons[i].activate();
            } else {
                this._equipmentButtons[i].deactivate();
            }
        }
    };
    
    /****************************************************************
     * Menu trigger
     ****************************************************************/
    
    // Override!
    Scene_Map.prototype.callMenu = function() {
        SoundManager.playCancel();
        SceneManager.goto(NB_Interface_MainMenu);
        Window_MenuCommand.initCommandPosition();
        $gameTemp.clearDestination();
        this._mapNameWindow.hide();
        this._waitCount = 2;
    };
    
})();
