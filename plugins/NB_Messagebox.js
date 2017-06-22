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
    Window_Message.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = (Graphics.boxWidth - width) / 2;
        Window_Base.prototype.initialize.call(this, x, 0, width-350, height);
        this.openness = 0;
        this.initMembers();
        this.createSubWindows();
        this.updatePlacement();
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
    
})();
