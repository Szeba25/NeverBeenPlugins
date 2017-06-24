//=============================================================================
// NB_InterfaceMenu.js
//=============================================================================

/*:
 * @plugindesc The in game menu
 * @author Scalytank
 */

(function() {
    
    /****************************************************************
     * MainMenu (the in game main menu)
     ****************************************************************/
    
    function NB_Interface_MainMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_MainMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_MainMenu.prototype.constructor = NB_Interface_MainMenu;
    
    // Expanded!
    NB_Interface_MainMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        this._cursor = 0;
        this._backgroundSprite = null;
        this._backgroundTint = null;
        this._pergamen = null;
        this._buttonGroup = null;
        this._exit = false;
    };
    
    NB_Interface_MainMenu.prototype._createGraphics = function() {
        // Create all the graphics
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        
        this._backgroundTint = new Sprite();
        this._backgroundTint.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._backgroundTint.bitmap.fillAll('#240F00');
        this._backgroundTint.opacity = 0;
        
        this._pergamen = new Sprite();
        this._pergamen.bitmap = ImageManager.loadInterfaceElement('menu_1/', '13', 0);
        this._pergamen.opacity = 0;
        
        // Add them to this scene!
        this.addChild(this._backgroundSprite);
        this.addChild(this._backgroundTint);
        this.addChild(this._pergamen);
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
        this._createGraphics();
        this._createButtons();
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_MainMenu.prototype._controlOpacity = function() {
        if (!this._exit) {
            if (this._backgroundTint.opacity < 130) {
                this._backgroundTint.opacity += 10;
            }
            if (this._backgroundTint.opacity > 75) {
                if (this._pergamen.opacity < 255) {
                    this._pergamen.opacity += 15;
                }
            }
        } else {
            this._pergamen.opacity -= 15;
            if (this._backgroundTint.opacity > 0) this._backgroundTint.opacity -= 10;
        }
        this._buttonGroup.setMasterOpactiy(this._pergamen.opacity);
    };
    
    NB_Interface_MainMenu.prototype._controlInput = function() {
        this._buttonGroup.update(this.isMouseActive());
        this._cursor = this._buttonGroup.getActiveID();
        // Exit menu
        if (Input.isTriggered('menu') && !this._exit) {
            this._exit = true;
        }
    };
    
    // Expanded!
    NB_Interface_MainMenu.prototype.update = function() {
        this._controlOpacity();
        this._controlInput();
        
        if (this._exit && this._pergamen.opacity == 0) {
            SceneManager.goto(Scene_Map);
        }
        
        NB_Interface.prototype.update.call(this);
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
