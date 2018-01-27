//=============================================================================
// NB_Interface.js
//=============================================================================

/*:
 * @plugindesc Interface base objects.
 * All other UI scripts will be based on this plugin.
 * @author Scalytank
 *
 * @help DEPENDENCY:
 * > NB_Mouse.js
 * > NB_SmoothCamera.js
 * > NB_Lights.js
 */

/****************************************************************
 * Interface graphics loader
 ****************************************************************/

ImageManager.loadInterfaceElement = function(subpath, filename) {
    return this.loadBitmap('img/interface/' + subpath, filename, 0, true);
};

/****************************************************************
 * Get directly the sprite's gray level
 ****************************************************************/
 
Sprite.prototype.getGrayLevel = function() {
    return this._colorTone[3];
};

/****************************************************************
 * The base of all Never Been interface scenes!
 ****************************************************************/

function NB_Interface() {
    this.initialize.apply(this, arguments);
}

NB_Interface.fontColor = 'rgba(20, 7, 0, 1)';
NB_Interface.fontSize = 26;
NB_Interface.lineHeight = 30;

NB_Interface.instantMainMenuFlag = false;
NB_Interface.returnFrom = null;
NB_Interface.classes = {};

NB_Interface.prototype = Object.create(Scene_Base.prototype);
NB_Interface.prototype.constructor = NB_Interface;

NB_Interface.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    /** MEMBER VARIABLES
        _enterComplete
        _backgroundSpriteset
        _backgroundTint
        _pergamen
        _title1
        _title2
        _line1
        _line2
    */
};

NB_Interface.prototype.create = function() {
    // Create variables
    this._enterComplete = false;
    // Add the mouse
    this.addMouse();
    Scene_Base.prototype.create.call(this);
};

NB_Interface.prototype.createBackground = function() {
    // Create all the background graphics
    this._backgroundSpriteset = SceneManager.getBackgroundSpriteset();
    
    this._backgroundTint = new Sprite(new Bitmap(Graphics.width, Graphics.height));
    this._backgroundTint.bitmap.fillAll('#240F00');
    this._backgroundTint.opacity = 130;
    
    this._pergamen = new Sprite(ImageManager.loadInterfaceElement('menu_1/', '13'));
    
    this.addChild(this._backgroundSpriteset);
    this.addChild(this._backgroundTint);
    this.addChild(this._pergamen);
};

NB_Interface.prototype.createBaseTitleAndLines = function(opacity, titleBase, titleLight) {
    this._title1 = new Sprite();
    this._title1.bitmap = ImageManager.loadInterfaceElement('menu_1/', titleBase);
    this._title1.x = 165;
    this._title1.y = 40;
    this._title1.opacity = opacity;
    this._title2 = new Sprite();
    this._title2.bitmap = ImageManager.loadInterfaceElement('menu_1/', titleLight);
    this._title2.x = 165;
    this._title2.y = 40;
    this._title2.opacity = opacity;
    this._line1 = new Sprite();
    this._line1.bitmap = ImageManager.loadInterfaceElement('menu_1/', 'line1');
    this._line1.x = 350;
    this._line1.opacity = opacity;
    this._line2 = new Sprite();
    this._line2.bitmap = ImageManager.loadInterfaceElement('menu_1/', 'line2');
    this._line2.x = 118;
    this._line2.y = 68;
    this._line2.opacity = opacity;
    this.addChild(this._line1);
    this.addChild(this._line2);
    this.addChild(this._title1);
    this.addChild(this._title2);
};

NB_Interface.prototype.setBaseTitleAndLinesOpacity = function(opacity) {
    this._title1.opacity = opacity;
    this._title2.opacity = opacity;
    this._line1.opacity = opacity;
    this._line2.opacity = opacity;
};

NB_Interface.prototype.setBitmapFontStyle = function(bitmap) {
    bitmap.fontSize = 26;
    bitmap.textColor = 'rgba(20, 7, 0, 1)';
    bitmap.outlineColor = 'rgba(0, 0, 0, 0)';
    bitmap.outlineWidth = 0;
};

NB_Interface.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
};

NB_Interface.prototype.update = function() {
    this.updateOpacity();
    if (this._enterComplete) {
        this.updateInput();
    }
    this.updateElements();
    this.updateTransitions();
    this.updateMouse();
    Scene_Base.prototype.update.call(this);
};

