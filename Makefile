build-oscal-editor:
	docker build \
	 -f easy-dynamics/oscal-editor-deployment/all-in-one/Dockerfile \
	 -t oscal-editor .

run-oscal-editor:
	docker run -p 8080:8080 \
		-v "$(shell pwd)"/db/oscal-content:/app/oscal-content oscal-editor
