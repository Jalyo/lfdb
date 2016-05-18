//specificités browser
var FFBrowser = (document.implementation && document.implementation.createDocument);
var IEBrowser = window.ActiveXObject;

// affichages des  traces pour player.swf
var displayPlayerDebug = false;
// affichages des  traces pour VnmPlayer.swf
var displayVnmPlayerDebug = false;
// affichage de la fenetre de debug au lancement
var displayWindowDebug = false;
// affichage du texte de debug : blocage de l affichage du texte (modifie par le bouton '||Pause' / '|> Continuer')
var displayDebug = true;
var debugText = "";

// nombre d elements par ligne
var SCROLL_SIZE = 3;
// nombre de lignes de videos pour la recherche
var NB_LIGNES_RECH = 3;
// nombre de pages maximum pour la recherche
var NB_PAGES_RECH = 13;
// nombre de videos maximum
var NB_VIDEOS_MAX = NB_PAGES_RECH*NB_LIGNES_RECH*SCROLL_SIZE;

var weekDays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// retourne un object pour effectuer une requete http selon le navigateur
function getHttpRequest()
{
	var httpReq = null;
	if (window.XMLHttpRequest) // code for all new browsers
		httpReq = new XMLHttpRequest();
	else if (window.ActiveXObject) 	// code for IE5 and IE6
		httpReq = new ActiveXObject("Microsoft.XMLHTTP");
	return httpReq;
}

// retourne le libelle d'une vignette
function getLibelle(date, titre, libelle, pub)
{
	var content = "";
	var aDate = new Date();
	var lg = 0;
		
	aDate.setTime(date);
	content = '<span class="date"><span class="jour">' + aDate.getDate() + '</span><span class="mois">' + months[aDate.getMonth()] + '</span><span class="annee">' + aDate.getFullYear() + '</span></span>';
	content += '<span class="titre">';
	if (titre.length > 0) {
		lg = pub ? 120 : 68;
		content += ( (titre.length > lg) ? (titre.substring(0,lg-1) + '...') : titre);
	} else {
		lg = 68;
		content += ( (libelle.length > lg) ? (libelle.substring(0,lg-1) + '...') : libelle) ;
	}
	if (!pub)
		content+='<span class="depublie">Non disponible. Demandez la mise en ligne en cliquant ici.</span>';
	content += '</span>';
	return content;
}

function getToolTip(date, titre, libelle)
{
	var content = "";
	var aDate = new Date();

	aDate.setTime(date);
	content = "<span class='date'><span class='jour'>" + aDate.getDate() + "</span><span class='mois'>" + months[aDate.getMonth()] + "</span><span class='annee'>" + aDate.getFullYear() + "</span></span>";

	if (titre.length > 0)
		content += titre;

	/*if (libelle.length > 0)
		content += libelle;*/

	return content;
}

function getLink(mediaId, synchroId, date, titre)
{
	return 'video.'+mediaId+'.'+toCmpString(( (titre.length > 100) ? titre.substring(0,99) : titre)+'-'+getShortDate(date))+((synchroId==0)?'':('?timecode='+synchroId));
}

function getName(date, titre)
{
	var aDate = new Date();
	aDate.setTime(date);
	return '"' + titre + '" du ' + getShortDate(date);
}

function getDate(date)
{
	var aDate = new Date();
	aDate.setTime(date);
	return weekDays[aDate.getDay()] + " " + getShortDate(date);
}

function getShortDate(date)
{
	var aDate = new Date();
	aDate.setTime(date);
	return aDate.getDate() + " " + months[aDate.getMonth()] + " " + aDate.getFullYear();
}

// critere de tri : comparaison des dates date1 et date2
function cmpDates(date1, date2)
{
	if (date1 > date2) return -1;
	if (date1 < date2) return 1;
	return 0; 
}

// critere de tri : comparaison des items par date et heure
function cmpItemByDates(item1, item2)
{
	var cmp = cmpDates(item1.Date, item2.Date);
	if (cmp != 0)
		return cmp;
		
	var hhmm;
	var hour1 = 0;
	var hour2 = 0;
	if (item1.Hour)
	{
		hhmm = item1.Hour.split(":");
		hour1 = eval(hhmm[0])*100+eval(hhmm[1]);
		if (item2.Hour)
		{
			hhmm = item2.Hour.split(":");
			hour2 = eval(hhmm[0])*100+eval(hhmm[1]);
			if (hour1 > hour2) return -1;
			if (hour1 < hour2) return 1;
		}
	}
	return 0;
}

// critere de tri : comparaison des items par nom
function cmpItemByNames(item1, item2)
{
	if (item1.name > item2.name) return 1;
	if (item1.name < item2.name) return -1;
	return 0;
}

// Tri par ordre decroissant, avec un nombre max d elements
function triDates(t, maxItems, fctTri)
{
	if (t == null) return;
	
	// Tri par ordre alphabetique decroissant -> tri par date decroissante
    t.sort(eval(fctTri));
	
	if (maxItems>0 && t.length>maxItems)
		t.length = maxItems;
}

//Fonction de récupération des paramètres GET de la page
//Array Tableau associatif contenant les paramètres GET
function extractUrlParams(){
	var t = location.search.substring(1).split('&');
	var f = [];
	for (var i=0; i<t.length; i++){
		var x = t[ i ].split('=');
		f[x[0]]=x[1];
	}
	return f;
}

$(document).ready(function(){
	jQuery('#panier a').click(function (){
		panierOuvrir();
	});
});	
