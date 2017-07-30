//=============================================================================
// NB_GameLoopFix.js
//=============================================================================

/*:
 * @plugindesc Fixes the game loop to not update in an inner while loop.
 * And fixes the renderer to properly use performance.now(), and made one frame
 * 16 ms, not 15... -.-
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
    
    Graphics.render = function(stage) {
        if (this._skipCount === 0) {
            var startTime = performance.now();
            if (stage) {
                this._renderer.render(stage);
                if (this._renderer.gl && this._renderer.gl.flush) {
                    this._renderer.gl.flush();
                }
            }
            var endTime = performance.now();
            var elapsed = endTime - startTime;
            this._skipCount = Math.min(Math.floor(elapsed / 16), this._maxSkip);
            this._rendered = true;
        } else {
            this._skipCount--;
            this._rendered = false;
        }
        this.frameCount++;
    };
    
})();
