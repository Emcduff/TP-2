let socketio = require('socket.io');

module.exports.listen = function(server){
    let io = socketio.listen(server);

    io.on('connection', function(socket){
    	console.log('connected');

    	socket.on('ajouterUtilisateur', function(data){
    		console.log('ajouterUtilisateur');
    		socket.broadcast.emit('nouvUtilisateur', [data.utilisateur, data.id]);
    	});

	});
 return io;
}
