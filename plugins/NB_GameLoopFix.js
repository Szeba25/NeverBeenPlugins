//=============================================================================
// NB_GameLoopFix.js
//=============================================================================

/*:
 * @plugindesc Fixes the game loop to not update in an inner while loop.
 * @author Scalytank
 */

(function() {
    
    SceneManager.updateMain = function() {
        if (Utils.isMobileSafari()) {
            this.changeScene();
            this.updateScene();
        } else {
            var newTime = this._getTimeInMsWithoutMobileSafari();
            var fTime = (newTime - this._currentTime) / 1000;
            if (fTime > 0.25) fTime = 0.25;
            this._currentTime = newTime;
            this._accumulator += fTime;
            
            // Changed from "while" to "if"!
            
            if (this._accumulator >= this._deltaTime) {
                this.updateInputData();
                this.changeScene();
                this.updateScene();
                this._accumulator -= this._deltaTime;
            }
        }
        this.renderScene();
        this.requestUpdate();
    };
    
})();