NB_Interface.prototype.updateOpacity = function() {
    // Override!
    // Update the visibility of the menu elements.
    // Make the scene "enter complete" if all elements are visible.
};

NB_Interface.prototype.updateInput = function() {
    // Override!
    // Update user input.
};

NB_Interface.prototype.updateTransitions = function() {
    // Override!
    // Update transitions to other scenes.
};

NB_Interface.prototype.updateElements = function() {
    // Override!
    // Update other interface embedded into this scene.
};

NB_Interface.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
};

NB_Interface.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
};

NB_Interface.prototype.isBusy = function() {
    return Scene_Base.prototype.isBusy.call(this);
};

NB_Interface.prototype.isReady = function() {
    return Scene_Base.prototype.isReady.call(this);
};

NB_Interface.prototype.isEnterComplete = function() {
    return this._enterComplete;
};

NB_Interface.prototype.makeEnterComplete = function() {
    this._enterComplete = true;
};

NB_Interface.prototype.backKeyTrigger = function() {
    return (Input.isTriggered('cancel') || TouchInput.isCancelled());
};

NB_Interface.prototype.okKeyTrigger = function(container) {
    return (Input.isTriggered('ok') || container.clickedOnActive());
};

/****************************************************************
 * Utility commands in interface
 ****************************************************************/

NB_Interface.prototype.getParty = function() {
    // Return all party members which are accessible from the menu
    var allParty = $gameParty.allMembers();
    var menuParty = [];
    for (var i = 0; i < allParty.length; i++) {
        if (allParty[i].nickname() !== 'NPC') {
            menuParty.push(allParty[i]);
        }
    }
    return menuParty;
};
 
/****************************************************************
 * Button: A general button interface element
 ****************************************************************/

function NB_Button() {
    this.initialize.apply(this, arguments);
}

// Create a global blur filter
NB_Button.blurFilter = new PIXI.filters.BlurFilter(1, 1, 1);

/*
 * To initialize with background and light:
 * ('bkgPath', 'bkg', 'lightPath', 'light', null, null, x, y, opacity);
 *
 * Without background:
 * (null, null, null, null, 'text', color, x, y, opacity);
 *
 */
NB_Button.prototype.initialize = function(bkgPath, bkg, lightPath, light, text, textColor, x, y, masterOpacity) {
    this._graphics = new Sprite();
    this._graphics.anchor.x = 0.5;
    this._graphics.anchor.y = 0.5;
    this._light = new Sprite();
    this._light.anchor.x = 0.5;
    this._light.anchor.y = 0.5;
    
    if (text != null) {
        this._graphics.bitmap = new Bitmap();
        this._graphics.bitmap.smooth = true;
        this._graphics.bitmap.textColor = textColor;
        this._graphics.bitmap.outlineColor = 'rgba(0, 0, 0, 0)';
        this._graphics.bitmap.fontSize = NB_Interface.fontSize;
        var w = Math.round(this._graphics.bitmap.measureTextWidth(text));
        var h = NB_Interface.lineHeight;
        this._graphics.bitmap.resize(w, h);
        this._graphics.width = w;
        this._graphics.height = h;
        this._graphics.bitmap.drawText(text, 0, 0, w, NB_Interface.lineHeight, 'left');
        this._light.bitmap = new Bitmap(w, h);
        this._light.bitmap.smooth = true;
        this._light.bitmap.blt(this._graphics.bitmap, 0, 0, w, h, 0, 0, w, h);
        this._light.filters = [NB_Button.blurFilter];
    } else {
        this._graphics.bitmap = ImageManager.loadInterfaceElement(bkgPath, bkg);
        this._light.bitmap = ImageManager.loadInterfaceElement(lightPath, light);
    }
    
    this._x = x;
    this._y = y;
    this._tx = x;
    this._ty = y;
    this._lightOpacity = 0;
    this._lerpAlpha = 0.2;
    this._active = false;
    this._masterOpacity = masterOpacity;
    this._faded = false;
    this._fadedOpacity = 255;
    this._completelyFaded = false;
    this._enlargeIfFaded = false;
    this._invalidated = false;
    this._invalidatedModifier = 100;
    this.updateOpacity();
};

