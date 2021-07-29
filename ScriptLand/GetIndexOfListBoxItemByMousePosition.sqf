_x ctrlAddEventHandler ["MouseButtonUp", {
        params ["_control", "_button", "_xPos", "_yPos", "_shift", "_ctrl", "_alt"];
        
        
        // Getting listbox's displayed size
        private _lbHeight = getNumber (configFile >> "RscDisplayInventory" >> "controls" >> _containerConfigClass >> "h");
        private _lbTopPos = getNumber (configFile >> "RscDisplayInventory" >> "controls" >> _containerConfigClass >> "y");
        private _lbBottomPos = _lbTopPos + _lbHeight;

        // Gettings full listbox's size
        private _lbRowHeight = getNumber (configFile >> "RscDisplayInventory" >> "controls" >> _containerConfigClass >> "rowHeight");
        private _lbRowOffset = getNumber (configFile >> "RscDisplayInventory" >> "controls" >> _containerConfigClass >> "itemSpacing");
        private _lbSize = lbSize _control;
        // Magic here! There is some offset in the bottom of the inventory listbox for Uniform/Vest/Backpack
        private _lbBottomOffset = [0, _lbRowHeight * 0.9] select (_containerType in ["UNIFORM_CONTAINER","VEST_CONTAINER","BACKPACK_CONTAINER"]);
        private _lbTotalItemsHeight = (_lbSize * _lbRowHeight) + (_lbSize - 1) * _lbRowOffset + _lbBottomOffset;

        // Position (top and bottom) of the displayed part of the Listbox
        private _lbScrollVertical = (ctrlScrollValues _control) select 0;
        private _scrolledTopPos = _lbScrollVertical * (_lbTotalItemsHeight - _lbHeight);
        private _scrolledBottomPos = _scrolledTopPos + _lbHeight;

        // Getting row number under mouse position (by interpolation position of the mouse over listbox viewport to to actual listbox position displayed)
        private _scrolledToLBPos = linearConversion [_lbTopPos, _lbBottomPos, _yPos, _scrolledTopPos, _scrolledBottomPos, false];
        private _index = -1 + ceil (_scrolledToLBPos / (_lbRowHeight + _lbRowOffset));
        
};
