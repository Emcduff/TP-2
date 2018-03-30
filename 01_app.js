"use strict";

const peupler = require("./mes_modules/peupler");
const express = require('express');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const tableau = require('./mes_modules/peupler/tableaux');

let longTabNom = tableau.tabNom.length;
let longTabPrenom = tableau.tabPrenom.length;

var util = require("util");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

let db;

//Établir la connection à la BDD et le serveur
MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
	if (err) return console.log(err);
	db = database.db('carnet_adresse');
	app.listen(8081, () => {});
});

//Route accueil
app.get('/', (req, res) => {
	res.render('accueil.ejs');
});

//Route addresse
app.get('/adresse', (req, res) => {
	var cursor = db.collection('adresse').find().toArray(function(err, resultat){
	if (err) return console.log(err);
	res.render('adresse.ejs', {adresse: resultat});
	});
});

//Tri ascendant
app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle
	let ordre = (req.params.ordre == 'asc' ? 1 : -1)
	let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){
		ordre = (req.params.ordre == "asc" ? "desc" : "asc");
		res.render('adresse.ejs', {adresse: resultat, cle, ordre})
	});
});

//Route qui appelle la Fonction peupler_bd
app.get('/peupler', (req, res) => {
	peupler_bd();
	res.redirect('/adresse');
});

const peupler_bd = (req,res) => {
	for (var x=0; x<10; x++)
	{
		let resultat = peupler();
		db.collection('adresse').save(resultat, (err, resultat) => {
			if (err) return console.log(err);
		})
 	}
}

//Route pour vider la BDD
app.get('/vider', (req, res) => {
	db.collection('adresse').drop();
	res.redirect('/adresse');
	return;
});

//Recherche dans la BDD
app.post('/rechercher', (req, res) => {
			db.collection('adresse').find({
			$or:[{"prenom": { '$regex': req.body.rechercher, '$options': 'i'}},
			{"nom": { '$regex': req.body.rechercher, '$options': 'i'}},
			{"courriel": { '$regex': req.body.rechercher, '$options': 'i'}},
			{"telephone": { '$regex': req.body.rechercher, '$options': 'i'}}]
	}).toArray(function(err, resultat) {
		if(err) throw err;
		res.render('adresse.ejs', {adresse: resultat});
	})
});

//Modifier les informations d'un membre avec Ajax
app.post('/modifier_ajax', (req,res) => {
  	req.body._id = ObjectID(req.body._id);
  	db.collection('adresse').save(req.body, (err, result) => {
   	if (err) return console.log(err)
   		console.log('sauvegarder dans la BD');
   		res.send(JSON.stringify(req.body));
  	})
});

//Ajouter un membre à la BDD avec Ajax
app.post('/ajouter_ajax', (req, res) => {
	db.collection('adresse').save(req.body, (err, resultat) => {
		if (err) return console.log(err);
		console.log('sauvegarder dans la BD');
		return resultat;
	});
});

//Supprimer un membre de la BDD avec Ajax
app.get('/supprimer_ajax/:id', (req, res) => {
	var id = req.params.id;
	db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {
		if (err) return console.log(err);
	});
});