NB_Button.prototype.setLerpAlpha = function(value) {
    this._lerpAlpha = value;
};

NB_Button.prototype.addToContainer = function(container) {
    container.addChild(this._graphics);
    container.addChild(this._light);
};

NB_Button.prototype.removeFromContainer = function(container) {
    container.removeChild(this._graphics);
    container.removeChild(this._light);
};

NB_Button.prototype.hide = function() {
    if (!this._faded) {
        this._faded = true;
        this._enlargeIfFaded = false;
        this._fadedOpacity = 0;
        this._graphics.visible = false;
        this._light.visible = false;
        this._completelyFaded = true;
    }
};

NB_Button.prototype.setPosition = function(x, y) {
    this._x = x;
    this._y = y;
};

NB_Button.prototype.setTarget = function(x, y) {
    this._tx = x;
    this._ty = y;
};

NB_Button.prototype.fade = function(enlarge) {
    if (!this._faded) {
        this._faded = true;
        this._enlargeIfFaded = enlarge;
    }
};

NB_Button.prototype.unFade = function() {
    if (this._faded) {
        this._faded = false;
        this._graphics.scale.x = 1;
        this._graphics.scale.y = 1;
        this._light.scale.x = 1;
        this._light.scale.y = 1;
    }
};

NB_Button.prototype.isFaded = function() {
    return this._faded;
};

NB_Button.prototype.completelyFaded = function() {
    return this._completelyFaded;
};

NB_Button.prototype.invalidate = function() {
    this._invalidated = true;
};

NB_Button.prototype.validate = function() {
    this._invalidated = false;
};

NB_Button.prototype._syncPosition = function() {
    // Lerp to target
    if (this._x < this._tx) {
        var dist = Math.abs(this._x - this._tx);
        this._x += dist * this._lerpAlpha;
    }
    if (this._x > this._tx) {
        var dist = Math.abs(this._x - this._tx);
        this._x -= dist * this._lerpAlpha;
    }
    if (this._y < this._ty) {
        var dist = Math.abs(this._y - this._ty);
        this._y += dist * this._lerpAlpha;
    }
    if (this._y > this._ty) {
        var dist = Math.abs(this._y - this._ty);
        this._y -= dist * this._lerpAlpha;
    }
    // Set to graphics
    this._graphics.x = Math.floor(this._x + this._graphics.width / 2);
    this._graphics.y = Math.floor(this._y + this._graphics.height / 2);
    this._light.x = Math.floor(this._x + this._light.width / 2);
    this._light.y = Math.floor(this._y + this._light.height / 2);
};

NB_Button.prototype.setMasterOpacity = function(opc) {
    this._masterOpacity = opc;
};

NB_Button.prototype.activate = function() {
    this._active = true;
};

NB_Button.prototype.deactivate = function() {
    this._active = false;  
};

NB_Button.prototype.updateOpacity = function() {
    var modifier = this._getOpacityModifier();
    var masterOpacityModifier = (this._masterOpacity / 255);
    this._graphics.opacity = Math.floor(this._masterOpacity * modifier);
    this._light.opacity = Math.floor(this._lightOpacity * masterOpacityModifier * modifier);
};

NB_Button.prototype.updateTone = function() {
    var gray = this._getDesiredGrayLevel();
    if (this._graphics.getGrayLevel() !== gray) {
        this._graphics.setColorTone([0, 0, 0, gray]);
    }
    if (this._light.getGrayLevel() !== gray) {
        this._light.setColorTone([0, 0, 0, gray]);
    }
};

NB_Button.prototype.mouseInside = function() {
    return (TouchInput.insideRegion(this._x, this._y, this._graphics.width, this._graphics.height));
};

