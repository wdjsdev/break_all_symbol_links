#target Illustrator
function breakAllSymbolLinks ()
{
	var valid = true;
	var scriptName = "break_all_symbol_links";

	function getUtilities ()
	{
		//check for dev mode
		var devUtilitiesPreferenceFile = File( "~/Documents/script_preferences/dev_utilities.txt" );
		var devUtilPath = "~/Desktop/automation/utilities/";
		var devUtils = [ devUtilPath + "Utilities_Container.js", devUtilPath + "Batch_Framework.js" ];
		function readDevPref ( dp ) { dp.open( "r" ); var contents = dp.read() || ""; dp.close(); return contents; }
		if ( readDevPref( devUtilitiesPreferenceFile ).match( /true/i ) )
		{
			$.writeln( "///////\n////////\nUsing dev utilities\n///////\n////////" );
			return devUtils;
		}






		var utilNames = [ "Utilities_Container" ];

		//not dev mode, use network utilities
		var OS = $.os.match( "Windows" ) ? "pc" : "mac";
		var ad4 = ( OS == "pc" ? "//AD4/" : "/Volumes/" ) + "Customization/";
		var drsv = ( OS == "pc" ? "O:/" : "/Volumes/CustomizationDR/" );
		var ad4UtilsPath = ad4 + "Library/Scripts/Script_Resources/Data/";
		var drsvUtilsPath = drsv + "Library/Scripts/Script_Resources/Data/";


		var result = [];
		for ( var u = 0, util; u < utilNames.length; u++ )
		{
			util = utilNames[ u ];
			var ad4UtilPath = ad4UtilsPath + util + ".jsxbin";
			var ad4UtilFile = File( ad4UtilsPath );
			var drsvUtilPath = drsvUtilsPath + util + ".jsxbin"
			var drsvUtilFile = File( drsvUtilPath );
			if ( drsvUtilFile.exists )
			{
				result.push( drsvUtilPath );
			}
			else if ( ad4UtilFile.exists )
			{
				result.push( ad4UtilPath );
			}
			else
			{
				alert( "Could not find " + util + ".jsxbin\nPlease ensure you're connected to the appropriate Customization drive." );
				valid = false;
			}
		}

		return result;

	}



	var utilities = getUtilities();




	for ( var u = 0, len = utilities.length; u < len && valid; u++ )
	{
		eval( "#include \"" + utilities[ u ] + "\"" );
	}

	log.l( "Using Utilities: " + utilities );

	if ( !valid ) return;

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

		if ( testItem.typename.match( /^PathItem/ ) && !testItem.filled && !testItem.stroked )
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