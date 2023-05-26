#target Illustrator
function breakAllSymbolLinks ()
{
	var valid = true;
	var scriptName = "break_all_symbol_links";

	function getUtilities ()
	{
		var utilNames = [ "Utilities_Container" ]; //array of util names
		var utilFiles = []; //array of util files
		//check for dev mode
		var devUtilitiesPreferenceFile = File( "~/Documents/script_preferences/dev_utilities.txt" );
		function readDevPref ( dp ) { dp.open( "r" ); var contents = dp.read() || ""; dp.close(); return contents; }
		if ( devUtilitiesPreferenceFile.exists && readDevPref( devUtilitiesPreferenceFile ).match( /true/i ) )
		{
			$.writeln( "///////\n////////\nUsing dev utilities\n///////\n////////" );
			var devUtilPath = "~/Desktop/automation/utilities/";
			utilFiles = [ devUtilPath + "Utilities_Container.js", devUtilPath + "Batch_Framework.js" ];
			return utilFiles;
		}

		var dataResourcePath = customizationPath + "Library/Scripts/Script_Resources/Data/";

		for ( var u = 0; u < utilNames.length; u++ )
		{
			var utilFile = new File( dataResourcePath + utilNames[ u ] + ".jsxbin" );
			if ( utilFile.exists )
			{
				utilFiles.push( utilFile );
			}

		}

		if ( !utilFiles.length )
		{
			alert( "Could not find utilities. Please ensure you're connected to the appropriate Customization drive." );
			return [];
		}


		return utilFiles;

	}
	var utilities = getUtilities();

	for ( var u = 0, len = utilities.length; u < len && valid; u++ )
	{
		eval( "#include \"" + utilities[ u ] + "\"" );
	}

	if ( !valid || !utilities.length ) return;

	DEV_LOGGING = user === "will.dowling";

	var doc = app.activeDocument;
	var layers = doc.layers;
	var aB = doc.artboards;
	var swatches = doc.swatches;
	var obj = {};
	var arr = [];
	var curItem;
	var curSymbols = [];

	doc.selection = null;

	var doc = app.activeDocument;
	var layers = doc.layers;
	var layArray = afc( doc, "layers" );

	layArray.forEach( function ( lay )
	{
		lay.visible = true;
		lay.locked = false;
		afc( lay, "layers" ).forEach( function ( subLay )
		{
			subLay.visible = true;
			subLay.locked = false;
			if ( subLay.name.match( /usa\s*collars/i ) )
			{
				subLay.remove();
			}
		} );
	} )

	function cleanupSymbolContents ( item, dest )
	{
		var testItem = item;
		if ( item.typename.match( /compound/i ) )
		{
			if ( !item.pathItems.length )
			{
				item = cleanupCompoundPath( item );
			}
			testItem = item.pathItems[ 0 ];
		}

		if ( testItem.typename.match( /^PathItem/ ) && !testItem.filled && !testItem.stroked && !testItem.guides )
		{
			item.remove();
		}
		else
		{
			item.moveToEnd( dest );
		}

	}


	var symbols = afc( doc, "symbolItems" );

	var tmpLay = layers.add();
	tmpLay.name = "tmp";
	var outputLay = layers.add();
	outputLay.name = "output";

	symbols.forEach( function ( s, index )
	{
		var destGroup = outputLay.groupItems.add();
		destGroup.name = s.name;
		s.duplicate( tmpLay )
		tmpLay.symbolItems[ 0 ].breakLink();
		ungroup( tmpLay, destGroup, 0, cleanupSymbolContents );
		if ( afc( destGroup ).length > 0 )
		{
			destGroup.move( s, ElementPlacement.PLACEAFTER );
		}

		s.remove();
		afc( tmpLay ).forEach( function ( i ) { i.remove() } );
		afc( outputLay ).forEach( function ( i ) { i.remove() } );
	} )

	tmpLay.remove();
	outputLay.remove();

	doc.selection = null;


	layArray.forEach( function ( lay )
	{
		if ( lay.name.match( /bkgrd|guide/i ) )
		{
			lay.locked = true;
		}
	} )

	alert( "All Symbol Links Broken" )


}
breakAllSymbolLinks();