//Author-Xiaodong Liang
//Description- This is the app that retrieve the data which is emitted from socket server, and update the parameter accordingly.  

//socket server 
var socketServerURL = "http://adnxdsocket.herokuapp.com/";
var socketObj = null; 

//command
var commandIdOnQAT  = 'remoteDriveParamJS';
var commandIdOnPanel  = 'remoteDriveParamJS';  

//intial value before driving the parameter
var initialV;

var errorDescription = function(e) {
    return (e.description ? e.description : e);
};

var commandDefinitionById = function(id) {
    var app = adsk.core.Application.get();
    var ui = app.userInterface;
    if (!id) {
        ui.messageBox('commandDefinition id is not specified');
        return null;
    }
    var commandDefinitions_ = ui.commandDefinitions;
    var commandDefinition_ = commandDefinitions_.itemById(id);
    return commandDefinition_;
};

var commandControlByIdForQAT = function(id) {
    var app = adsk.core.Application.get();
    var ui = app.userInterface;
    if (!id) {
        ui.messageBox('commandControl id is not specified');
        return null;
    }
    var toolbars_ = ui.toolbars;
    var toolbarQAT_ = toolbars_.itemById('QAT');
    var toolbarControls_ = toolbarQAT_.controls;
    var toolbarControl_ = toolbarControls_.itemById(id);
    return toolbarControl_;
};

var commandControlByIdForPanel = function(id) {
    var app = adsk.core.Application.get();
    var ui = app.userInterface;
    if (!id) {
        ui.messageBox('commandControl id is not specified');
        return null;
    }
    var workspaces_ = ui.workspaces;
    var modelingWorkspace_ = workspaces_.itemById('FusionSolidEnvironment');
    var toolbarPanels_ = modelingWorkspace_.toolbarPanels;
    var toolbarPanel_ = toolbarPanels_.item(0);
    var toolbarControls_ = toolbarPanel_.controls;
    var toolbarControl_ = toolbarControls_.itemById(id);
    return toolbarControl_;
};

var destroyObject = function(uiObj, tobeDeleteObj) {
    if (uiObj && tobeDeleteObj) {
        if (tobeDeleteObj.isValid) {
            tobeDeleteObj.deleteMe();
        } else {
            uiObj.messageBox('tobeDeleteObj is not a valid object');
        }
    }
};

