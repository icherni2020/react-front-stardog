# react-front-stardog

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1) tout d'abord faut installer sur le PC npm et node dna votre environnement.

2) vérifier si npm et node sont bien installés avec les deux commandes # npm -v # et # node -v #

dans ce dossier react-front-stardog vous allez trouver tous les documents qu'on utilisés : 

web-facebook.ttl : la base de données rdf 

liste utilisateurs test facebook : une table qui contient un ensemble des utilisateurs test que vous pouvez utiliser pour se connecter

à facebook et récupérer les données.

requests.txt : un fichier texte ou il y a les requetes sparql qu'on utilisé dans notre projet => pour chaque requete il y a 

le résultat attendu

request_summary : un fichier qui résume les données qu'on récupére de Facebook et leurs transformations en triplets RDF

ethaninfo.txt : un exemple d'utilisateur sous formet de RDF, ce fichier nous a permi d'écrire les requetes dans react et transformer

les données qu'on recoit de l'api Facebook en triplet RDF

3) après avoir pris connaissance de tous ces documents. ouvrez le terminal et on dirigez vous au dossier web-semantique où on va 

lancer toutes les commandes.

4) lancer # npm install # pour installer toutes les dépendences du projets.

NB: j'ai mis un fichier package.json-dist ou il y a toutes les dépendences nécessaires pour le lancement du projet en cas de soucis
d'environnement vous pouvez utiliser ce fichier et remplacer package.json qui existe en supprimant le mot dist mais 
cela sera fait qu'en cas de souci

5) lancer # npm start # dans le dossier web-semantique.

6) ouvrir startdog et connectez vous au serveur http://localhost:5820 avec la configuration admin / admin : 
si vous avez une autre configuration de votre serveur stardog veuillez modifier le fichier constants.js qui existe dans le repertoire 
web-semantique/src/helpers : 

veuillez changer cette variable en cas d'avoir un autre serveur stardog différents que cette configuration :


const conn = new Connection({
  username: "admin",
  password: "admin",
  endpoint: "http://localhost:5820"
});

7) créer une database dans startdog avec le nom "web-facebook" et appuyer sur load data. vous allez utiliser comme 
fichier : web-facebook.ttl que je vais ai mis dans ce repertoire

8) veuiller modifier dans namespaces de la base de données que vous avez crée :

prefix : foaf   URI: http://xmlns.com/foaf/spec/#OnlineChatAccount
prefix : sioc   URI: http://rdfs.org/sioc/ns#

ne pas oublier de sauvegarder les changements 

au cas ou vous avez choisi un nom différent de base de données veuillez renseigner ce nom dans le fichier constants.js dans cette
partie :

module.exports = {
  dbName: 'web-facebook',   <= en changeant cette variable.
  columnData,
  columnSelectors,
  conn,
  TableDataAvailabilityStatus,
};

9) après avoir bien configurée stardog et maintenant le serveur du front il tourne vous pouvez naviguer dans l'applicationet 
effectuer une connexion dans l'interface.

10) je vous ai fourni dans le fichier utilisateurs tests facebook des comptes facebook tests utilisez en un et connecter vous

11) merci pour avoir suivi ces étapes.

Comme je vous ai expliqué dans la vidéo, il y a un souci dans l'affichage des requetes les deux premières requetes envoi des 
resultats conformes pour les autres il y a un souci avec la communication entre les composants de react mais j'ai essayé 
pour faire au mieux l'affichage des résultats.




