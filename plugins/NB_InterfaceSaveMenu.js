//=============================================================================
// NB_InterfaceSaveMenu.js
//=============================================================================

/*:
 * @plugindesc The in game save menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_SaveMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_SaveMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_SaveMenu.prototype.constructor = NB_Interface_SaveMenu;
    
    NB_Interface.classes['SaveMenu'] = NB_Interface_SaveMenu;
    
    NB_Interface_SaveMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            # flow control
            _exit
            _masterOpacity
            _currentSaveId
            _updatedSaveId
            
            # sprites and bitmaps
            _saveInfo
            
            # interface
            _slotList
        */
    };
    
    NB_Interface_SaveMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(255, '5', '6', 410);
        
        this._exit = false;
        this._masterOpacity = 0;
        this._createSlotList();
        
        this._saveInfo = new Sprite(new Bitmap(500, 500));
        this._saveInfo.x = 470;
        this._saveInfo.y = 70;
        this.setBitmapFontStyle(this._saveInfo.bitmap);
        this.addChild(this._saveInfo);
        this._currentSaveId = 0;
        this._updatedSaveId = null;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_SaveMenu.prototype._createSlotList = function() {
        this._slotList = new NB_List(200, 140, 10);
        for (var i = 1; i <= 20; i++) {
            this._slotList.addListElement('slot ' + i);
            
            var valid = DataManager.isThisGameFile(i);
            var elementId = i-1;
            if (!valid) this._slotList.invalidateById(elementId);
            
        }
        this._slotList.addToContainer(this);
    };
    
    NB_Interface_SaveMenu.prototype._updateSaveInfo = function() {
        if (this._updatedSaveId !== this._currentSaveId) {
            this._updatedSaveId = this._currentSaveId;
            
            var info = DataManager.loadSavefileInfo(this._currentSaveId + 1);
            var bmp = this._saveInfo.bitmap;
            
            bmp.clear();
            if (info) {
                bmp.drawText('Béna kis mentés információ:', 0, 0, null, NB_Interface.lineHeight, 'left');
                bmp.drawText('Játékidő: ' + info.playtime, 30, 30, null, NB_Interface.lineHeight, 'left');
                if (info.characters) {
                    for (var i = 0; i < info.characters.length; i++) {
                        var data = info.characters[i];
                        var bitmap = ImageManager.loadCharacter(data[0]);
                        var big = ImageManager.isBigCharacter(data[0]);
                        var pw = bitmap.width / (big ? 3 : 12);
                        var ph = bitmap.height / (big ? 4 : 8);
                        var n = data[1];
                        var sx = (n % 4 * 3 + 1) * pw;
                        var sy = (Math.floor(n / 4) * 4) * ph;
                        bmp.blt(bitmap, sx, sy, pw, ph, (50 + i*48) - pw / 2, 70);
                    }
                }
            }
        }
    };
    
    // DIRECTLY FROM RPG MAKER SCENES!!!
    NB_Interface_SaveMenu.prototype._saveGame = function(slotId) {
        $gameSystem.onBeforeSave();
        if (DataManager.saveGame(slotId)) {
            SoundManager.playSave();
            StorageManager.cleanBackup(slotId);
            this._exit = true;
        } else {
            SoundManager.playBuzzer();
        }
    };
    
    // Override!
    NB_Interface_SaveMenu.prototype.updateInput = function() {
        if (!this._exit) {
            this._slotList.updateInput(this.isMouseActive());
            this._currentSaveId = this._slotList.getActiveId();
            if (Input.isTriggered('menu') && !this._exit) {
                this._exit = true;
            }
            if (Input.isTriggered('ok')) {
                this._saveGame(this._currentSaveId + 1);
            }
        }
    };
    
    // Override!
    NB_Interface_SaveMenu.prototype.updateOpacity = function() {
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
        this._slotList.setMasterOpacity(this._masterOpacity);
        this._saveInfo.opacity = this._masterOpacity;
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
    };
    
    // Override!
    NB_Interface_SaveMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            NB_Interface.instantMainMenuFlag = true;
            NB_Interface.returnFrom = 3;
            SceneManager.goto(NB_Interface.classes['MainMenu']);
        }
    };
    
    // Override!
    NB_Interface_SaveMenu.prototype.updateElements = function() {
        this._slotList.update();
        this._updateSaveInfo();
    };
    
})();
