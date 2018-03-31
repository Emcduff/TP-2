let socketio = require('socket.io');

module.exports.listen = function(server){
    let io = socketio.listen(server);

    io.on('connection', function(socket){
    	console.log('connected');

    	socket.on('ajouterUtilisateur', function(data){
    		console.log('ajouterUtilisateur');
    		socket.broadcast.emit('nouvUtilisateur', [data.id, data.utilisateur]);
    	});

    	socket.on('messagePublique', function(data) {
	   		io.sockets.emit('afficherMessage', data);
	   	});

	   	socket.on('deconnexion', function(data) {
    		console.log(socket.id);
	    	io.sockets.emit('deconnecter', socket.id);
	    	db.collection('chat').findOneAndDelete( {'id': socket.id});
		});

	});
	return io;
}
