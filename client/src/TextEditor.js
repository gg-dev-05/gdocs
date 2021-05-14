import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

export default function TextEditor() {
	const wrapperRef = useRef();
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();

	useEffect(() => {
		const s = io("http://localhost:5000");
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