NB_Button.prototype.update = function() {
    this._syncPosition();
    
    if (this._invalidated) {
        if (this._invalidatedModifier > 80) {
            this._invalidatedModifier -= 2;
        }
    } else {
        if (this._invalidatedModifier < 100) {
            this._invalidatedModifier += 2;
        }
    }
    
    if (this._faded) {
        if (this._enlargeIfFaded) {
            this._graphics.scale.x += 0.005;
            this._graphics.scale.y += 0.005;
            this._light.scale.x += 0.005;
            this._light.scale.y += 0.005;
        }
        this._fadedOpacity -= 12;
        if (this._fadedOpacity <= 0) {
            this._fadedOpacity = 0;
            this._graphics.visible = false;
            this._light.visible = false;
            this._completelyFaded = true;
        }
    } else {
        if (this._fadedOpacity < 255) {
            this._fadedOpacity += 12;
            if (this._fadedOpacity > 255) {
                this._fadedOpacity = 255;
            }
        }
        if (!this._graphics.visible) this._graphics.visible = true;
        if (!this._light.visible) this._light.visible = true;
        if (this._completelyFaded) this._completelyFaded = false;
        if (this._active) {
            if (this._lightOpacity < 255) this._lightOpacity += 15;
        } else {
            if (this._lightOpacity > 0) this._lightOpacity -= 15;
        }
    }
    this.updateOpacity();
    this.updateTone();
};

NB_Button.prototype._getOpacityModifier = function() {
    return (this._fadedOpacity / 255) * (this._invalidatedModifier / 100);
};

NB_Button.prototype._getDesiredGrayLevel = function() {
    return Math.floor((100-this._invalidatedModifier)*10);
};

/****************************************************************
 * A special paintable button
 ****************************************************************/

function NB_CanvasButton() {
    this.initialize.apply(this, arguments);
}

NB_CanvasButton.prototype = Object.create(NB_Button.prototype);
NB_CanvasButton.prototype.constructor = NB_Button;

NB_CanvasButton.prototype.initialize = function(bkgPath, bkg, lightPath, light, cw, ch, x, y, masterOpacity) {
    this._upperCanvas = new Sprite(new Bitmap(cw, ch));
    this._upperCanvas.anchor.x = 0.5;
    this._upperCanvas.anchor.y = 0.5;
    this._upperCanvas.bitmap.smooth = true;
    this._lowerCanvas = new Sprite(new Bitmap(cw, ch));
    this._lowerCanvas.anchor.x = 0.5;
    this._lowerCanvas.anchor.y = 0.5;
    this._lowerCanvas.bitmap.smooth = true;
    NB_Button.prototype.initialize.call(this, bkgPath, bkg, lightPath, light, null, null, x, y, masterOpacity);
};

// Override!
NB_CanvasButton.prototype.addToContainer = function(container) {
    container.addChild(this._graphics);
    container.addChild(this._lowerCanvas);
    container.addChild(this._light);
    container.addChild(this._upperCanvas);
};

// Override!
NB_CanvasButton.prototype.removeFromContainer = function(container) {
    container.removeChild(this._graphics);
    container.removeChild(this._lowerCanvas);
    container.removeChild(this._light);
    container.removeChild(this._upperCanvas);
};
 
NB_CanvasButton.prototype._syncPosition = function() {
    NB_Button.prototype._syncPosition.call(this);
    this._upperCanvas.x = Math.floor(this._x + this._upperCanvas.width / 2);
    this._upperCanvas.y = Math.floor(this._y + this._upperCanvas.height / 2);
    this._lowerCanvas.x = Math.floor(this._x + this._lowerCanvas.width / 2);
    this._lowerCanvas.y = Math.floor(this._y + this._lowerCanvas.height / 2);
};

NB_CanvasButton.prototype.updateOpacity = function() {
    NB_Button.prototype.updateOpacity.call(this);
    var modifier = this._getOpacityModifier();
    this._upperCanvas.opacity = Math.floor(this._masterOpacity * modifier);
    this._lowerCanvas.opacity = Math.floor(this._masterOpacity * modifier);
};

NB_CanvasButton.prototype.updateTone = function() {
    NB_Button.prototype.updateTone.call(this);
    var gray = this._getDesiredGrayLevel();
    if (this._upperCanvas.getGrayLevel() !== gray) {
        this._upperCanvas.setColorTone([0, 0, 0, gray]);
    }
    if (this._lowerCanvas.getGrayLevel() !== gray) {
        this._lowerCanvas.setColorTone([0, 0, 0, gray]);
    }
};
 
NB_CanvasButton.prototype.getUpperCanvasBitmap = function() {
    return this._upperCanvas.bitmap;
};

