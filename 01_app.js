"use strict";

const peupler = require("./mes_modules/peupler");
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('./mes_modules/chat_socket').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

let db // variable qui contiendra le lien sur la BD
MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 	if (err) return console.log(err);
 	db = database.db('carnet_adresse');

// lancement du serveur Express sur le port 8081
server.listen(8081, (err) => {
 	if (err) console.log(err);
 	let host = server.address().address;
 	let port = server.address().port;
 	console.log('connexion à la BD et on écoute sur le port ' + port);
 	})
})

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

//Route pour le chat
app.get('/chat', (req, res) => {
	res.render('socket_vue.ejs');
});

//Enregistrer un utilisateur sur le chat avec Ajax
app.post('/enregistrer_ajax', (req, res) => {

	db.collection('chat').insert({"id_utilisateur": req.body.id_utilisateur, "nom": req.body.nom}, (err, resultat) => {
		if (err) return console.log(err);

		let tableauUtilisateur = [];

		db.collection('chat').find().toArray(function(err, resultat){
			if (err) return console.log(err);
			for (let x=0; x<resultat.length;x++){
				tableauUtilisateur.push({"id_utilisateur": resultat[x].id_utilisateur, "nom": resultat[x].nom});
			};
			res.send(JSON.stringify({"tableauUtilisateur":tableauUtilisateur}));
		});
	});
});
