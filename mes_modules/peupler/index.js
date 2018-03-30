"use strict";

const tableau = require("./tableaux.js");

const maxNom = tableau.tabNom.length
const maxPrenom = tableau.tabPrenom.length
const maxTele = tableau.tabTele.length
const maxCourriel = tableau.tabCourriel.length
const peupler = () => {
	let position = Math.floor(Math.random()*maxNom)
	let nom = tableau.tabNom[position]
	position = Math.floor(Math.random()*maxPrenom)
	let prenom = tableau.tabPrenom[position]
	position = Math.floor(Math.random()*maxTele)
	let telephone = tableau.tabTele[position]
	position = Math.floor(Math.random()*maxCourriel)
	let courriel = tableau.tabCourriel[position]

	return {
			nom : nom,
			prenom : prenom,
			telephone : telephone,
			courriel : courriel
			}
}

module.exports = peupler;