//=============================================================================
// NB_GameLoopFix.js
//=============================================================================

/*:
 * @plugindesc Minor fixes to the game loop
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
            
            this._currentTime = newTime;
            this._accumulator += fTime;
            
            if (this._accumulator >= this._deltaTime * 3) {
                this._accumulator = this._deltaTime * 3;
            }
            
            while (this._accumulator >= this._deltaTime) {
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
        var startTime = performance.now();
        if (stage) {
            this._renderer.render(stage);
            if (this._renderer.gl && this._renderer.gl.flush) {
                this._renderer.gl.flush();
            }
        }
        var endTime = performance.now();
        var elapsed = endTime - startTime;
        
        this._rendered = true;
        this.frameCount++;
    };
    
})();