NB_CanvasButton.prototype.getLowerCanvasBitmap = function() {
    return this._lowerCanvas.bitmap;
};
 
/****************************************************************
 * Button group
 ****************************************************************/

function NB_ButtonGroup() {
    this.initialize.apply(this, arguments);
}

NB_ButtonGroup.prototype.initialize = function(onlyActiveMouse) {
    this._buttons = [];
    this._activeId = 0;
    this._active = true;
    this._faded = false;
    this._onlyActiveMouse = onlyActiveMouse;
};

NB_ButtonGroup.prototype.activate = function() {
    this._activeId = 0;
    this._active = true;
};

NB_ButtonGroup.prototype.deactivate = function() {
    this._activeId = -1;
    this._active = false;
};

NB_ButtonGroup.prototype.add = function(button, activate) {
    this._buttons.push(button);
    if (activate) this._buttons[this._buttons.length-1].activate();
};

NB_ButtonGroup.prototype.get = function(id) {
    return this._buttons[id];
};

NB_ButtonGroup.prototype.size = function() {
    return this._buttons.length;
};

NB_ButtonGroup.prototype.setMasterOpacity = function(value) {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].setMasterOpacity(value);
    }
};

NB_ButtonGroup.prototype.addToContainer = function(container) {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].addToContainer(container);
    }  
};

NB_ButtonGroup.prototype.getActiveId = function() {
    return this._activeId;
};

NB_ButtonGroup.prototype.setActive = function(id) {
    this._activeId = id;
};

NB_ButtonGroup.prototype.trigger = function(enlarge) {
    this._buttons[this._activeId].fade(enlarge);
    return this._activeId;
};

NB_ButtonGroup.prototype.clickedOnActive = function() {
    return (this._buttons[this._activeId].mouseInside() && TouchInput.isTriggered());
};

NB_ButtonGroup.prototype.invalidateAllButActive = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        if (i != this._activeId) {
            this._buttons[i].invalidate();
        }
    }
};

NB_ButtonGroup.prototype.validateAll = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].validate();
    }
};

NB_ButtonGroup.prototype.fade = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].fade(false);
    }
    this._faded = true;
};

NB_ButtonGroup.prototype.unFade = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].unFade();
    }
    this._faded = false;
};

NB_ButtonGroup.prototype.completelyFaded = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        if (this._buttons[i].completelyFaded()) return true;
    }
    return false;
};

NB_ButtonGroup.prototype.update = function() {
    // Control button opacity
    for (var i = 0; i < this._buttons.length; i++) {
        if (this._activeId == i) {
            this._buttons[i].activate();
        } else {
            this._buttons[i].deactivate();
        }
        this._buttons[i].update();
    }
};

NB_ButtonGroup.prototype.updateInput = function(mouseActive, customUp, customDown) {
    if (!this._active) {
        return;
    }
    this._updateKeyboardInput(customUp, customDown);
    this._updateMouseInput(mouseActive);
};

NB_ButtonGroup.prototype._updateKeyboardInput = function(customUp, customDown) {
    if (Input.isTriggered(customUp || 'up')) {
        SoundManager.playCursor();
        if (this._activeId == 0) {
            this._activeId = this._buttons.length-1;
        } else {
            this._activeId--;
        }
    }
    if (Input.isTriggered(customDown || 'down')) {
        SoundManager.playCursor();
        if (this._activeId == this._buttons.length-1) {
            this._activeId = 0;
        } else {
            this._activeId++;
        }
    }
};

NB_ButtonGroup.prototype._updateMouseInput = function(mouseActive) {
    for (var i = 0; i < this._buttons.length; i++) {
        if (mouseActive) {
            if ((this._onlyActiveMouse && TouchInput.isTriggered() && this._buttons[i].mouseInside()) 
                || (!this._onlyActiveMouse && this._buttons[i].mouseInside())) {
                this._activeId = i;
            }
        }
    }
};

/****************************************************************
 * Button grid (based on button group)
 * Allows for buttons to be aligned in a grid.
 ****************************************************************/

function NB_ButtonGrid() {
    this.initialize.apply(this, arguments);
}

NB_ButtonGrid.prototype = Object.create(NB_ButtonGroup.prototype);
NB_ButtonGrid.prototype.constructor = NB_ButtonGrid;

