//=============================================================================
// NB_EventOffset.js
//=============================================================================

/*:
 * @plugindesc Adds a way to offset event graphics.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    Sprite_Character.prototype.isEvent = function() {
        return (this._character instanceof Game_Event);
    };
    
    Sprite_Character.prototype.getOffsetMeta = function() {
        if (this.isEvent() && this._character.event().note != '') {
            var data = this._character.event().note.split('|');
            var arr = data[0].split('/');
            console.log('ID: ' + this._character._eventId + ' -> ' + arr[0] + '/' + arr[1]);
            return arr;
        } else {
            var arr = [0, 0];
            return arr;
        }
    };
    
    aliases.Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
    Sprite_Character.prototype.setCharacter = function(character) {
        aliases.Sprite_Character_setCharacter.call(this, character);
        var meta = this.getOffsetMeta();
        this._charOffX = Number(meta[0]);
        this._charOffY = Number(meta[1]);
    };
    
    aliases.Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        aliases.Sprite_Character_updatePosition.call(this);
        this.x += this._charOffX;
        this.y += this._charOffY;
        this.y += 5; // to achieve wyvern like sprite positioning!
    };
    
})();
