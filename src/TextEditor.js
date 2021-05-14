import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

export default function TextEditor() {
	const wrapperRef = useRef();
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();
	const { id: docuementId } = useParams();

	useEffect(() => {
		if (socket == null || quill == null) return;
		socket.once("load-document", (document) => {
			quill.setContents(document);
			quill.enable();
		});
		socket.emit("get-document", docuementId);
	}, [socket, quill, docuementId]);

	useEffect(() => {
		if (socket == null || quill == null) return;
		const interval = setInterval(() => {
			socket.emit("save-document", quill.getContents());
		}, 2000);

		return () => {
			clearInterval(interval);
		};
	}, [socket, quill]);

	useEffect(() => {
		const s = io("https://api-gdocs.herokuapp.com");
		setSocket(s);

		return () => {
			s.disconnect();
		};
	}, []);

	useEffect(() => {
		const editor = document.createElement("div");
		wrapperRef.current.innerHTML = "";
		wrapperRef.current.append(editor);
		const q = new Quill(editor, { theme: "snow" });
		q.disable();
		q.setText("Loading...");
		setQuill(q);
	}, []);

	useEffect(() => {
		if (socket == null || quill == null) return;
		const handler = (delta, oldDelta, source) => {
			if (source !== "user") return;
			socket.emit("send-changes", delta);
		};
		quill.on("text-change", handler);

		return () => {
			quill.off("text-change", handler);
		};
	}, [socket, quill]);

	useEffect(() => {
		if (socket == null || quill == null) return;
		const handler = (delta) => {
			quill.updateContents(delta);
		};
		socket.on("receive-changes", handler);

		return () => {
			socket.off("receive-changes", handler);
		};
	}, [socket, quill]);

	return <div className="container" ref={wrapperRef}></div>;
}