NB_ButtonGrid.prototype.initialize = function(onlyActiveMouse, rows, columns) {
    NB_ButtonGroup.prototype.initialize.call(this, onlyActiveMouse);
    this._rows = rows;
    this._columns = columns;
};

// Override!
NB_ButtonGrid.prototype.updateInput = function(mouseActive) {
    if (!this._active) {
        return;
    }
    this._updateHorizontalKeyboardInput();
    this._updateVerticalKeyboardInput();
    this._updateMouseInput(mouseActive);
};

NB_ButtonGrid.prototype._updateHorizontalKeyboardInput = function() {
    if (Input.isTriggered('left')) {
        SoundManager.playCursor();
        var check1 = Math.floor(this._activeId / this._rows);
        var check2 = Math.floor((this._activeId-1) / this._rows);
        if (check1 === check2) {
            this._activeId--;
        } else {
            this._activeId += this._rows-1;
        }
    }
    if (Input.isTriggered('right')) {
        SoundManager.playCursor();
        var check1 = Math.floor(this._activeId / this._rows);
        var check2 = Math.floor((this._activeId+1) / this._rows);
        if (check1 === check2) {
            this._activeId++;
        } else {
            this._activeId -= this._rows-1;
        }
    }
};

NB_ButtonGrid.prototype._updateVerticalKeyboardInput = function() {
    if (Input.isTriggered('up')) {
        SoundManager.playCursor();
        this._activeId -= this._columns;
        if (this._activeId < 0) {
            this._activeId += this._buttons.length;
        }
    }
    if (Input.isTriggered('down')) {
        SoundManager.playCursor();
        this._activeId += this._columns;
        if (this._activeId > this._buttons.length-1) {
            this._activeId -= this._buttons.length;
        }
    }
};
 
/****************************************************************
 * List
 ****************************************************************/

function NB_List() {
    this.initialize.apply(this, arguments);
}

NB_List.prototype.initialize = function(x, y, visibleSize, lineHeight) {
    this._elements = [];
    this._container = new PIXI.Container();
    this._x = x;
    this._y = y;
    this._activeId = 0;
    this._active = true;
    this._visibleSize = visibleSize;
    this._lineHeight = lineHeight || 30; // optional parameter!
    this._firstVisibleId = 0;
};

NB_List.prototype.clickedOnActive = function() {
    return (this._elements[this._activeId].mouseInside() && TouchInput.isTriggered());
};

NB_List.prototype.activate = function() {
    this._activeId = 0;
    this._active = true;
};

NB_List.prototype.deactivate = function() {
    this._activeId = -1;
    this._active = false;
};

NB_List.prototype.addAbstractListElement = function(elem) {
    this._addAbstractListElement(elem, this._elements.length);
};

NB_List.prototype.addAbstractListElementAtIndex = function(elem, id) {
    if (id >= 0 && id <= this._elements.length) this._addAbstractListElement(elem, id);
};

NB_List.prototype.addListElement = function(text) {
    this._addListElement(text, this._elements.length);
};

NB_List.prototype.addListElementAtIndex = function(text, id) {
    if (id >= 0 && id <= this._elements.length) this._addListElement(text, id);
};

NB_List.prototype.addCanvasListElement = function(basePath, base, lightPath, light, cw, ch) {
    this._addCanvasListElement(basePath, base, lightPath, light, cw, ch, this._elements.length);
};

NB_List.prototype.addCanvasListElementAtIndex = function(basePath, base, lightPath, light, cw, ch, id) {
    if (id >= 0 && id <= this._elements.length) this._addCanvasListElement(basePath, base, lightPath, light, cw, ch, id);
};

NB_List.prototype._addAbstractListElement = function(elem, id) {
    this._elements.splice(id, 0, elem);
    elem.setPosition(this._x, this._y);
    elem.setTarget(this._x, this._y);
    elem.setMasterOpacity(0);
    elem.addToContainer(this._container);
    elem.hide();
    this.unfoldFromFirstVisible();
};

NB_List.prototype._addListElement = function(text, id) {
    var elem = new NB_Button(null, null, null, null, text, NB_Interface.fontColor, this._x, this._y, 0);
    this._elements.splice(id, 0, elem);
    elem.addToContainer(this._container);
    elem.hide();
    this.unfoldFromFirstVisible();
};

