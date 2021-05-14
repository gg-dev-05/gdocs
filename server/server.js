const io = require("socket.io")(5000, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	socket.on("send-changes", (delta) => {
		socket.broadcast.emit("receive-changes", delta);
	});
});
