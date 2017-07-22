//=============================================================================
// NB_CharacterStepFix.js
//=============================================================================

/*:
 * @plugindesc Fixes the sliding characters.
 * @author Scalytank
 */

(function() {
    
    var aliases = {};
    
    aliases.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        aliases.Game_CharacterBase_initMembers.call(this);
        this._stopDelay = 0;
    };
    
    aliases.Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        
        if (this.isStopping()) {
            if (this._stopDelay > 0) {
                this._stopDelay--;
            }
        } else {
            this._stopDelay = 1;
        }
        
        // Set flag
        if (this.isMoving() && this._stopDelay == 0) {
            this._stopDelay = 1;
            this._animationCount = this.animationWait();
        }
        
        // Run the original method
        aliases.Game_CharacterBase_update.call(this);
    };
    
    // Override!
    Game_CharacterBase.prototype.updateAnimationCount = function() {
        if (this.isMoving() && this.hasWalkAnime()) {
            this._animationCount += 1.5;
        } else if (this.hasStepAnime()) {
            this._animationCount++;
        } else if (this.isStopping() && this._stopDelay == 0) {
            this.resetPattern();
        }
    };
    
})();
