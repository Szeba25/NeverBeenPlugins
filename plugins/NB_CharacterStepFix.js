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
        this._justStartedMoving = false;
    };
    
    aliases.Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        
        // Addition to clear the flag
        if (this.isStopping()) {
            this._justStartedMoving = false;
        }
        
        // Run the original method
        aliases.Game_CharacterBase_update.call(this);
        
        // Set flag
        if (this.isMoving() && !this._justStartedMoving) {
            this._justStartedMoving = true;
            this._animationCount = this.animationWait();
        }
    };
    
    // Override!
    Game_CharacterBase.prototype.updateAnimationCount = function() {
        if (this.isMoving() && this.hasWalkAnime()) {
            this._animationCount += 1.5;
        } else if (this.hasStepAnime()) {
            this._animationCount++;
        } else if (!this._justStartedMoving) {
            this.resetPattern();
        }
    };
    
})();
