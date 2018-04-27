/*
 * MarkdownEditor
 * Copyright (c) 2015 Alex Titarenko (MIT License)
 */

(function (window) {
    // constructor
    function MarkdownEditorShell(options) {
        var opts = options || {},
            defaultSettings = {
                container: 'MarkdownEditor',
                fullscreenButtonTitle: "Enter Fullscreen",
                previewButtonTitle: "Toggle Preview Mode",
                markdownToHtmlConvertor: function (markdown) { return markdown; },
                additionalButtons: [],
                window: window
            };

        this.toolbar = [
            {
                name: "",
                buttons: [
                    { title: "Bold", className: "glyphicon glyphicon-bold", action: toolbarActions.bold },
                    { title: "Italic", className: "glyphicon glyphicon-italic", action: toolbarActions.italic },
                    { title: "Heading", className: "glyphicon glyphicon-header", action: null }
                ]
            },
            {
                name: "",
                buttons: [
                    { title: "Link", className: "glyphicon glyphicon-link", action: toolbarActions.link },
                    { title: "Image", className: "glyphicon glyphicon-picture", action: toolbarActions.image }
                ]
            },
            {
                name: "",
                buttons: [
                    { title: "Unordered List", className: "glyphicon glyphicon-list", action: toolbarActions.ulist },
                    { title: "Ordered List", className: "glyphicon glyphicon-th-list", action: toolbarActions.olist },
                    { title: "Blockquote", className: "glyphicon glyphicon-comment", action: toolbarActions.quote },
                    { title: "Code", className: "glyphicon glyphicon-asterisk", action: null }
                ]
            }
        ];

        this._state = {};
        this.settings = {
            container: opts.container || defaultSettings.container,
            fullscreenButtonTitle: opts.fullscreenButtonTitle || defaultSettings.fullscreenButtonTitle,
            previewButtonTitle: opts.previewButtonTitle || defaultSettings.previewButtonTitle,
            markdownToHtmlConvertor: opts.markdownToHtmlConvertor || defaultSettings.markdownToHtmlConvertor,
            additionalButtons: opts.additionalButtons || defaultSettings.additionalButtons,
            window: opts.window || defaultSettings.window
        };

        this._elements = {};

        if (typeof this.settings.container === 'string') {
            this._elements.editor = this.settings.window.document.getElementById(this.settings.container);
        }
        else if (typeof this.settings.container === 'object') {
            this._elements.editor = this.settings.container;
        }
    }

    // public
    MarkdownEditorShell.prototype.load = function (callback) {
        _buildEditorShell(this);

        _registerHandlers(this);

        callback = callback || function () { };
        callback.call(this);
    };

    MarkdownEditorShell.prototype.changeMode = function (mode) {
        this._elements.wrapper.setAttribute("data-mode", mode);
        this._updatePreview();
    };

    MarkdownEditorShell.prototype.enterFullscreen = function () {
        if (this.isFullscreenMode()) {
            this.exitFullscreen();
        } else {
            var element = this._elements.wrapper;

            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    };

    MarkdownEditorShell.prototype.exitFullscreen = function () {
        var document = this.settings.window.document;

        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    MarkdownEditorShell.prototype.isFullscreenMode = function() {
        var document = this.settings.window.document;

        return (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) ? true : false;
    };

    // private
    MarkdownEditorShell.prototype._updatePreview = function() {
        var markdownText = this.getContent();
        var htmlText = this.settings.markdownToHtmlConvertor(markdownText);

        this._elements.preview.innerHTML = htmlText;
    };

    MarkdownEditorShell.prototype._renderButtons = function(groups) {
        var result = [];

        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            var groupElement = this._renderButtonsGroup(group);

            result.push(groupElement);
        }

        return result;
    };

    MarkdownEditorShell.prototype._renderButtonsGroup = function(group) {
        var document = this.settings.window.document;
        var groupElement = document.createElement("div");
        var self = this;
        groupElement.setAttribute("class", "btn-group");

        for (var i = 0; i < group.buttons.length; i++) {
            var button = group.buttons[i],
                buttonElement = document.createElement("button");

            if (!button.action) {
                continue;
            }

            buttonElement.setAttribute("type", "button");
            buttonElement.setAttribute("class", "btn btn-default");
            buttonElement.setAttribute("title", button.title);

            var innerElement = document.createElement("span");
            innerElement.setAttribute("class", button.className);

            buttonElement.action = button.action;
            var act = function(action) { return function(e) { action(self); self._updatePreview(); }; };

            buttonElement.addEventListener("click", act(button.action));
            buttonElement.appendChild(innerElement);
            groupElement.appendChild(buttonElement);
        }

        return groupElement;
    };

    MarkdownEditorShell.prototype.getContent = function() {
        return this._elements.editor.value;
    };

    MarkdownEditorShell.prototype.getSelection = function() {
        var editor = this._elements.editor;
        var len = editor.selectionEnd - editor.selectionStart;

        return {
            start: editor.selectionStart,
            end: editor.selectionEnd,
            length: len,
            text: editor.value.substr(editor.selectionStart, len)
        };
    };

    MarkdownEditorShell.prototype.setSelection = function(start, end) {
        var editor = this._elements.editor;

        editor.selectionStart = start;
        editor.selectionEnd = end;
    };

    MarkdownEditorShell.prototype.replaceSelection = function(text) {
        var editor = this._elements.editor;

        editor.value = editor.value.substr(0, editor.selectionStart) + text + editor.value.substr(editor.selectionEnd, editor.value.length);
        editor.selectionStart = editor.value.length;
    };

    var toolbarActions = {
        decorate: function(e, seq, defaultText) {
            var seqLen = seq.length;
            var chunk, cursor, selected = e.getSelection(), content = e.getContent();

            if (selected.length === 0) {
                chunk = defaultText;
            } else {
                chunk = selected.text;
            }

            // transform selection and set the cursor into chunked text
            if (content.substr(selected.start - seqLen, seqLen) === seq
                && content.substr(selected.end, seqLen) === seq) {
                e.setSelection(selected.start - seqLen, selected.end + seqLen);
                e.replaceSelection(chunk);
                cursor = selected.start - seqLen;
            } else {
                e.replaceSelection(seq + chunk + seq);
                cursor = selected.start + seqLen;
            }

            // Set the cursor
            e.setSelection(cursor, cursor + chunk.length);
        },

        prependToSelection: function (e, seq, defaultText) {
            var chunk, cursor, selected = e.getSelection(), seqLen = seq.length;

            // transform selection and set the cursor into chunked text
            if (selected.length === 0) {
                chunk = defaultText;

                e.replaceSelection(seq + chunk);
                // Set the cursor
                cursor = selected.start + seqLen;
            } else {
                if (selected.text.indexOf('\n') < 0) {
                    chunk = selected.text;

                    e.replaceSelection(seq + chunk);

                    // Set the cursor
                    cursor = selected.start + seqLen;
                } else {
                    var list = [];

                    list = selected.text.split('\n');
                    chunk = list[0];

                    list.forEach(function (v, k) {
                        list[k] = seq + v;
                    });

                    e.replaceSelection('\n\n' + list.join('\n'));

                    // Set the cursor
                    cursor = selected.start + seqLen + 2;
                }
            }
        },

        bold: function (e) {
            toolbarActions.decorate(e, "**", "Strong text");
        },

        italic: function (e) {
            toolbarActions.decorate(e, "_", "Emphasized text");
        },

        heading: function (e) {

        },

        link: function (e) {
            var chunk, cursor, selected = e.getSelection(), link;

            if (selected.length === 0) {
                chunk = "Enter link description here";
            } else {
                chunk = selected.text;
            }

            link = e.settings.window.prompt("Insert Hyperlink", 'http://');

            if (link !== null && link !== '' && link !== 'http://' && link.substr(0, 4) === 'http') {
                var sanitizedLink = link;

                // transform selection and set the cursor into chunked text
                e.replaceSelection('[' + chunk + '](' + sanitizedLink + ')');
                cursor = selected.start + 1;

                // Set the cursor
                e.setSelection(cursor, cursor + chunk.length);
            }
        },

        image: function (e) {
            var chunk, cursor, selected = e.getSelection(), link;

            if (selected.length === 0) {
                chunk = 'Enter image description here';
            } else {
                chunk = selected.text;
            }

            link = e.settings.window.prompt('Insert Image Hyperlink', 'http://');

            if (link !== null && link !== '' && link !== 'http://' && link.substr(0, 4) === 'http') {
                var sanitizedLink = link;

                // transform selection and set the cursor into chunked text
                e.replaceSelection('![' + chunk + '](' + sanitizedLink + ' "' + 'Enter image title here' + '")');
                cursor = selected.start + 2;

                // Set the cursor
                e.setSelection(cursor, cursor + chunk.length);
            }
        },

        ulist: function (e) {
            toolbarActions.prependToSelection(e, "- ", "List text here");
        },

        olist: function (e) {
            toolbarActions.prependToSelection(e, "1. ", "List text here");
        },

        quote: function (e) {
            toolbarActions.prependToSelection(e, "> ", "Quote here");
        },

        code: function (e) {

        }
    };


    function _buildEditorShell(self) {
        var document = self.settings.window.document;

        // create wrapper
        var wrapElement = document.createElement("div");
        wrapElement.setAttribute("class", "markdown-editor-wrapper");
        self._elements.wrapper = wrapElement;

        wrapElement.innerHTML =
            "<div class='markdown-editor-header btn-toolbar'>" +
            '<div class="btn-group markdown-editor-modes" data-toggle="buttons"><label class="btn btn-default active" data-me-mode="editor" title="Editor"><input type="radio" name="markdownEditorMode" value="Editor" checked><span class="glyphicon glyphicon-pencil"></span></label><label class="btn btn-default" data-me-mode="preview" title="Preview"><input type="radio" name="markdownEditorMode" value="Preview"><span class="glyphicon glyphicon-eye-open"></span></label><label class="btn btn-default" data-me-mode="split" title="Split mode"><input type="radio" name="markdownEditorMode" value="Split"><span class="glyphicon glyphicon-adjust"></span></label></div>' +

            "<div class='btn-group'><button type='button' class='btn btn-primary markdowneditor-fullscreen-btn' title='" + self.settings.fullscreenButtonTitle + "'><span class='glyphicon glyphicon-fullscreen'></span></button></div>" +
            "</div>";

        var rowElement = document.createElement("div");
        rowElement.setAttribute("class", "markdown-editor-row");

        var previewElement = document.createElement("div");
        previewElement.setAttribute("class", "markdown-editor-preview");
        self._elements.preview = previewElement;

        var parent = self._elements.editor.parentNode;
        var sibling = self._elements.editor.nextSibling;
        rowElement.appendChild(self._elements.editor);
        rowElement.appendChild(previewElement);

        wrapElement.appendChild(rowElement);

        if (sibling) {
            parent.insertBefore(wrapElement, sibling);
        } else {
            parent.appendChild(wrapElement);
        }

        // build toolbar
        var toolbarElement = wrapElement.getElementsByClassName("markdown-editor-header")[0];
        var buttonGroups = self._renderButtons(self.toolbar.concat(self.settings.additionalButtons || []));
        for (var i = 0; i < buttonGroups.length; i++) {
            toolbarElement.insertBefore(buttonGroups[i], toolbarElement.childNodes[toolbarElement.childNodes.length - 1]);
        }
    }

    function _registerHandlers(self) {
        var wrapElement = self._elements.wrapper,
            window = self.settings.window;

        var fullscreenButton = wrapElement.getElementsByClassName("markdowneditor-fullscreen-btn")[0];

        fullscreenButton.addEventListener('click', function (e) {
            self.enterFullscreen();
        });

        var modeElements = wrapElement.querySelectorAll(".markdown-editor-modes label.btn");
        for (var i = 0; i < modeElements.length; i++) {
            modeElements[i].addEventListener('click', function (e) {
                self.changeMode(e.currentTarget.getAttribute("data-me-mode"));
            });
        }

        var keypressTimer;
        function onTextChange() {
            if (keypressTimer) {
                window.clearTimeout(keypressTimer);
            }
            keypressTimer = window.setTimeout(function () {
                self._updatePreview();
            }, 250);
        }

        self._elements.editor.addEventListener("input", onTextChange);
    }

    window.MarkdownEditorShell = MarkdownEditorShell;
})(window);