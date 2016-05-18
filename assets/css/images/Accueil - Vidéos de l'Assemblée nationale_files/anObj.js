// Declaration des objets utilises pour les pages de l assemblee nationale

// liste des dossiers
var DOSSIER_SP = "Séance publique";
var DOSSIER_QG = "Questions au Gouvernement";
var DOSSIER_C  = "Commissions";
var DOSSIER_P  = "Président";
var DOSSIER_E  = "Évènements";
var DOSSIER_CH = "Connaissance, Histoire";
var DOSSIER_A  = "Autres";

// liste des dossiers avec filtre par dates
var fldWithDatesTab = new Array(DOSSIER_SP, DOSSIER_QG, DOSSIER_P, DOSSIER_E, DOSSIER_CH, DOSSIER_A, DOSSIER_C);
// liste des dossiers avec filtre par rubriques
var fldWithRubsTab  = new Array(DOSSIER_SP, DOSSIER_QG, DOSSIER_P, DOSSIER_E, DOSSIER_CH, DOSSIER_A);
// liste des dossiers avec filtre par commissions
var fldWithCommsTab = new Array(DOSSIER_C);

/////////////////////////
// Tableaux des dossiers //
//////////////////////

// constructeur
function folderTab()
{
	// liste des dossiers
	this.list = new Array();
	this.rubriquesList = null; // liste des rubriques disponibles (pour le filtre des colonnes de gauche si dossier concerne)
	this.commissionsList = null; // liste des commissions disponibles (pour le filtre des colonnes de gauche si dossier concerne)
	this.access = null;
	this.key = null;
	this.publicationId = 0;
	this.panierActif = ""; // selection panier
	this.lienBlogActif = ""; // lien vers blog
	this.telechargementActif = ""; // Téléchargement
	this.dureeDecoupe = 0; // durée max de la découpe
	this.path = ".";
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
folderTab.prototype.toString = function (sep)
{
	var i = 0;
	var dump = "";
	var item = null;
	
	if (sep == undefined)
		sep = "\n";
	
	// Affichage des parametres
	dump += ("- publicationId : "+ this.publicationId + sep);
	dump += ("- access : "+ this.access 
		+ " / key : "+ this.key 
		+ " / panierActif : " + this.panierActif 
		+ " / lienBlogActif : "+ this.lienBlogActif
		+ " / telechargementActif : "+ this.telechargementActif
		 + " / dureeDecoupe : "+ this.dureeDecoupe + sep);

	// dump de la liste des dossiers
	dump += sep + ("- DOSSIERS :"+ sep);
	for (i=0;i<this.list.length;i++)
	{
		item = this.getFolder(i);
		dump += "  - dossier " + item.id + " : " + sep;
		dump += item.toString(sep);
		dump += sep;
	}
	if (this.list.length == 0)
		dump += ("  ! Pas de dossiers" + sep);
	
	dump += (sep + "- RUBRIQUES :" + sep);
	if (this.rubriquesList != null)
	{
		// dump de la liste des rubriques
		for (i=0;i<this.rubriquesList.length;i++)
		{
			item = this.rubriquesList[i];
			dump += "  - rubrique " + item.id + " : " + sep;
			dump += item.toString(sep);
		}
	}
	else
		dump += ("  ! Pas de rubriques" + sep);
	
	dump += (sep + "- COMMISSIONS :" + sep);
	if (this.commissionsList != null)
	{
		// dump de la liste des commissions
		for (i=0;i<this.commissionsList.length;i++)
		{
			item = this.commissionsList[i];
			dump += "  - commission " + item.id + " : " + sep;
			dump += item.toString(sep);
		}
	}
	else
		dump += ("  ! Pas de commissions" + sep);
	
	return dump;
}

// efface le contenu
folderTab.prototype.empty = function ()
{
	var i=0;
	var aLen = 0;
	var item = null;
	
	if (this.list != null)
	{
		aLen = this.list.length-1;
		for (i=aLen;i>=0;i--)
		{
			item = this.getFolder(i);
			item.empty();
			// efface l element courant
			this.list[i] = null;
		}
		// retire tous les elements du tableau
		this.list.splice(0, (aLen+1));
	}
	
	if (this.rubriquesList != null)
	{
		aLen = this.rubriquesList.length-1;
		for (i=aLen;i>=0;i--)
		{
			// efface l element courant
			this.rubriquesList[i] = null;
		}
		// retire tous les elements du tableau
		this.rubriquesList.splice(0, (aLen+1));
	}

	if (this.commissionsList != null)
	{
		aLen = this.commissionsList.length-1;
		for (i=aLen;i>=0;i--)
		{
			// efface l element courant
			this.commissionsList[i] = null;
		}
		// retire tous les elements du tableau
		this.commissionsList.splice(0, (aLen+1));
	}
}

// retourne le dossier en position index
folderTab.prototype.getFolder = function (index)
{
	if ((index >= 0) && (index < this.list.length))
		return this.list[index];

	// pas de dossier correspondant
	return null;
}

// retourne le dossier d id folderId
folderTab.prototype.getFolderById = function (folderId)
{
	var nbFolders = this.list.length;
	for (var i=0;i<nbFolders;i++)
		if (this.list[i].id == folderId)
			return this.list[i];
	
	// pas de dossier correspondant
	return null;
}

// retourne le dossier de nom folderName
folderTab.prototype.getIndexByName = function (folderName)
{
	folderName = toCmpString(folderName);
	var nbFolders = this.list.length;
	for (var i=0;i<nbFolders;i++)
		if (toCmpString(this.list[i].name) == folderName)
			return i;
	
	// pas de dossier correspondant : premier dossier retourne
	return 0;
}

// retourne le dossier d id folderId
folderTab.prototype.getIndexById = function (folderId)
{
	var nbFolders = this.list.length;
	for (var i=0;i<nbFolders;i++)
		if (this.list[i].id == folderId)
			return i;
	
	// pas de dossier correspondant : premier dossier retourne
	return 0;
}

// retourne le nombre de dossiers
folderTab.prototype.getNbFolder = function ()
{
	return this.list.length;
}

// ajout d un dossier
folderTab.prototype.addFolder = function (defaultId, id, name)
{
	if (this.list == null)
		this.list = new Array();

	var newFolder = new folder (defaultId, id, name);
	this.list[this.list.length] = newFolder;
	
	return this.list[(this.list.length-1)];
}


// Retourne la liste des rubriques pour le filtre
folderTab.prototype.getRubriquesList = function ()
{
	return this.rubriquesList;
}

// retourne l index de la rubrique d id id (-1 si pas de rubrique correspondante)
folderTab.prototype.getRubriqueIndexById = function (id)
{
	if (this.rubriquesList == null)
		return -1;
	
	var nbRub = this.rubriquesList.length;
	for (var i=0;i<nbRub;i++)
		if (this.rubriquesList[i].id == id)
			return i;
	
	return -1;
}

// retourne l index de la rubrique de nom name (-1 si pas de rubrique correspondante)
folderTab.prototype.getRubriqueIndexByName = function (name)
{
	if (this.rubriquesList == null)
		return -1;
	
	name = toCmpString(name);
	var nbRub = this.rubriquesList.length;
	for (var i=0;i<nbRub;i++)
		if (toCmpString(this.rubriquesList[i].name) == name)
			return i;
	
	return -1;
}

// ajout d une rubrique
folderTab.prototype.addRubrique = function (id, name)
{
	if (this.rubriquesList == null)
		this.rubriquesList = new Array();
	
	var newRubrique = new rubrique (id, name);
	this.rubriquesList[this.rubriquesList.length] = newRubrique;
}


// Retourne la liste des commissions pour le filtre
folderTab.prototype.getCommissionsList = function ()
{
	return this.commissionsList;
}

// retourne l index de la commission d id id (-1 si pas de commission correspondante)
folderTab.prototype.getCommissionIndexById = function (id)
{
	if (this.commissionsList == null)
		return -1;
	
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (this.commissionsList[i].id == id)
			return i;
	
	return -1;
}

// retourne l index de la commission de nom name (-1 si pas de commission correspondante)
folderTab.prototype.getCommissionIndexByName = function (name)
{
	if (this.commissionsList == null)
		return -1;
	
	name = toCmpString(name);
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (toCmpString(this.commissionsList[i].name) == name)
			return i;
	
	return -1;
}

// retourne l index de la commission de libelle court label (-1 si pas de commission correspondante)
folderTab.prototype.getCommissionIndexByLabel = function (label)
{
	if (this.commissionsList == null)
		return -1;
	
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (this.commissionsList[i].label == label)
			return i;
	
	return -1;
}

// ajout d une commission
folderTab.prototype.addCommission = function (id, name, label)
{
	if (this.commissionsList == null)
		this.commissionsList = new Array();
	
	var newCommission = new commission (id, name, label);
	this.commissionsList[this.commissionsList.length] = newCommission;
}

folderTab.prototype.readConfig = function (data)
{
	var i=0; var j=0;
	var currentTag = data.VNPublication.Publication.Folder;
	var lstLenTag = currentTag.length-2;
	var lstLen = 0;
	var items;
	
	// recuperation des infos des sous-menus	
	this.list = null;	
	for (i=0;i<lstLenTag;i++)
	{
		this.addFolder(currentTag[i].defaultId, currentTag[i].id, currentTag[i].Name, currentTag[i].type);
	}
	
	// recuperation de la liste des rubriques et des commissions
	this.rubriquesList == null;
	this.commissionsList == null;
	currentTag = data.VNPublication.Publication.Metadata.Meta;
	lstLenTag = currentTag.length;
	for (i=0;i<lstLenTag;i++)
	{
		if (currentTag[i].name == "Rubrique")
		{
			items = getJSONarray(currentTag[i].Enum);
			lstLen = items.length;
			for (j=0;j<lstLen;j++)
				this.addRubrique(items[j].id, items[j].value);
		}
		else if (currentTag[i].name == "Commission")
		{
			items = getJSONarray(currentTag[i].Enum);
			lstLen = items.length;
			for (j=0;j<lstLen;j++)
				this.addCommission(items[j].id, items[j].value, items[j].param);
		}
	}
}

//////////////
// Rubrique //
///////////

// constructeur
function rubrique(id, name)
{
	this.id = id;
	this.name = name;
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
rubrique.prototype.toString = function (sep)
{
	var dump = "";

	if (sep == undefined)
		sep = "\n";

	// Affichage des parametres
	dump += ("   - id : "+ this.id + sep);
	dump += ("   - name : "+ this.name + sep);
	
	return dump;
}

////////////////
// Commission //
/////////////

// constructeur
function commission(id, name, label)
{
	this.id = id;
	this.name = name;
	this.label = label;
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
commission.prototype.toString = function (sep)
{
	var dump = "";

	if (sep == undefined)
		sep = "\n";

	// Affichage des parametres
	dump += ("   - id : "+ this.id + sep);
	dump += ("   - name : "+ this.name + sep);
	dump += ("   - label : "+ this.label + sep);
	
	return dump;
}

/////////////
// Dossier //
//////////

// constructeur
function folder(defaultId, id, name)
{
	this.defaultId = defaultId;
	this.id = id;
	this.name = name;
	this.mediaList = null; // liste des items de la liste
	this.datesTab = null; // liste des dates disponibles (pour le filtre des colonnes de gauche si dossier concerne)
	this.rubriquesList = null; // liste des rubriques disponibles
	this.commissionsList = null; // liste des commissions disponibles
	this.loadingStatus = folder.LOAD_STATUS.MEDIA_NOT_LOADED;
	this.filters = 0; // filtres possibles

	// Filtre par dates
	for (var i=0;i<fldWithDatesTab.length;i++)
	{
		if (this.name == fldWithDatesTab[i])
			this.filters += folder.FILTERS.DATE_FILTER;
	}
	
	// Filtre par rubriques
	for (var i=0;i<fldWithRubsTab.length;i++)
	{
		if (this.name == fldWithRubsTab[i])
			this.filters += folder.FILTERS.RUBRIQUE_FILTER;
	}

	// Filtre par commissions
	for (var i=0;i<fldWithCommsTab.length;i++)
	{
		if (this.name == fldWithCommsTab[i])
			this.filters += folder.FILTERS.COMMISSIONS_FILTER;
	}
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
folder.prototype.toString = function (sep)
{
	var i = 0;
	var dump = "";
	var item = null;

	if (sep == undefined)
		sep = "\n";

	// Affichage des parametres
	dump += ("   - defaultId : "+ this.defaultId + sep);
	dump += ("   - id : "+ this.id + sep);
	dump += ("   - name : "+ this.name + sep);
	dump += ("   - loadingStatus : "+ this.loadingStatus + sep);
	dump += ("   - filters : "+ this.filters + sep);

	// dump de la liste des media
	dump += sep + ("   - MEDIA :"+ sep);
	if ((this.mediaList != null) && (this.mediaList.length != 0))
	{
		for (i=0;i<this.mediaList.length;i++)
		{
			item = this.mediaList[i];
			dump += "   - media " + item.Id + " : " + sep;
			dump += item.toString(sep);
			dump += sep;
		}
	}
	else
		dump += ("   ! Pas de media" + sep);

	// dump de la liste des dates disponibles
	dump += sep + ("   - DATES :"+ sep);
	if ((this.datesTab != null) && (this.datesTab.length != 0))
	{
		for (i=0;i<this.datesTab.length;i++)
		{
			item = this.datesTab[i];
			dump += "   - date " + item + sep;
		}
	}
	else
		dump += ("   ! Pas de dates disponibles" + sep);
	
	return dump;
}

// efface le contenu
folder.prototype.empty = function ()
{
	var i=0;
	var aLen = 0;
	var item = null;

	if (this.mediaList != null)
	{
		aLen = this.mediaList.length-1;		
		for (i=aLen;i>=0;i--)
		{
			item = this.mediaList[i];
			item.empty();
			// efface l element courant
			this.mediaList[i] = null;
		}
		// retire tous les elements du tableau
		this.mediaList.splice(0, (aLen+1));
	}

	return;
	if (this.datesTab != null)
	{
		aLen = this.datesTab.length-1;
		for (i=aLen;i>=0;i--)
		{
			// efface l element courant
			this.datesTab[i] = null;
		}
		// retire tous les elements du tableau
		this.datesTab.splice(0, (aLen+1));
	}
}

// dump pour un cookie
folder.prototype.toCookie = function ()
{
	var i = 0;
	var dump = "";
	var item = null;

	// dump de la liste des media
	if ((this.mediaList != null) && (this.mediaList.length != 0))
	{
		for (i=0;i<this.mediaList.length;i++)
		{
			item = this.mediaList[i];
			dump += item.toCookie();
			dump += "##";
		}
	}
	
	return dump;
}

// import depuis un cookie
folder.prototype.fromCookie = function (cookie)
{
	if (cookie == null || cookie.length <= 1)
		return;
	
	// parsing de la liste des media
	var reg = new RegExp("##");
	var items = cookie.split(reg);
	for (var i=0; i<items.length; i++)
	{
		if (items[i].length > 0)
		{
			var item = new media (0, "", "", "", "", "", "", "", "", "", "", -1)
			item.fromCookie(items[i]);
			this.addMedia2(item);
		}
	}
}

// status de chargement des media depuis le fichier du dossier
folder.LOAD_STATUS = {
	MEDIA_NOT_LOADED : 0,
	MEDIA_LOADING : 1,
	MEDIA_LOADED : 2
}

// Types des filtres possibles par dossier
folder.FILTERS = {
	DATE_FILTER : 1,
	RUBRIQUE_FILTER : 2,
	COMMISSIONS_FILTER : 4
}

// Nombre maximum de dates pour le filtre par dates
folder.MAX_FILTER_DATES = 500;

// recupere la liste des dates si necessaire depuis le fichier de config
folder.prototype.initFolder = function ()
{
	// on verifie si le dossier a deja ete charge
	if (this.loadingStatus != folder.LOAD_STATUS.MEDIA_NOT_LOADED)
		return;

	// on verifie si la rubrique comprend des dates
	for (var i=0;i<fldWithDatesTab.length;i++)
	{
		if (this.name == fldWithDatesTab[i])
		{
			// inutile avec le status : if (this.datesTab != null) return; // dates deja chargees
			// on construit la liste des dates a partir du fichier de config du dossier
			this.datesTab = new Array(); 
			break;
		}
	}
	
	// lecture des medias
	this.readFolderConfig();
}

folder.prototype.readFolderConfig = function ()
{
	// on verifie si le dossier a deja ete charge
	if (this.loadingStatus != folder.LOAD_STATUS.MEDIA_NOT_LOADED)
		return;
	
	// chargement du fichier
	var myJsonFile = anFolderTab.path + "/json/folder" + this.id + ".json";
	this.loadingStatus = folder.LOAD_STATUS.MEDIA_LOADING;

	jQuery.getJSON(myJsonFile + "?" + new Date() * Math.random(),
		function(data)
		{
			var myFolder = anFolderTab.getFolder(paramFolder-1);
			var datesLen = 0;

			if (myFolder.mediaList == null) 
				myFolder.mediaList = new Array();
			var items = getJSONarray(data.Publication.Folder.Media);

			jQuery.each(items, function(i,item){
				// Ajout du media courant
				myFolder.addMedia (
					item.id, item.Name, item.Description, 
					replaceServerUrl(item.Thumbnail),
					item.CreationDate, item.LastUpdate, item.Date, 
					item.Rubrique, item.Commission,
					replaceServerUrl(item.URL), item.Flux, item.Heure,
					replaceServerUrl(item.Skin), item.Published);

				// liste des dates pour filtres
				if (myFolder.datesTab != null) 
				{
					var addNewDate = true;
					var iDate = parseInt(item.Date);
					datesLen = myFolder.datesTab.length;
					for (var j=0;j<datesLen;j++)
					{
						if (iDate == myFolder.datesTab[j])
							addNewDate = false;
					}
					if (addNewDate)
						myFolder.datesTab[myFolder.datesTab.length] = iDate;
				}

				// liste des commissions pour filtres
				if (item.Commission != undefined) 
				{
					datesLen = (myFolder.commissionsList != null) ? myFolder.commissionsList.length : 0;
					var idstr = ""+item.Commission;
					var ids = idstr.split(",");
					// chaque media peut appartenir a plusieurs commissions
					for (var k=0;k<ids.length;k++)
					{
						var addNewComm = true;
						for (var j=0;j<datesLen;j++)
						{
							if (ids[k] == myFolder.commissionsList[j].id)
								addNewComm = false;
						}
						if (addNewComm)
						{
							var comm = anFolderTab.getCommissionsList()[anFolderTab.getCommissionIndexById(ids[k])];
							if (comm)
								myFolder.addCommission(comm.id, comm.name, comm.label);
						}
					}
				}
			});
			
			// Tri des medias par date decroissante
			triDates(myFolder.mediaList, 0, "cmpItemByDates");
			
			// Ajout des rubriques du dossier
			if (data.Publication.Folder.Rubriques != undefined)
			{
				var idstr = ""+data.Publication.Folder.Rubriques.Rubrique;
				var ids = idstr.split(",");
				for (var j=0;j<ids.length;j++)
				{
					// Ajout de la rubrique courante
					var rub = anFolderTab.getRubriquesList()[anFolderTab.getRubriqueIndexById(ids[j])];
					if (rub)
						myFolder.addRubrique (rub.id, rub.name);
				}
				// Tri des rubriques par ordre alphabetique
				triDates(myFolder.rubriquesList, 100, "cmpItemByNames");
			}
			
			// Tri des dates en ordre décroissant (avec gestion d un nombre max de dates : folder.MAX_FILTER_DATES)
			triDates(myFolder.datesTab, folder.MAX_FILTER_DATES, "cmpDates");
			
			// Tri des commissions par ordre alphabetique
			triDates(myFolder.commissionsList, 100, "cmpItemByNames");
			
			// chargement des donnees termine
			myFolder.loadingStatus = folder.LOAD_STATUS.MEDIA_LOADED;
		}
	);
}

// retourne la liste des media en fonction du filtre applique
folder.prototype.getMediaList = function (filterType, filterValue)
{
	var retList = new Array();
	var mlLen = (this.mediaList == undefined || this.mediaList == null)?0:this.mediaList.length;
	var fLen = 0;
	var fList = null;
	
	switch(filterType)
	{
		case "date": // filtre sur les dates
			for (var i=0;i<mlLen;i++)
			{
				if (filterValue == this.mediaList[i].Date)
					retList[retList.length] = this.mediaList[i];
			}
			return retList;
			break;
		case "rubr": // filtre sur les rubriques
			fList = this.getRubriquesList();
			for (var j=0;j<fList.length;j++)
				if (filterValue == fList[j].name)
				{
					filterValue = fList[j].id;
					break;
				}
			for (var i=0;i<mlLen;i++)
			{
				var idstr = ""+this.mediaList[i].Rubrique;
				var ids = idstr.split(",");
				for (var j=0;j<ids.length;j++)
					if (filterValue == ids[j])
						retList[retList.length] = this.mediaList[i];
			}
			return retList;
			break;
		case "comm": // filtre sur les commissions
			fList = this.getCommissionsList();
			for (var j=0;j<fList.length;j++)
			{
				if (filterValue == fList[j].name)
				{
					filterValue = fList[j].id;
					break;
				}
			}
			for (var i=0;i<mlLen;i++)
			{
				var idstr = ""+this.mediaList[i].Commission;
				var ids = idstr.split(",");
				for (var j=0;j<ids.length;j++)
					if (filterValue == ids[j])
						retList[retList.length] = this.mediaList[i];
			}
			return retList;
			break;
		default: // pas de filtre
			return this.mediaList;
			break;
	}
}

// Retourne la liste des dates pour le filtre
folder.prototype.getDatesList = function ()
{
	return this.datesTab;
}

// Determine si la date aDate est presente dans la liste des dates pour le filtre
folder.prototype.isDatePresent = function (sDate)
{
	if (this.datesTab == null)
	{
		return false;
	}
	
	var checkDate = sDate.split("/");
	var pDate = new Date(eval(checkDate[2]),eval(checkDate[1])-1,eval(checkDate[0]));
	var msDate = pDate.getTime();
	
	var nbDates = this.datesTab.length
	
	for (var i=0;i<nbDates;i++)
	{
		if (this.datesTab[i] == msDate)
			return true;
	}

	// date non trouvee
	return false;
}

// Retourne le type de filtres possibles
folder.prototype.getFilters = function ()
{
	return this.filters;
}

// ajout d un media
folder.prototype.addMedia = function (Id, Name, Description, Thumbnail, CreationDate, LastUpdateDate, Date, Rubrique, Commission, URL, Flux, Hour, UrlPlayer, Published)
{
	var newMedia = new media (Id, Name, Description, Thumbnail, CreationDate, LastUpdateDate, Date, Rubrique, Commission, URL, Flux, this.id, Hour, UrlPlayer, Published);
	
	return this.addMedia2(newMedia);
}

folder.prototype.addMedia2 = function (newMedia)
{
	if (this.mediaList == null)
		this.mediaList = new Array();

	// Ajout du media en fin de liste
	this.mediaList[this.mediaList.length] = newMedia;	
	return this.mediaList[(this.mediaList.length-1)];
}

folder.prototype.removeMedia = function (index)
{
	if (this.mediaList == null || index >= this.mediaList.length)
		return;

	this.mediaList[index].empty();
	this.mediaList.splice(index,1);
}

// retourne le media a la position index
folder.prototype.getMediaByIndex = function (index)
{
	if ((index >= 0) && (index < this.mediaList.length))
		return this.mediaList[index];

	// pas de media correspondant
	return null;
}

// retourne le media d id mediaId
folder.prototype.getMediaById = function (mediaId)
{
	if (this.mediaList == null)
		return null;
	var nbMedia = this.mediaList.length;
	for (var i=0;i<nbMedia;i++)
		if (this.mediaList[i].Id == mediaId)
			return this.mediaList[i];
	
	// pas de media correspondant
	return null;
}

// Retourne la liste des rubriques pour le filtre
folder.prototype.getRubriquesList = function ()
{
	return this.rubriquesList;
}

// retourne l index de la rubrique d id id (-1 si pas de rubrique correspondante)
folder.prototype.getRubriqueIndexById = function (id)
{
	if (this.rubriquesList == null)
		return -1;
	
	var nbRub = this.rubriquesList.length;
	for (var i=0;i<nbRub;i++)
		if (this.rubriquesList[i].id == id)
			return i;
	
	return -1;
}

// retourne l index de la rubrique de nom name (-1 si pas de rubrique correspondante)
folder.prototype.getRubriqueIndexByName = function (name)
{
	if (this.rubriquesList == null)
		return -1;
	
	name = toCmpString(name);
	var nbRub = this.rubriquesList.length;
	for (var i=0;i<nbRub;i++)
		if (toCmpString(this.rubriquesList[i].name) == name)
			return i;
	
	return -1;
}

// ajout d une rubrique
folder.prototype.addRubrique = function (id, name)
{
	if (this.rubriquesList == null)
		this.rubriquesList = new Array();
	
	var newRubrique = new rubrique (id, name);
	this.rubriquesList[this.rubriquesList.length] = newRubrique;
}

// Retourne la liste des commissions pour le filtre
folder.prototype.getCommissionsList = function ()
{
	return this.commissionsList;
}

// retourne l index de la commission d id id (-1 si pas de commission correspondante)
folder.prototype.getCommissionIndexById = function (id)
{
	if (this.commissionsList == null)
		return -1;
	
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (this.commissionsList[i].id == id)
			return i;
	
	return -1;
}

// retourne l index de la commission de nom name (-1 si pas de commission correspondante)
folder.prototype.getCommissionIndexByName = function (name)
{
	if (this.commissionsList == null)
		return -1;
	
	name = toCmpString(name);
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (toCmpString(this.commissionsList[i].name) == name)
			return i;
	
	return -1;
}

// retourne l index de la commission de libelle court label (-1 si pas de commission correspondante)
folder.prototype.getCommissionIndexByLabel = function (label)
{
	if (this.commissionsList == null)
		return -1;
	
	var nbComm = this.commissionsList.length;
	for (var i=0;i<nbComm;i++)
		if (this.commissionsList[i].label == label)
			return i;
	
	return -1;
}

// ajout d une commission
folder.prototype.addCommission = function (id, name, label)
{
	if (this.commissionsList == null)
		this.commissionsList = new Array();
	
	var newCommission = new commission (id, name, label);
	this.commissionsList[this.commissionsList.length] = newCommission;
}

// determine si le filtre par date est actif
folder.prototype.isDateFiltered = function ()
{
	return ((this.filters & folder.FILTERS.DATE_FILTER) == folder.FILTERS.DATE_FILTER);
}

// determine si le filtre par rubrique est actif
folder.prototype.isRubriqueFiltered = function ()
{
	return ((this.filters & folder.FILTERS.RUBRIQUE_FILTER) == folder.FILTERS.RUBRIQUE_FILTER);
}

// determine si le filtre par date est actif
folder.prototype.isCommissionFiltered = function ()
{
	return ((this.filters & folder.FILTERS.COMMISSIONS_FILTER) == folder.FILTERS.COMMISSIONS_FILTER);
}

////////////
// Media //
/////////

// constructeur
function media(Id, Name, Description, Thumbnail, CreationDate, LastUpdateDate, Date, Rubrique, Commission, URL, Flux, idFolder, Hour, UrlPlayer, Published)
{
	this.Id = Id;
	this.Name = Name;
	this.Description = Description;
	this.Thumbnail = Thumbnail;
	this.CreationDate = CreationDate;
	this.LastUpdateDate = LastUpdateDate;
	this.Date = parseInt(Date);
	this.Rubrique = Rubrique;
	this.Commission = Commission;
	this.urlToRead = URL;
	this.urlToDownload = "";
	this.urlPlayer = UrlPlayer;
	this.Flux = Flux;
	this.idFolder = idFolder;
	this.Hour = Hour;
	this.Published = Published;
	// liste des synchros
	this.synchroId = "";
	this.synchroList = null;
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
media.prototype.toString = function (sep)
{
	var i = 0;
	var dump = "";
	var item = null;

	if (sep == undefined)
		sep = "\n";

	// Affichage des parametres
	dump += ("    - Id : "+ this.Id + sep);
	dump += ("    - Name : "+ this.Name + sep);
	dump += ("    - Description : "+ this.Description + sep);
	dump += ("    - Thumbnail : "+ this.Thumbnail + sep);
	dump += ("    - CreationDate : "+ this.CreationDate + sep);
	dump += ("    - LastUpdateDate : "+ this.LastUpdateDate + sep);
	dump += ("    - Date : "+ this.Date + sep);
	dump += ("    - Rubrique : " + this.Rubrique + sep);
	dump += ("    - Commission : " + this.Commission + sep);
	dump += ("    - urlToRead : "+ this.urlToRead + sep);
	dump += ("    - urlToDownload : "+ this.urlToDownload + sep);
	dump += ("    - Flux : "+ this.Flux + sep);
	dump += ("    - idFolder : "+ this.idFolder + sep);
	dump += ("    - synchroId : "+ this.synchroId + sep);
	
	// dump de la liste des synchros
	dump += sep + ("    - SYNCHROS :"+ sep);
	if (this.synchroList != null)
	{
		for (i=0;i<this.synchroList.length;i++)
		{
			item = this.synchroList[i];
			dump += "     - synchro " + item.id + " : " + sep;
			dump += item.toString(sep);
			dump += sep;
		}
	}
	else
		dump += ("    ! Pas de synchros" + sep);
	
	return dump;
}

// efface le contenu
media.prototype.empty = function ()
{
	var i=0;
	var aLen = 0;
	if (this.synchroList != null)
	{
		aLen = this.synchroList.length-1;
		for (i=aLen;i>=0;i--)
		{
			// efface l element courant
			this.synchroList[i] = null;
		}
		// retire tous les elements du tableau
		this.synchroList.splice(0, (aLen+1));
	}
}

// dump pour un cookie
media.prototype.toCookie = function ()
{
	var dump = "";

	// Dump des parametres
	dump += this.Id + ":;";
	dump += this.Name + ":;";
	dump += this.Description + ":;";
	dump += this.Thumbnail + ":;";
	dump += this.Date + ":;";
	dump += this.urlToRead + ":;";
	dump += this.urlToDownload + ":;";
	dump += this.synchroId + ":;";
	dump += this.tcin + ":;";
	dump += this.tcout;
	
	return dump;
}

// import depuis un cookie
media.prototype.fromCookie = function (cookie)
{
	// parsing des parametres
	var reg = new RegExp(":;");
	var items = cookie.split(reg);
	if (items.length > 7)
	{
		this.Id = items[0];
		this.Name = items[1];
		this.Description = items[2];
		this.Thumbnail = items[3];
		this.Date = items[4];
		this.urlToRead = items[5];
		this.urlToDownload = items[6];
		this.synchroId = items[7];
		this.tcin = items[8];
		this.tcout = items[9];
	}
}

// ajout d une synchro
media.prototype.addSynchro = function (id, begin, region, src, synchroId, thumbnail, keyword, libelle)
{
	if (this.synchroList == null)
		this.synchroList = new Array();

	var newSynchro = new synchro (id, begin, region, src, synchroId, thumbnail, keyword, libelle);
	this.synchroList[this.synchroList.length] = newSynchro;
	
	return this.synchroList[(this.synchroList.length-1)];
}

// ajout d un tableau de synchro
media.prototype.addSynchroTab = function (synchroTab)
{
	this.synchroList = synchroTab;
	
	return this.synchroList;
}

// Retourne la liste des synchros
media.prototype.getSynchrosList = function ()
{
	return this.synchroList;
}

/////////////
//Synchro //
//////////

// constructeur
function synchro(id, begin, region, src, synchroId, thumbnail, keyword, libelle)
{
	this.id = id;
	this.begin = begin;
	this.region = region;
	this.src = src;
	this.synchroId = synchroId;
	this.thumbnail = thumbnail;
	this.keyword = keyword;
	this.libelle = libelle;
}

// dump (avec sep pour separateur de retour a la ligne : '<br/>' ou '\n' par exemple)
synchro.prototype.toString = function (sep)
{
	var dump = "";

	if (sep == undefined)
		sep = "\n";

	// Affichage des parametres
	dump += ("      - id : "+ this.id + sep);
	dump += ("      - begin : "+ this.begin + sep);
	dump += ("      - region : "+ this.region + sep);
	dump += ("      - src : "+ this.src + sep);
	dump += ("      - synchroId : "+ this.synchroId + sep);
	dump += ("      - thumbnail : "+ this.thumbnail + sep);
	dump += ("      - keyword : "+ this.keyword + sep);
	dump += ("      - libelle : "+ this.libelle + sep);
	
	return dump;
}

function toCmpString(str)
{
	var res = str.replace(/[ \'’?\/]/g,"-");
	res = res.replace(/[.,;:()"]/g,"");
	res = res.toLowerCase();
	res = res.replace(/[àâ]/g,"a");
	res = res.replace(/[èéêë]/g,"e");
	res = res.replace(/[ïî]/g,"i");
	res = res.replace(/[öô]/g,"o");
	res = res.replace(/[ùüû]/g,"u");
	res = res.replace(/ç/g,"c");
	return res;
}