function run(context) {

    "use strict";
    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }

    var ui;
    try {
        var commandName = 'Remote Parameter';
        var commandDescription = 'Remote Parameter';
        var commandResources = './resources';
        
        var app = adsk.core.Application.get();
        ui = app.userInterface;
		
		var product = app.activeProduct;
		var design = adsk.fusion.Design(product);
        
		var  userName = app.userName;

        var onInputChanged = function(args) {
            try
            {
                var command = adsk.core.Command(args.firingEvent.sender);
                //ui.messageBox('Input: ' + command.parentCommandDefinition.id + ' changed event triggered');
				var inputs = command.commandInputs;
				
				var whichParamInput = inputs.itemById('paramDropdown');
				var currentParamValueInput = inputs.itemById('currentParamValue');
				var isToggleSocketInput = inputs.itemById('toggleSocket');
				
				var params = design.allParameters;

				var paramName = whichParamInput.selectedItem.name;
				var currentP =  params.itemByName(paramName);
				
				currentParamValueInput.value =  params.itemByName(paramName).value ;
				
				var isToggleSocket = isToggleSocketInput.value; 
				
				if(isToggleSocket){
					whichParamInput.isEnabled = false;
					
                    
                    initialV = currentParamValueInput.value;
					if(socketObj == null)
					    socketObj =  io(socketServerURL);
					
					if(socketObj){	
						 socketObj.off(userName);		
                         //watch the data that emit to this specific user.
						 socketObj.on(userName, function(msg){ 
						 
                            currentP.value = initialV * msg;
							args.isValidResult = true;
							var app = adsk.core.Application.get();
							app.activeViewport.refresh(); 

                            //looks there is an issue when updating the input in socket 
							//currentParamValueInput.value =  currentP.value ;

						});     
					}
				}
				else{
					whichParamInput.isEnabled = true; 
					args.isValidResult = true;
 					if(socketObj)
						socketObj.off(userName);
				} 
				
            } catch (e) {
                ui.messageBox('Input changed event failed: ' + errorDescription(e));
            }
        };

        var onCommandExecuted = function(args) {
            try {
                var command = adsk.core.Command(args.firingEvent.sender); 
		
				  if(socketObj){
						var app = adsk.core.Application.get();        
						var  userName = app.userName;
						socketObj.off(userName);
					}

            } catch (e) {
                ui.messageBox('command executed failed: ' + errorDescription(e));
            }
        };

      

        var onCommandCreatedOnPanel = function(args) {
            try {
                var command = args.command;
                command.execute.add(onCommandExecuted);
                command.inputChanged.add(onInputChanged);

                var commandInputs_ = command.commandInputs;
				
				var dropDownCommandInput_ = commandInputs_.addDropDownCommandInput('paramDropdown', 'Parameters',   adsk.core.DropDownStyles.LabeledIconDropDownStyle);
				var dropDownItems_ = dropDownCommandInput_.listItems;
				
				var paramsList = design.allParameters;
				for(var index = 0 ;index < paramsList.count ;index ++){
					if(index ==0)
						dropDownItems_.add(paramsList.item(index).name, true);
					else
						dropDownItems_.add(paramsList.item(index).name, false);
				} 
				
				commandInputs_.addBoolValueInput('toggleSocket', 'Remote Enabled', true);				
                var currentParamValueInput = 
						commandInputs_.addValueInput('currentParamValue', 'Value', 'm',               
                                                     adsk.core.ValueInput.createByString('0.0 m'));
				
				if(paramsList.count >0)
                {currentParamValueInput.value = paramsList.item(0).value;
            }
				 
                currentParamValueInput.isEnabled = false;
 
            } catch (e) {
                ui.messageBox('Panel command created failed: ' + errorDescription(e));
            }
        };

        var commandDefinitions_ = ui.commandDefinitions;


        // add a command on create panel in modeling workspace
        var workspaces_ = ui.workspaces;
        var modelingWorkspace_ = workspaces_.itemById('FusionSolidEnvironment');
        var toolbarPanels_ = modelingWorkspace_.toolbarPanels;
        var toolbarPanel_ = toolbarPanels_.item(0); // add the new command under the first panel
        var toolbarControlsPanel_ = toolbarPanel_.controls;
        var toolbarControlPanel_ = toolbarControlsPanel_.itemById(commandIdOnPanel);
        if (!toolbarControlPanel_) {
            var commandDefinitionPanel_ = commandDefinitions_.itemById(commandIdOnPanel);
            if (!commandDefinitionPanel_) {
                commandDefinitionPanel_ = commandDefinitions_.addButtonDefinition(commandIdOnPanel, commandName, commandDescription, commandResources);
            }
            commandDefinitionPanel_.commandCreated.add(onCommandCreatedOnPanel);
            toolbarControlPanel_ = toolbarControlsPanel_.addCommand(commandDefinitionPanel_, commandIdOnPanel);
            toolbarControlPanel_.isVisible = true;
         }
    }
    catch (e) {
        if (ui) {
            ui.messageBox('AddIn Start Failed : ' + errorDescription(e));
        }
    }
}

function stop(context) {
    var ui;
    try {
	    
        var app = adsk.core.Application.get();
        ui = app.userInterface;
		var  userName = app.userName;

				
         var objArrayPanel = []; 
		
		if(socketObj) 
			socketObj.off(userName);
						 
        
        var commandControlPanel_ = commandControlByIdForPanel(commandIdOnPanel);
        if (commandControlPanel_) {
            objArrayPanel.push(commandControlPanel_);
        }
        var commandDefinitionPanel_ = commandDefinitionById(commandIdOnPanel);
        if (commandDefinitionPanel_) {
            objArrayPanel.push(commandDefinitionPanel_);
        }
 
        objArrayPanel.forEach(function(obj){
            destroyObject(ui, obj);
        });

    } catch (e) {
        if (ui) {
            ui.messageBox('AddIn Stop Failed : ' + errorDescription(e));
        }
    }
}
