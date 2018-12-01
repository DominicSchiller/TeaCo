//######################################################
// Erstellt ein Item (Panel) für eine Suggestion
//######################################################
function createSuggestionElement(suggData) {
	
	//######################################################
	// Button pickSuggestion
	//######################################################
	var pick = new Ext.Button ({
		cls: 'btnPickSuggestion-'+((suggData.get('picked')) ? "picked" : "unpicked")+((suggestionPanel.restricted) ? " restricted" : "")+' btnSuggestion',
		pressedCls: '',
		isPicked: suggData.get('picked'),
		disabled: !suggData.get('pickable')
	});
	
	//######################################################
	// Button pickSuggestion onTap Handler
	// Toggelt die Grafik und die Eigenschaft isPicked
	//######################################################
	pick.on('tap',function(){
		if (!pick.isPicked) {
			pick.addCls('btnPickSuggestion-picked');
			pick.removeCls('btnPickSuggestion-unpicked');
		} else {
			pick.addCls('btnPickSuggestion-unpicked');
			pick.removeCls('btnPickSuggestion-picked');
		}
		pick.isPicked = !pick.isPicked;
		
		pickSuggestionHandler(suggData.get('meeting_id'), suggData.get('id'), pick.isPicked);
		
	},this);
	
	//######################################################
	// InfoPanel für Uhrzeit und Datum
	//######################################################
	var infoPanel = new Ext.Panel({
		html: suggData.get('date')+'<br />'+suggData.get('start')+' - '+suggData.get('end'),
		cls: 'suggestionInfoPanel'
	});
	
	//######################################################
	// Button editSuggestion
	// mit Handler: ActionSheet zeigen (restricted?)
	//######################################################
	var editButton = new Ext.Button({
		cls: 'btnEditSuggestion btnSuggestion',
		pressedCls: '',
		handler: function() {
			if (suggData.get('destroyable')) { 
				Ext.getCmp('deleteSuggestion').setDisabled(false);
				Ext.getCmp('deleteSuggestion').setHandler(function(){
					this.setDisabled(true);
					deleteSuggestionHandler(suggData.get('meeting_id'), suggData.get('id'));
				});
			} else
				Ext.getCmp('deleteSuggestion').setDisabled(true);
			
			Ext.getCmp('editSuggestion').setHandler(function(){
				editSuggSheet.hide();
				editSuggSheet.on('hide', function() {
					suggDatePicker.show();
				}, this, {single:true});
				//DatePicker aufs Datum der Suggestion setzen
				var dateArr = suggData.get('date_raw').split('-');
				var date = new Date(dateArr[0], dateArr[1]-1, dateArr[2]);
				suggDatePicker.setValue(date);
				
				//TimePicker auf Start- und Endzeit der Suggestion setzen
				var timeStartArr = suggData.get('start').split(':');
				var timeEndArr = suggData.get('end').split(':');
				suggTimePicker.setValue({
					fromMinutes: timeStartArr[1],
					fromHour: timeStartArr[0],
					toMinutes: timeEndArr[1],
					toHour: timeEndArr[0]
				});
				
				suggTimePicker.on('change', function () {
					updateSuggestionHandler(suggDatePicker.getValue(), suggTimePicker.getValue(), suggData.get('meeting_id'), suggData.get('id'));
				}, this, {single:true});
			});
			
			editSuggTimes.update(suggData.get('date')+' '+suggData.get('start')+' - '+suggData.get('end'));
			
			editSuggParticipants.removeAll();
			for (var i = 0, len = suggData.get('votes').length; i<len; i++) {
				if (suggData.get('votes')[i]["decision"] == "yes") {
					vcolor = "green";
					decision = _yes;
				} else if (suggData.get('votes')[i]["decision"] == "maybe") {
					vcolor = "yellow";
					decision = _maybe;
				} else if (suggData.get('votes')[i]["decision"] == "no") {
					vcolor = "red";
					decision = _no;
				} else if (suggData.get('votes')[i]["decision"] == "?") {
					vcolor = "gray";
					decision = "?";
				}
				editSuggParticipants.add({ html: '<div class="part_name">'+suggData.get('votes')[i]["name"]+'</div><div class="part_vote '+vcolor+'">'+decision+'</div>' });
			}
			
			editSuggTimes.doLayout();
			editSuggParticipants.doLayout();
			editSuggSheet.doLayout();
			
			editSuggSheet.show();
		}
	});
	
	//######################################################
	// Roter Button
	//######################################################
	var redButton = new Ext.Button({
		cls: 'btnVoteSuggestion-red-unvoted btnSuggestion',
		pressedCls: '',
		handler: tapRedButtonAndSave
	});
	
	//######################################################
	// Rot markieren und an Rails senden
	//######################################################
	function tapRedButtonAndSave() {
		tapRedButton();
		voteSuggestionHandler(suggData.get('meeting_id'), suggData.get('id'), suggData.get('vote_id'), 'no');
	}
	
	//######################################################
	// Rot markieren
	//######################################################
	function tapRedButton() {
		redButton.addCls('btnVoteSuggestion-red-voted');
		redButton.removeCls('btnVoteSuggestion-red-unvoted');
		yellowButton.addCls('btnVoteSuggestion-yellow-unvoted');
		yellowButton.removeCls('btnVoteSuggestion-yellow-voted');
		greenButton.addCls('btnVoteSuggestion-green-unvoted');
		greenButton.removeCls('btnVoteSuggestion-green-voted');
	}
	
	//######################################################
	// Gelber Button
	//######################################################
	var yellowButton = new Ext.Button({
		cls: 'btnVoteSuggestion-yellow-unvoted btnSuggestion',
		pressedCls: '',
		handler: tapYellowButtonAndSave
	});

	//######################################################
	// Gelb markieren und an Rails senden
	//######################################################
	function tapYellowButtonAndSave() {
		tapYellowButton();
		voteSuggestionHandler(suggData.get('meeting_id'), suggData.get('id'), suggData.get('vote_id'), 'maybe');
	}
	
	//######################################################
	// Gelb markieren
	//######################################################
	function tapYellowButton() {
		redButton.addCls('btnVoteSuggestion-red-unvoted');
		redButton.removeCls('btnVoteSuggestion-red-voted');
		yellowButton.addCls('btnVoteSuggestion-yellow-voted');
		yellowButton.removeCls('btnVoteSuggestion-yellow-unvoted');
		greenButton.addCls('btnVoteSuggestion-green-unvoted');
		greenButton.removeCls('btnVoteSuggestion-green-voted');
	}
		
	//######################################################
	// Grüner Button
	//######################################################
	var greenButton = new Ext.Button({
		cls: 'btnVoteSuggestion-green-unvoted btnSuggestion',
		pressedCls: '',
		handler: tapGreenButtonAndSave
	});

	//######################################################
	// Grün markieren und an Rails senden
	//######################################################
	function tapGreenButtonAndSave() {
		tapGreenButton();
		voteSuggestionHandler(suggData.get('meeting_id'), suggData.get('id'), suggData.get('vote_id'), 'yes');
	}
	
	//######################################################
	// Grün markieren
	//######################################################	
	function tapGreenButton() {
		redButton.addCls('btnVoteSuggestion-red-unvoted');
		redButton.removeCls('btnVoteSuggestion-red-voted');
		yellowButton.addCls('btnVoteSuggestion-yellow-unvoted');
		yellowButton.removeCls('btnVoteSuggestion-yellow-voted');
		greenButton.addCls('btnVoteSuggestion-green-voted');
		greenButton.removeCls('btnVoteSuggestion-green-unvoted');
	}
	
	//######################################################
	// Aktuelles Voting Darstellen
	//######################################################
	if (suggData.get('own_vote') == 'no') tapRedButton();
	else if (suggData.get('own_vote') == 'maybe') tapYellowButton();
	else if (suggData.get('own_vote') == 'yes') tapGreenButton();
	
	//######################################################
	// Panel mit allen Button und Info (obiger Teil)
	//######################################################
	var suggPartTop = new Ext.Panel({
		layout: {
			type: 'hbox',
			align: 'stretch',
			pack: 'justify'
		},
		items: [
			pick,
			{ xtype: 'spacer' },
			infoPanel,
			editButton,
			{ xtype: 'spacer' },
			redButton,
			yellowButton,
			greenButton
		]
	});
	
	//######################################################
	// Panel mit Abstimmungdsbalken (unterer Teil)
	//######################################################
	var suggPartBottom = new Ext.Panel({
		layout: 'fit',
		id: 'votebar_'+suggData.get('meeting_id')+'_'+suggData.get('id'),
		html: '<div class="votebar">'+suggData.get('votebar')+'</div>'
	});
	
	//######################################################
	// Panel mit obigem und unterem Teil (return)
	//######################################################
	var suggestion = new Ext.Panel({
		maxHeight: 50,
		items: [
			suggPartTop,
			suggPartBottom
		],
		style: 'padding:5px;border-bottom:1px solid #999;'
	});
	
	return suggestion;
}