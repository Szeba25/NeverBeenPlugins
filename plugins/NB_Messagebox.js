//=============================================================================
// NB_Messagebox.js
//=============================================================================

/*:
 * @plugindesc Repositions the text to match the custom messagebox.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    // Override!
    Window_Base.prototype.standardFontSize = function() {
        return 26;
    };
    
    // Override!
    Window_Message.prototype.windowWidth = function() {
        return Graphics.boxWidth - 350;
    };
    
    aliases.Window_Base_calcTextHeight = Window_Base.prototype.calcTextHeight;
    Window_Base.prototype.calcTextHeight = function(textState, all) {
        return aliases.Window_Base_calcTextHeight.call(this, textState, all) - 6;
    };
    
    aliases.Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
    Window_Base.prototype.resetFontSettings = function() {
        aliases.Window_Base_resetFontSettings.call(this);
        this.contents.outlineColor = 'rgba(0, 0, 0, 0)';
        this.contents.outlineWidth = 0;
    };
    
    aliases.Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        aliases.Window_Message_updatePlacement.call(this);
        this.y = this.y - 12;
        this.x = 175;
    };
    
    aliases.Window_Base_processCharacter = Window_Base.prototype.processCharacter;
    Window_Base.prototype.processCharacter = function(textState) {
        if (textState.text[textState.index] === '@') {
            this.processCentering(textState);
        } else {
            aliases.Window_Base_processCharacter.call(this, textState);
        }
    };
    
    // New!
    Window_Base.prototype.processCentering = function(textState) {
        var textLines = textState.text.split('\n');
        var lineId = 0;
        for (var i = 0; i < textState.index; i++) {
            if (textState.text[i] === '\n') lineId++;
        }
        var lineWidth = this.textWidth(textLines[lineId]);
        var centerPoint = this.windowWidth() / 2;
        textState.x += (centerPoint - (lineWidth/2) - 10);
        textState.index++;
    };
    
})();
