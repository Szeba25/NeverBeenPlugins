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
            _slotsOpacity
            _slotListRefreshed
            
            # sprites and bitmaps
            _slots
            
            # interface
            _slotList
        */
    };
    
    NB_Interface_SaveMenu.prototype.create = function() {
        this.createBackground();
        this.createBaseTitleAndLines(255, '5', '6');
        this._line2.x = 145;
        this.removeChild(this._line1);
        
        DataManager.loadAllSavefileImages();
        
        this._exit = false;
        this._masterOpacity = 0;
        this._createSlotList();
        this._slotListRefreshed = false;
        
        this._currentSaveId = 0;
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_SaveMenu.prototype._createSlotList = function() {
        this._slots = [];
        this._slotsOpacity = [];
        this._slotList = new NB_List(330, 125, 3, 120);
        for (var i = 1; i <= 20; i++) {
            var elem = new NB_SaveLoadMenuButton('load_save/', 'box', 'load_save/', 'box_light', 419, 138, 0, 0, 0);
            this._slots.push(elem);
            this._slotsOpacity.push(0);
            this._slotList.addAbstractListElement(elem);
        }
        this._slotList.addToContainer(this);
    };
    
    NB_Interface_SaveMenu.prototype._refreshSlotList = function() {
        if (!this._slotListRefreshed) {
            this._slotListRefreshed = true;
            for (var i = 0; i < 20; i++) {
                var elem = this._slots[i];
                var info = DataManager.loadSavefileInfo(i + 1);
                var bmp = elem.getUpperCanvasBitmap();
                this.setBitmapFontStyle(bmp);
                bmp.clear();
                if (info) {
                    bmp.drawText((i+1) + '. Prologue:', 20, 20, null, NB_Interface.lineHeight, 'left');
                    bmp.drawText('Time: ' + info.playtime, 240, 20, null, NB_Interface.lineHeight, 'left');
                    this._drawCharacters(info.characters, bmp, 45, 55);
                } else {
                    bmp.drawText((i+1) + '. Empty.', 20, 20, null, NB_Interface.lineHeight, 'left');
                }
            }
        }
    };
    
    NB_Interface_SaveMenu.prototype._updateSlotsOpacity = function(masterOpacity) {
        for (var i = 0; i < 20; i++) {
            if (this._currentSaveId === i) {
                if (this._slotsOpacity[i] < 255) this._slotsOpacity[i] += 15;
            } else {
                var lowerLimit = 135;
                if (this._slots[i].isFaded()) lowerLimit = 0;
                if (this._slotsOpacity[i] > lowerLimit) this._slotsOpacity[i] -= 15;
                if (this._slotsOpacity[i] < lowerLimit) this._slotsOpacity[i] += 15;
            }
            this._slots[i].setUpperCanvasOpacity(this._slotsOpacity[i] * (masterOpacity/255));
        }
    };
    
    NB_Interface_SaveMenu.prototype._drawCharacters = function(characters, bmp, x, y) {
        if (characters) {
            for (var i = 0; i < characters.length; i++) {
                var data = characters[i];
                //console.log(data[0]);
                var bitmap = ImageManager.loadCharacter(data[0]);
                var big = ImageManager.isBigCharacter(data[0]);
                var pw = bitmap.width / (big ? 3 : 12);
                var ph = bitmap.height / (big ? 4 : 8);
                var n = data[1];
                var sx = (n % 4 * 3 + 1) * pw;
                var sy = (Math.floor(n / 4) * 4) * ph;
                bmp.blt(bitmap, sx, sy, pw, ph, (x + i*48) - pw / 2, y);
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
            
            if (this.backKeyTrigger() && !this._exit) {
                SoundManager.playCancel();
                this._exit = true;
            }
            if (this.okKeyTrigger(this._slotList)) {
                this._saveGame(this._currentSaveId + 1);
            }
            
            this._slotList.updateInput(this.isMouseActive());
            this._currentSaveId = this._slotList.getActiveId();
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
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
        this._updateSlotsOpacity(this._masterOpacity);
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
        this._refreshSlotList();
        this._slotList.update();
    };
    
})();