NB_List.prototype._addCanvasListElement = function(basePath, base, lightPath, light, cw, ch, id) {
    var elem = new NB_CanvasButton(basePath, base, lightPath, light, cw, ch, this._x, this._y, 0);
    this._elements.splice(id, 0, elem);
    elem.addToContainer(this._container);
    elem.hide();
    this.unfoldFromFirstVisible();
};

NB_List.prototype.removeById = function(id) {
    if (id >= 0 && id < this._elements.length) {
        var elem = this._elements.splice(id, 1)[0];
        elem.removeFromContainer(this._container);
        if (this._activeId == this._elements.length) {
            if (this._activeId > 0) this._activeId--;
        }
        if (this._activeId < this._firstVisibleId) {
            this._firstVisibleId--;
        }
        this.unfoldFromFirstVisible();
    }
};

NB_List.prototype.addToContainer = function(container) {
    container.addChild(this._container);
};

NB_List.prototype.unfoldFromFirstVisible = function() {
    for (var i = 0; i < this._elements.length; i++) {
        if (i < this._firstVisibleId) {
            this._elements[i].setTarget(this._x, this._y - this._lineHeight);
            this._elements[i].fade(true);
        } else {
            var relativeId = i - this._firstVisibleId;
            if (relativeId < this._visibleSize) {
                this._elements[i].setTarget(this._x, this._y + (relativeId * this._lineHeight));
                this._elements[i].unFade();
            } else {
                this._elements[i].setTarget(this._x, this._y + (this._visibleSize * this._lineHeight));
                this._elements[i].fade(true);
            }
        }
    }
};

NB_List.prototype.update = function() {
    for (var i = 0; i < this._elements.length; i++) {
        if (this._activeId == i) {
            this._elements[i].activate();
        } else {
            this._elements[i].deactivate();
        }
        this._elements[i].update();
    }
};

NB_List.prototype.scrollUp = function(playSound) {
    if (playSound) SoundManager.playCursor();
    if (this._activeId > 0) {
        this._activeId--;
        
        if (this._activeId < this._firstVisibleId) {
            this._firstVisibleId--;
            this.unfoldFromFirstVisible();
        }
        
    } else {
        this._activeId = this._elements.length-1;
        this._firstVisibleId = this._activeId - this._visibleSize + 1;
        if (this._firstVisibleId < 0) this._firstVisibleId = 0;
        this.unfoldFromFirstVisible();
    }
};

NB_List.prototype.scrollDown = function(playSound) {
    if (playSound) SoundManager.playCursor();
    if (this._activeId < this._elements.length-1) {
        this._activeId++;
        
        if (this._activeId - this._firstVisibleId >= this._visibleSize) {
            this._firstVisibleId++;
            this.unfoldFromFirstVisible();
        }
    } else {
        this._activeId = 0;
        this._firstVisibleId = 0;
        this.unfoldFromFirstVisible();
    }
};

NB_List.prototype.invalidateById = function(id) {
    this._elements[id].invalidate();
};

NB_List.prototype.getActiveId = function() {
    return this._activeId;
};

NB_List.prototype.getElementById = function(id) {
    return this._elements[id];
};

NB_List.prototype.isEmpty = function() {
    return this._elements.length === 0;
};

NB_List.prototype.getLength = function() {
    return this._elements.length;
};

NB_List.prototype.updateInput = function(mouseActive) {
    if (!this._active) {
        return;
    }
    if (Input.isRepeated('up') || TouchInput.wheelY < 0) {
        this.scrollUp(TouchInput.wheelY == 0);
    }
    if (Input.isRepeated('down') || TouchInput.wheelY > 0) {
        this.scrollDown(TouchInput.wheelY == 0);
    }
    for (var i = 0; i < this._elements.length; i++) {
        if (mouseActive && this._elements[i].mouseInside() && TouchInput.isTriggered()) {
            this._activeId = i;
        }
    }
};

NB_List.prototype.setMasterOpacity = function(value) {
    for (var i = 0; i < this._elements.length; i++) {
        this._elements[i].setMasterOpacity(value);
    }
};
