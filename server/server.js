require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./Document");

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

const io = require("socket.io")(process.env.PORT || 5000, {
	cors: {
		origin: "https://doccs.netlify.app",
		methods: ["GET", "POST"],
	},
});

const defaultValue = "";

io.on("connection", (socket) => {
	socket.on("get-document", async (documentId) => {
		const document = await findOrCreateDocument(documentId);
		socket.join(documentId);
		socket.emit("load-document", document.data);

		socket.on("send-changes", (delta) => {
			socket.broadcast.to(documentId).emit("receive-changes", delta);
		});

		socket.on("save-document", async (data) => {
			await Document.findByIdAndUpdate(documentId, { data });
		});
	});
});

async function findOrCreateDocument(id) {
	if (id == null) return;

	const document = await Document.findById(id);
	if (document) return document;
	return await Document.create({ _id: id, data: defaultValue });
}
