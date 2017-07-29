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
            _line
            _questInfo
            
            # interface
            _questList
            _questDescriptions
        */
    };
    
    NB_Interface_QuestMenu.prototype.create = function() {
        this.createBackground();
        
        this._exit = false;
        this._masterOpacity = 0;
        this._activeQuest = 0;
        this._updatedQuest = null;
        
        this._line = new Sprite(ImageManager.loadInterfaceElement('menu_1/', 'line1'));
        this._line.x = 350
        this._line.opacity = 0;
        this.addChild(this._line);
        
        this._createTitle();
        
        this._generateQuestList();
        this._questInfo = new Sprite(new Bitmap(500, 500));
        this._questInfo.x = 400;
        this._questInfo.y = 130;
        this.setBitmapFontStyle(this._questInfo.bitmap);
        this.addChild(this._questInfo);
        
        this.makeEnterComplete();
        
        NB_Interface.prototype.create.call(this);
    };
    
    NB_Interface_QuestMenu.prototype._generateQuestList = function() {
        this._questList = new NB_List(200, 120, 10);
        this._questDescriptions = [];
        
        for (var i = 0; i < $dataQuests.length; i++) {
            var name = $dataQuests[i].name;
            var variableId = $dataQuests[i].variableId;
            var variableValue = $gameVariables.value(variableId);
            if (variableValue > 0 && variableValue <= 8) {
                this._questList.addListElement(name);
                var description = this._getDescription($dataQuests[i], variableValue).split('\n');
                this._questDescriptions.push(description);
            }
            if (variableValue == 8) this._questList.invalidateById(i);
        }
        this._questList.addToContainer(this);
    };
    
    NB_Interface_QuestMenu.prototype._createTitle = function() {
        this._title1 = new Sprite();
        this._title1.bitmap = ImageManager.loadInterfaceElement('menu_1/', '7');
        this._title1.x = 165;
        this._title1.y = 40;
        this._title1.opacity = 0;
        this._title2 = new Sprite();
        this._title2.bitmap = ImageManager.loadInterfaceElement('menu_1/', '8');
        this._title2.x = 165;
        this._title2.y = 40;
        this._title2.opacity = 0;
        this.addChild(this._title1);
        this.addChild(this._title2);
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
            var description = this._questDescriptions[this._activeQuest];
            
            bmp.clear();
            for (var i = 0; i < description.length; i++) {
                bmp.drawText(description[i], 20, i * 20, null, NB_Interface.lineHeight, 'left');
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
        this._line.opacity = this._masterOpacity;
        this._questList.setMasterOpacity(this._masterOpacity);
        this._questInfo.opacity = this._masterOpacity;
        this._title1.opacity = this._masterOpacity;
        this._title2.opacity = this._masterOpacity;
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
