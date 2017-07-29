//=============================================================================
// NB_InterfaceQuestMenu.js
//=============================================================================

/*:
 * @plugindesc The in game quest menu
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Interface.js
 */

(function() {
    
    function NB_Interface_QuestMenu() {
        this.initialize.apply(this, arguments);
    }
    
    NB_Interface_QuestMenu.prototype = Object.create(NB_Interface.prototype);
    NB_Interface_QuestMenu.prototype.constructor = NB_Interface_QuestMenu;
    
    NB_Interface.classes['QuestMenu'] = NB_Interface_QuestMenu;
    
    NB_Interface_QuestMenu.prototype.initialize = function() {
        NB_Interface.prototype.initialize.call(this);
        /** MEMBER VARIABLES
            # flow control
            _exit
            _masterOpacity
            _activeQuest
            _updatedQuest
            
            # sprites and bitmaps
            _title1
            _title2
            _questInfo
            
            # interface
            _questList
            _questNames
            _completedFlags
            _questDescriptions
        */
    };
    
    NB_Interface_QuestMenu.prototype.create = function() {
        this.createBackground();
        
        this._exit = false;
        this._masterOpacity = 0;
        this._activeQuest = 0;
        this._updatedQuest = null;
        
        this.createBaseTitleAndLines(0, '7', '8');
        
        this._generateQuestList();
        this._questInfo = new Sprite(new Bitmap(500, 500));
        this._questInfo.x = 400;
        this._questInfo.y = 70;
        this.setBitmapFontStyle(this._questInfo.bitmap);
        this.addChild(this._questInfo);
        
        this.makeEnterComplete();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_QuestMenu.prototype._generateQuestList = function() {
        this._questList = new NB_List(200, 140, 10);
        this._questNames = [];
        this._completedFlags = [];
        this._questDescriptions = [];
        
        for (var i = 0; i < $dataQuests.length; i++) {
            var name = $dataQuests[i].name;
            var variableId = $dataQuests[i].variableId;
            var variableValue = $gameVariables.value(variableId);
            if (variableValue > 0 && variableValue <= 8) {
                this._questList.addListElement(name);
                var description = this._getDescription($dataQuests[i], variableValue).split('\n');
                this._questNames.push(name);
                this._completedFlags.push(variableValue === 8);
                this._questDescriptions.push(description);
            }
            if (variableValue === 8) this._questList.invalidateById(i);
        }
        this._questList.addToContainer(this);
    };
    
    NB_Interface_QuestMenu.prototype._getDescription = function(data, variableValue) {
        switch(variableValue) {
            case 1:
                return data.state_1
                break;
            case 2:
                return data.state_2;
                break;
            case 3:
                return data.state_3;
                break;
            case 4:
                return data.state_4;
                break;
            case 5:
                return data.state_5;
                break;
            case 6:
                return data.state_6;
                break;
            case 7:
                return data.state_7;
                break;
            case 8:
                return data.state_8;
                break;
            default:
                return '';
        }
    };
    
    NB_Interface_QuestMenu.prototype._updateQuestInfo = function() {
        if (!this._questList.isEmpty() && this._updatedQuest !== this._activeQuest) {
            this._updatedQuest = this._activeQuest;
            var bmp = this._questInfo.bitmap;
            var name = this._questNames[this._activeQuest];
            var completed = this._completedFlags[this._activeQuest];
            var description = this._questDescriptions[this._activeQuest];
            
            bmp.clear();
            if (completed) {
                bmp.paintOpacity = 128;
                bmp.drawText(name + ' (teljesítve)', 0, 0, null, NB_Interface.lineHeight, 'left');
            } else {
                bmp.paintOpacity = 255;
                bmp.drawText(name, 0, 0, null, NB_Interface.lineHeight, 'left');
            }
            for (var i = 0; i < description.length; i++) {
                bmp.drawText(description[i], 25, 35+ i*20, null, NB_Interface.lineHeight, 'left');
            }
        }
    };
    
    // Override!
    NB_Interface_QuestMenu.prototype.updateInput = function() {
        this._questList.updateInput(this.isMouseActive());
        this._activeQuest = this._questList.getActiveId();
        if (Input.isTriggered('menu') && !this._exit) {
            this._exit = true;
        }
    };
    
    // Override!
    NB_Interface_QuestMenu.prototype.updateOpacity = function() {
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
        this._questList.setMasterOpacity(this._masterOpacity);
        this._questInfo.opacity = this._masterOpacity;
        this.setBaseTitleAndLinesOpacity(this._masterOpacity);
    };
    
    // Override!
    NB_Interface_QuestMenu.prototype.updateTransitions = function() {
        if (this._exit && this._masterOpacity == 0) {
            NB_Interface.instantMainMenuFlag = true;
            NB_Interface.returnFrom = 2;
            SceneManager.goto(NB_Interface.classes['MainMenu']);
        }
    };
    
    // Override!
    NB_Interface_QuestMenu.prototype.updateElements = function() {
        this._questList.update();
        this._updateQuestInfo();
    };
    
})();

/****************************************************************
 * Push custom quests data to the database loader!
 ****************************************************************/

var $dataQuests = null;
DataManager._databaseFiles.push({ name: '$dataQuests', src: 'Quests.json'});
