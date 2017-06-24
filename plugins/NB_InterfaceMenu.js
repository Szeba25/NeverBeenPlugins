//=============================================================================
// NB_InterfaceMenu.js
//=============================================================================

/*:
 * @plugindesc The in game menu
 * @author Scalytank
 */

(function() {
    
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
        this._buttonGroup = null;
        this._exit = false;
        this._exitToTitle = false;
        this._enterSubmenu = null;
    };
    
    NB_Interface_MainMenu.prototype._createGraphics = function() {
        this._backgroundTint.opacity = 0;
        this._pergamen.opacity = 0;
        this._pergamenMark = new Sprite();
        this._pergamenMark.bitmap = ImageManager.loadInterfaceElement('menu_1/', '0', 0);
        this._pergamenMark.opacity = 0;
        
        // We will create this later to preserve memory!
        this._fadeOut = null;
        
        // Add them to this scene!
        this.addChild(this._backgroundSprite);
        this.addChild(this._backgroundTint);
        this.addChild(this._pergamen);
        this.addChild(this._pergamenMark);
    };
    
    NB_Interface_MainMenu.prototype._createButtons = function() {
        this._buttonGroup = new NB_ButtonGroup();
        this._buttonGroup.add(new NB_Button('menu_1/', '11', 'menu_1/', '12', '', 440, 113, 255), true);
        this._buttonGroup.add(new NB_Button('menu_1/', '9', 'menu_1/', '10', '', 464, 113+55, 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '7', 'menu_1/', '8', '', 445, 113+(55*2), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '5', 'menu_1/', '6', '', 412, 113+(55*3), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '3', 'menu_1/', '4', '', 402, 113+(55*4), 255), false);
        this._buttonGroup.add(new NB_Button('menu_1/', '1', 'menu_1/', '2', '', 382, 113+(55*5), 255), false);
        this._buttonGroup.addToContainer(this);
    };
    
    // Expanded!
    NB_Interface_MainMenu.prototype.create = function() {
        // Create generic background
        this.createBackground();
        // Create additional graphics
        this._createGraphics();
        this._createButtons();
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_MainMenu.prototype._controlOpacity = function() {
        if (!this._exit) {
            if (!this.isEnterComplete()) {
                if (this._backgroundTint.opacity < 130) {
                    this._backgroundTint.opacity += 10;
                }
                if (this._backgroundTint.opacity > 75) {
                    if (this._pergamen.opacity < 255) {
                        this._pergamen.opacity += 15;
                        this._pergamenMark.opacity += 15;
                    } else if (!this.isEnterComplete()) {
                        this.makeEnterComplete();
                    }
                }
            } else if (this.isEnterComplete() && this._exitToTitle) {
                this._fadeOut.opacity += 15;
            } else if (this.isEnterComplete() && this._enterSubmenu != null && this._enterSubmenu < 4) {
                this._pergamenMark.opacity -= 15;
            }
        } else {
            this._pergamen.opacity -= 15;
            this._pergamenMark.opacity -= 15;
            if (this._backgroundTint.opacity > 0) this._backgroundTint.opacity -= 10;
        }
        this._buttonGroup.setMasterOpactiy(this._pergamen.opacity);
    };
    
    NB_Interface_MainMenu.prototype._createFadeOut = function() {
        // Create the fade out sprite
        this._fadeOut = new Sprite();
        this._fadeOut.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._fadeOut.bitmap.fillAll('#000000');
        this._fadeOut.opacity = 0;
        this.addChild(this._fadeOut);
    };
    
    NB_Interface_MainMenu.prototype._controlInput = function() {
        if (this.isEnterComplete() && !this._exit && !this._exitToTitle && this._enterSubmenu == null) {
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
    
    NB_Interface_MainMenu.prototype.enterSubmenu = function() {
        switch(this._enterSubmenu) {
            default:
                SceneManager.goto(Scene_Map);
                break;
        }
    };
    
    // Expanded!
    NB_Interface_MainMenu.prototype.update = function() {
        this._controlOpacity();
        this._controlInput();
        this._buttonGroup.update();
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
        NB_Interface.prototype.update.call(this);
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
