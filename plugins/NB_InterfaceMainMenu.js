//=============================================================================
// NB_InterfaceMainMenu.js
//=============================================================================

/*:
 * @plugindesc The in game main menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_MainMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_MainMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_MainMenu.prototype.constructor = NB_Interface_MainMenu;
    
    NB_Interface.classes['MainMenu'] = NB_Interface_MainMenu;
    
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
        if (!NB_Interface.instantMainMenuFlag) {
            this._backgroundTint.opacity = 0;
            this._pergamen.opacity = 0;
        } else {
            NB_Interface.instantMainMenuFlag = false;
        }
        this._createButtons();
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_MainMenu.prototype._createGraphics = function() {
        this._pergamenMark = new Sprite();
        this._pergamenMark.bitmap = ImageManager.loadInterfaceElement('menu_1/', '0');
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
        this._buttonGroup.setActive(NB_Interface.returnFrom || 0);
        NB_Interface.returnFrom = null;
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
        this._buttonGroup.setMasterOpacity(this._pergamenMark.opacity);
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
                SceneManager.goto(NB_Interface.classes['CharMenu']);
                break;
            case 1:
                SceneManager.goto(NB_Interface.classes['ItemMenu']);
                break;
            case 2:
                SceneManager.goto(NB_Interface.classes['QuestMenu']);
                break;
            case 3:
                SceneManager.goto(NB_Interface.classes['SaveMenu']);
                break;
            default:
                this._exit = true;
                break;
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
